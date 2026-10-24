import io
import asyncio
import json
import struct
import wave

import pytest
from fastapi.testclient import TestClient

from src import main
from src import logic as logic_module
from src.logic import DJMasterLogic


def wav_bytes(seconds=0.25, sample_rate=8000):
    stream = io.BytesIO()
    with wave.open(stream, "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(sample_rate)
        samples = [int(7000 * ((index % 32) / 32 - 0.5)) for index in range(int(seconds * sample_rate))]
        output.writeframes(b"".join(struct.pack("<h", sample) for sample in samples))
    return stream.getvalue()


@pytest.fixture
def client(tmp_path):
    main.logic = DJMasterLogic(tmp_path)
    with TestClient(main.app) as test_client:
        yield test_client


def test_draft_save_reload_keeps_two_groups_and_advances_version(client):
    assert client.post("/api/draft").status_code == 200
    initial = client.get("/api/draft").json()
    assert set(initial["groups"]) == {"A", "B"}
    assert len(initial["groups"]["A"]["songs"]) == 2
    assert [song["performanceStart"] for song in initial["groups"]["A"]["songs"]] == [0, 0]
    initial["groups"]["A"]["events"].append({
        "id": "event-one", "type": "dj", "kind": "reverse", "name": "搓碟倒放",
        "time": 8, "duration": 4, "sourceTrack": 0, "sourceTime": 6,
        "sourceStart": 6, "sourceEnd": 4, "reverseSeconds": 2,
        "extraSeconds": 2, "verification": "audio",
    })
    saved = client.put("/api/draft", json={"project": initial})
    assert saved.status_code == 200
    assert saved.json()["version"] == 1
    assert saved.json()["updatedAt"]
    assert client.get("/api/draft").json()["groups"]["A"]["events"][0]["sourceEnd"] == 4


def test_audio_import_stores_local_asset_and_streams_its_bytes(client):
    audio = wav_bytes()
    imported = client.post("/api/audio/import", files={"file": ("../../night.wav", audio, "audio/wav")})
    assert imported.status_code == 200
    asset = imported.json()
    assert asset["filename"] == "night.wav"
    assert asset["size"] == len(audio)
    response = client.get(asset["url"])
    assert response.status_code == 200
    assert response.content == audio
    assert response.headers["content-type"] == "audio/wav"


def test_rejects_invalid_formats_and_asset_paths(client, tmp_path):
    wrong_extension = client.post("/api/audio/import", files={"file": ("song.txt", b"RIFFxxxxWAVE", "audio/wav")})
    wrong_signature = client.post("/api/audio/import", files={"file": ("song.wav", b"not a wav", "audio/wav")})
    assert wrong_extension.status_code == 415
    assert wrong_signature.status_code == 415
    assert client.get("/api/audio/../draft.json").status_code == 404
    assert client.get("/api/audio/" + "0" * 32).status_code == 404

    invalid = client.put("/api/draft", json={"project": {"id": "../../draft.json", "groups": {}}})
    assert invalid.status_code == 422
    non_finite = client.get("/api/draft").json()
    non_finite["groups"]["A"]["transition"]["overlap"] = float("nan")
    assert client.put("/api/draft", content=json.dumps({"project": non_finite}, allow_nan=True), headers={"Content-Type": "application/json"}).status_code == 422
    assert not (tmp_path.parent / "draft.json").exists()


def test_audio_import_enforces_the_150_mb_limit(client, monkeypatch):
    monkeypatch.setattr(logic_module, "MAX_AUDIO_BYTES", 32)
    response = client.post("/api/audio/import", files={"file": ("large.wav", wav_bytes(), "audio/wav")})
    assert response.status_code == 413


def test_sse_emits_connected_and_saved_state_events(client):
    response = asyncio.run(main.stream_state())
    assert response.media_type == "text/event-stream"

    async def read_events():
        frames = response.body_iterator
        connected_frame = await frames.__anext__()
        connected = json.loads(connected_frame.decode().removeprefix("data: ").strip() if isinstance(connected_frame, bytes) else connected_frame.removeprefix("data: ").strip())
        main.logic.publish({"kind": "saved", "version": 1})
        saved_frame = await frames.__anext__()
        saved = json.loads(saved_frame.decode().removeprefix("data: ").strip() if isinstance(saved_frame, bytes) else saved_frame.removeprefix("data: ").strip())
        await frames.aclose()
        return connected, saved

    connected, saved = asyncio.run(read_events())
    assert connected["kind"] == "connected"
    assert saved["kind"] == "saved"
    assert saved["version"] == 1


def test_demo_seed_returns_unsaved_candidate_and_preserves_existing_groups(client):
    saved = client.get("/api/draft").json()
    saved["title"] = "My set"
    saved["groups"]["B"]["name"] = "Keep B"
    saved["groups"]["B"]["events"].append({
        "id": "b-marker", "type": "marker", "name": "Keep me", "time": 2,
        "duration": 0, "sourceTrack": 0,
    })
    saved = client.put("/api/draft", json={"project": saved}).json()
    response = client.post("/api/demo/seed")
    assert response.status_code == 200
    project = response.json()
    group = project["groups"]["A"]
    assert project["version"] == saved["version"]
    assert project["updatedAt"] == saved["updatedAt"]
    assert project["groups"]["B"] == saved["groups"]["B"]
    assert client.get("/api/draft").json() == saved
    assert [song["title"] for song in group["songs"]] == ["Night Drive", "After Hours"]
    assert [song["bpm"] for song in group["songs"]] == [120, 120]
    assert group["transition"]["overlap"] == 8
    assert {event["name"] for event in group["events"]} >= {"滤波渐入", "低频收拢", "搓碟倒放"}
    assert not any(event.get("operation", {}).get("id") == "loop-4" for event in group["events"])
    crossfader_event = next(event for event in group["events"] if event.get("operation", {}).get("id") == "crossfader")
    assert crossfader_event["operation"]["controller"]["control"] == "XFADER"
    assert (crossfader_event["sourceTrack"], crossfader_event["sourceTime"], crossfader_event["trackTime"], crossfader_event["time"], crossfader_event["duration"]) == (1, 26, 26, 26, 8)
    assert crossfader_event["parameters"]["value"] == 1
    assert crossfader_event["operation"]["preview"] == "audio-crossfader"
    assert crossfader_event["operation"]["execution"] == "preview-audio"
    reverse = next(event for event in group["events"] if event.get("kind") == "reverse")
    assert (reverse["time"], reverse["sourceStart"], reverse["sourceEnd"], reverse["extraSeconds"]) == (19, 19, 18, 2)
    # A single robot needs the gap across all lanes and both decks, and the
    # reverse replay is still occupied time even though duration is only 1s.
    operations = sorted((event for event in group["events"] if event.get("operation")), key=lambda event: event["time"])
    assert len(operations) == 5
    assert len({event["operation"]["id"] for event in operations}) == 5
    assert operations[0]["time"] >= 5
    for previous, current in zip(operations, operations[1:]):
        occupied = previous["extraSeconds"] if previous.get("kind") == "reverse" else previous["duration"]
        assert current["time"] - (previous["time"] + occupied) >= 5
    assert operations[-1]["time"] + operations[-1]["duration"] <= 45
    level = operations[-1]
    assert (level["sourceTrack"], level["sourceTime"], level["trackTime"], level["time"]) == (1, 42, 42, 42)
    first_duration = group["songs"][0]["end"] - group["songs"][0]["start"]
    second_duration = group["songs"][1]["end"] - group["songs"][1]["start"]
    assert [song["performanceStart"] for song in group["songs"]] == [0, 0]
    assert [song["duration"] for song in group["songs"]] == [58, 58]
    assert first_duration == 56
    assert second_duration == 58
    assert first_duration + reverse["extraSeconds"] == 58
    assert max(group["songs"][0]["performanceStart"] + first_duration + reverse["extraSeconds"], group["songs"][1]["performanceStart"] + second_duration) == 58
    marker = next(event for event in group["events"] if event["id"] == "demo-marker-a")
    assert (marker["time"], marker["sourceTime"]) == (22, 20)
    for song in group["songs"]:
        assert len(song["waveform"]) == 256
        assert max(song["waveform"]) > 0.1
        asset_response = client.get(f"/api/audio/{song['assetId']}")
        assert asset_response.status_code == 200
        assert asset_response.headers["content-type"] == "audio/wav"
        assert asset_response.content[:4] == b"RIFF"
        with wave.open(io.BytesIO(asset_response.content), "rb") as audio:
            assert audio.getframerate() == 22050
            assert audio.getnchannels() == 2
            assert audio.getnframes() == 58 * 22050

    saved_candidate = client.put("/api/draft", json={"project": project}).json()
    assert saved_candidate["version"] == saved["version"] + 1
    reloaded = client.get("/api/draft").json()
    assert reloaded == saved_candidate
    assert [song["waveform"] for song in reloaded["groups"]["A"]["songs"]] == [song["waveform"] for song in group["songs"]]
    assert reloaded["groups"]["B"] == saved["groups"]["B"]


def test_demo_seed_upgrades_stale_audio_and_emits_ready_event(client, tmp_path):
    stale_id = logic_module.DEMO_ASSETS[0][0]
    stale_path = tmp_path / "audio" / f"{stale_id}.wav"
    stale_path.write_bytes(wav_bytes(seconds=32, sample_rate=8000))
    main.logic._assets[stale_id] = {
        "id": stale_id, "filename": "night-drive-demo.wav", "contentType": "audio/wav",
        "size": stale_path.stat().st_size, "url": f"/api/audio/{stale_id}",
        "importedAt": "2026-10-01T00:00:00+00:00", "extension": ".wav",
    }
    main.logic._write_json(main.logic.assets_path, main.logic._assets)
    async def subscribe():
        return main.logic.subscribe()

    queue = asyncio.run(subscribe())
    queue.get_nowait()
    try:
        first = client.post("/api/demo/seed").json()
        event = queue.get_nowait()
        assert event["kind"] == "demo_ready"
        assert event["duration"] == 58
        with wave.open(str(stale_path), "rb") as audio:
            assert audio.getframerate() == 22050
        audio_bytes = stale_path.read_bytes()
        second = client.post("/api/demo/seed").json()
        assert second == first
        assert stale_path.read_bytes() == audio_bytes
        assert client.get("/api/draft").json()["version"] == 0
    finally:
        main.logic.unsubscribe(queue)

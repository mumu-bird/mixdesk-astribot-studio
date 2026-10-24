from __future__ import annotations

import asyncio
import json
import math
import os
import re
import tempfile
import uuid
import wave
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import HTTPException, UploadFile

MAX_AUDIO_BYTES = 150 * 1024 * 1024
ALLOWED_EXTENSIONS = {".mp3", ".wav", ".flac"}
ASSET_ID_RE = re.compile(r"^[0-9a-f]{32}$")

# Stable ids keep the built-in one-minute demonstration idempotent.  The
# generated files are ordinary PCM WAVs so the browser can decode them without
# an extra codec and the user can replace them with their own music later.
DEMO_SAMPLE_RATE = 22050
DEMO_DURATION = 58.0
DEMO_CONFIG = "v3-120bpm-22050hz-dual-start"
DEMO_ASSETS = (
    ("8b7f4a24be2b4e6f8f5d7a8c9e1b2d30", "Night Drive", "night-drive-demo.wav", 0),
    ("c4f2a9d11e6b47a8a2d3c5f7b9e0a146", "After Hours", "after-hours-demo.wav", 1),
)


def _demo_wav_bytes(variant: int, duration: float = DEMO_DURATION, sample_rate: int = DEMO_SAMPLE_RATE) -> bytes:
    """Generate a deterministic, musical stereo loop for the local demo.

    It deliberately uses only the Python standard library.  The result is
    long enough to hear the full 8-second equal-power transition and remains
    small enough to generate instantly on app startup.
    """
    frames = int(duration * sample_rate)
    beat = 60.0 / 120.0
    data = bytearray(frames * 4)
    seed = 0x12345678 + variant * 0x10203

    def noise() -> float:
        nonlocal seed
        seed = (1664525 * seed + 1013904223) & 0xFFFFFFFF
        return (seed / 4294967296.0) * 2.0 - 1.0

    roots = ((65.41, 77.78, 87.31, 77.78), (130.82, 155.56, 174.62, 155.56))[variant]
    import struct

    for index in range(frames):
        t = index / sample_rate
        beat_index = int(t / beat)
        phase = t - beat_index * beat
        half_phase = t % (beat / 2.0)
        root = roots[(beat_index // 8) % len(roots)]
        kick = math.sin(2.0 * math.pi * (48.0 * phase + 9.0 * (1.0 - math.exp(-phase * 35.0)))) * math.exp(-phase * 17.0) * 0.52
        hat = noise() * math.exp(-half_phase * 105.0) * (0.095 if beat_index % 2 else 0.06)
        clap = noise() * math.exp(-phase * 40.0) * (0.13 if beat_index % 2 else 0.0)
        bass = math.sin(2.0 * math.pi * root * t) * min(1.0, phase * 90.0) * math.exp(-phase * 5.0) * 0.22
        chord = (math.sin(2.0 * math.pi * root * 4.0 * t) + math.sin(2.0 * math.pi * root * 5.0 * t) + math.sin(2.0 * math.pi * root * 6.0 * t)) * 0.032
        pad = math.sin(2.0 * math.pi * (root * (1.5 if variant else 1.25)) * t) * 0.024
        fade = min(1.0, t * 30.0, (duration - t) * 30.0)
        left = max(-0.98, min(0.98, (kick + hat + clap + bass + chord + pad) * fade))
        right = max(-0.98, min(0.98, (kick - hat * 0.72 + clap + bass + chord * 0.9 - pad * 0.35) * fade))
        struct.pack_into("<hh", data, index * 4, int(left * 32767), int(right * 32767))

    output = tempfile.SpooledTemporaryFile(max_size=len(data) + 4096)
    with wave.open(output, "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(data)
    output.seek(0)
    return output.read()


def _valid_demo_wav(path: Path) -> bool:
    try:
        with wave.open(str(path), "rb") as audio:
            return (
                audio.getnchannels() == 2
                and audio.getsampwidth() == 2
                and audio.getframerate() == DEMO_SAMPLE_RATE
                and audio.getnframes() == int(DEMO_DURATION * DEMO_SAMPLE_RATE)
            )
    except (OSError, EOFError, wave.Error):
        return False


def _demo_waveform(path: Path, points: int = 256) -> list[float]:
    import struct

    with wave.open(str(path), "rb") as audio:
        frames = audio.getnframes()
        samples = audio.readframes(frames)
    values = []
    for point in range(points):
        start = point * frames // points
        end = (point + 1) * frames // points
        stride = max(1, (end - start) // 96)
        peak = 0
        for frame in range(start, end, stride):
            left, right = struct.unpack_from("<hh", samples, frame * 4)
            peak = max(peak, abs(left), abs(right))
        values.append(round(peak / 32768, 4))
    return values


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _default_project() -> dict[str, Any]:
    def group(group_id: str, name: str) -> dict[str, Any]:
        return {
            "id": group_id,
            "name": name,
            "songs": [
                {"assetId": None, "title": "", "duration": 0, "bpm": None, "start": 0, "end": 0, "performanceStart": 0},
                {"assetId": None, "title": "", "duration": 0, "bpm": None, "start": 0, "end": 0, "performanceStart": 0},
            ],
            "order": [0, 1],
            "transition": {"overlap": 8, "curve": "equalPower"},
            "events": [],
        }

    return {
        "id": "main",
        "title": "DJ Master 预排",
        "version": 0,
        "updatedAt": None,
        "groups": {"A": group("A", "Neon Pulse"), "B": group("B", "Amber Drift")},
    }


def _validate_project(value: Any) -> dict[str, Any]:
    if not isinstance(value, dict) or value.get("id") != "main":
        raise HTTPException(422, "项目数据格式无效")
    groups = value.get("groups")
    if not isinstance(groups, dict) or set(groups) != {"A", "B"}:
        raise HTTPException(422, "项目必须包含 A、B 两组")
    for group_id, group in groups.items():
        if not isinstance(group, dict) or group.get("id") != group_id:
            raise HTTPException(422, f"{group_id} 组格式无效")
        songs = group.get("songs")
        if not isinstance(songs, list) or len(songs) != 2:
            raise HTTPException(422, f"{group_id} 组必须包含两个曲目槽位")
        order = group.get("order", [0, 1])
        if order not in ([0, 1], [1, 0]):
            raise HTTPException(422, f"{group_id} 组曲目顺序无效")
        for song in songs:
            if not isinstance(song, dict):
                raise HTTPException(422, "曲目数据格式无效")
            asset_id = song.get("assetId")
            if asset_id is not None and (not isinstance(asset_id, str) or not ASSET_ID_RE.fullmatch(asset_id)):
                raise HTTPException(422, "曲目引用格式无效")
            for key in ("duration", "start", "end", "performanceStart"):
                number = song.get(key, 0)
                if isinstance(number, bool) or not isinstance(number, (int, float)) or not math.isfinite(number) or number < 0 or number > 24 * 60 * 60:
                    raise HTTPException(422, f"曲目 {key} 超出有效范围")
            bpm = song.get("bpm")
            if bpm is not None and (isinstance(bpm, bool) or not isinstance(bpm, (int, float)) or not math.isfinite(bpm) or not 20 <= bpm <= 300):
                raise HTTPException(422, "BPM 超出有效范围")
            song["title"] = str(song.get("title", ""))[:200]
        transition = group.get("transition", {})
        overlap = transition.get("overlap", 8) if isinstance(transition, dict) else None
        if isinstance(overlap, bool) or not isinstance(overlap, (int, float)) or not math.isfinite(overlap) or not 0 <= overlap <= 120:
            raise HTTPException(422, "转场重叠时间超出有效范围")
        events = group.get("events")
        if not isinstance(events, list) or len(events) > 2000:
            raise HTTPException(422, "事件数据无效或数量过多")
        for event in events:
            if not isinstance(event, dict) or event.get("type") not in {"dj", "action", "fx", "marker"}:
                raise HTTPException(422, "事件类型无效")
            source_track = event.get("sourceTrack", 0)
            if isinstance(source_track, bool) or source_track not in (0, 1):
                raise HTTPException(422, "事件曲目引用无效")
            for key in ("time", "duration"):
                number = event.get(key, 0)
                if isinstance(number, bool) or not isinstance(number, (int, float)) or not math.isfinite(number) or number < 0 or number > 24 * 60 * 60:
                    raise HTTPException(422, f"事件 {key} 超出有效范围")
            for key in ("sourceTime", "sourceStart", "sourceEnd", "reverseSeconds", "extraSeconds"):
                number = event.get(key)
                if number is not None and (isinstance(number, bool) or not isinstance(number, (int, float)) or not math.isfinite(number) or abs(number) > 24 * 60 * 60):
                    raise HTTPException(422, f"事件 {key} 超出有效范围")
    cleaned = {
        "id": "main",
        "title": str(value.get("title", "DJ Master 预排"))[:200],
        "version": int(value.get("version", 0)) if isinstance(value.get("version", 0), int) else 0,
        "updatedAt": value.get("updatedAt"),
        "groups": groups,
    }
    return cleaned


class DJMasterLogic:
    """Local project and audio asset storage for the DJ Master app."""

    def __init__(self, data_dir: str | Path | None = None) -> None:
        configured = data_dir or os.environ.get("DJ_MASTER_DATA_DIR")
        self.data_dir = Path(configured).expanduser() if configured else Path.home() / ".local/share/astribot/apps/dj-master"
        self.audio_dir = self.data_dir / "audio"
        self.project_path = self.data_dir / "draft.json"
        self.assets_path = self.data_dir / "assets.json"
        self.audio_dir.mkdir(parents=True, exist_ok=True)
        self._subscribers: set[asyncio.Queue[dict[str, Any]]] = set()
        self._assets: dict[str, dict[str, Any]] = self._read_json(self.assets_path, {})
        if not self.project_path.exists():
            self._write_json(self.project_path, _default_project())

    @staticmethod
    def _read_json(path: Path, fallback: Any) -> Any:
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return fallback

    @staticmethod
    def _write_json(path: Path, value: Any) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        fd, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as stream:
                json.dump(value, stream, ensure_ascii=False, indent=2)
                stream.flush()
                os.fsync(stream.fileno())
            os.replace(temp_name, path)
        finally:
            if os.path.exists(temp_name):
                os.unlink(temp_name)

    def get_draft(self) -> dict[str, Any]:
        stored = self._read_json(self.project_path, _default_project())
        try:
            return _validate_project(stored)
        except HTTPException:
            return _default_project()

    def create_draft(self) -> dict[str, Any]:
        if not self.project_path.exists():
            self._write_json(self.project_path, _default_project())
        return self.get_draft()

    def seed_demo(self) -> dict[str, Any]:
        """Prepare a demo candidate without replacing the saved draft."""
        assets_changed = False
        for asset_id, title, filename, variant in DEMO_ASSETS:
            extension = ".wav"
            path = self.audio_dir / f"{asset_id}{extension}"
            previous = self._assets.get(asset_id, {})
            if previous.get("demoConfig") != DEMO_CONFIG or not _valid_demo_wav(path):
                fd, temp_name = tempfile.mkstemp(prefix=".demo-", dir=self.audio_dir)
                try:
                    with os.fdopen(fd, "wb") as stream:
                        stream.write(_demo_wav_bytes(variant))
                        stream.flush()
                        os.fsync(stream.fileno())
                    os.replace(temp_name, path)
                finally:
                    if os.path.exists(temp_name):
                        os.unlink(temp_name)
            asset = {
                "id": asset_id, "filename": filename, "contentType": "audio/wav",
                "size": path.stat().st_size, "url": f"/api/audio/{asset_id}",
                "importedAt": previous.get("importedAt") or _now(), "extension": extension,
                "demoConfig": DEMO_CONFIG, "waveform": _demo_waveform(path),
            }
            if asset != previous:
                self._assets[asset_id] = asset
                assets_changed = True
        if assets_changed:
            self._write_json(self.assets_path, self._assets)

        first = self._assets[DEMO_ASSETS[0][0]]
        second = self._assets[DEMO_ASSETS[1][0]]
        def song(asset: dict[str, Any], title: str, end: float = DEMO_DURATION) -> dict[str, Any]:
            return {
                "assetId": asset["id"], "title": title, "filename": asset["filename"],
                "size": asset["size"], "duration": DEMO_DURATION, "bpm": 120,
                "bpmSource": "demo", "beatOffset": 0, "start": 0, "end": end,
                "performanceStart": 0,
                "waveform": asset["waveform"],
            }
        def operation(op_id: str, group: str, action: str, parameters: dict[str, Any],
                      lane: str, timing: str, duration: float, track: int,
                      preview: str | None = None) -> dict[str, Any]:
            controls = {
                "filter-sweep": ("FILTER_A", "FILTER_B", "auto temporary"),
                "bass-cut": ("LOW_A", "LOW_B", "+0"),
                "scratch-reverse": ("JOG_SCRATCH_A", "JOG_SCRATCH_B", "auto"),
                "channel-level": ("VOL_A", "VOL_B", "auto"),
                "crossfader": ("XFADER", "XFADER", "-16383"),
            }.get(op_id, (op_id, op_id, "auto"))
            is_deck_command = controls[0] != "XFADER"
            return {
                "id": op_id, "group": group, "action": action,
                "parameters": dict(parameters), "timing": timing,
                "controller": {
                    "device": "Hercules DJControl MIX", "mapping": "DJControl_Mix.djm",
                    "deck": "A" if is_deck_command and track == 0 else "B" if is_deck_command else None,
                    "control": controls[track if is_deck_command else 0],
                    "channel": track + 1 if is_deck_command else 0,
                    "mappingValue": controls[2],
                },
                "controlMap": "DJControl_Mix.djm", "preview": preview or "command-only",
                "execution": "preview-audio" if preview else "not-connected",
                "lane": lane, "duration": duration,
            }
        # Leave at least five seconds between complete control operations.
        # Reverse includes both the backward pass and the forward replay.
        events = [
            {"id": "demo-filter-a", "type": "fx", "name": "滤波渐入", "timing": "duration", "duration": 2, "sourceTrack": 0, "sourceTime": 5, "trackTime": 5, "time": 5, "resource": "set_pass_filter_amount", "verification": "mapping-confirmed", "parameters": {"amount": -0.7}, "operation": operation("filter-sweep", "mix", "set_pass_filter_amount", {"amount": -0.7, "temporary": True}, "fx", "duration", 2, 0, "audio-filter")},
            {"id": "demo-bass-a", "type": "fx", "name": "低频收拢", "timing": "duration", "duration": 2, "sourceTrack": 0, "sourceTime": 12, "trackTime": 12, "time": 12, "resource": "bass", "verification": "mapping-confirmed", "parameters": {"value": -12}, "operation": operation("bass-cut", "mix", "bass", {"value": -12}, "fx", "duration", 2, 0, "audio-eq")},
            {"id": "demo-reverse-a", "type": "dj", "kind": "reverse", "name": "搓碟倒放", "duration": 1, "reverseSeconds": 1, "extraSeconds": 2, "sourceTrack": 0, "sourceTime": 19, "sourceStart": 19, "sourceEnd": 18, "trackTime": 19, "time": 19, "resource": "scratch", "verification": "audio", "parameters": {"seconds": 1}, "operation": operation("scratch-reverse", "performance", "scratch", {"direction": "reverse", "seconds": 1}, "dj", "duration", 1, 0, "reverse-segment")},
            {"id": "demo-marker-a", "type": "marker", "name": "段落标记 · 进入转场", "duration": 0, "sourceTrack": 0, "sourceTime": 20, "trackTime": 22, "time": 22, "resource": "标记", "verification": "data-only", "parameters": {}},
            {"id": "demo-crossfader-b", "type": "fx", "name": "交叉推子", "timing": "duration", "duration": 8, "sourceTrack": 1, "sourceTime": 26, "trackTime": 26, "time": 26, "resource": "crossfader", "verification": "mapping-confirmed", "parameters": {"value": 1, "curve": "equalPower"}, "operation": operation("crossfader", "mix", "crossfader", {"value": 1, "curve": "equalPower"}, "fx", "duration", 8, 1, "audio-crossfader")},
            {"id": "demo-level-b", "type": "fx", "name": "音量推子", "timing": "duration", "duration": 3, "sourceTrack": 1, "sourceTime": 42, "trackTime": 42, "time": 42, "resource": "level", "verification": "mapping-confirmed", "parameters": {"value": 0.55}, "operation": operation("channel-level", "mix", "level", {"value": 0.55}, "fx", "duration", 3, 1, "audio-level")},
            {"id": "demo-marker-b", "type": "marker", "name": "段落标记 · 完成", "duration": 0, "sourceTrack": 1, "sourceTime": 56, "trackTime": 56, "time": 56, "resource": "标记", "verification": "data-only", "parameters": {}},
        ]
        project = self.get_draft()
        project["title"] = "DJ Master · 一分钟演示预排"
        project["groups"]["A"] = {
            "id": "A", "name": "一分钟演示 · Night Drive → After Hours",
            "songs": [song(first, "Night Drive", 56), song(second, "After Hours")],
            "order": [0, 1], "transition": {"overlap": 8, "curve": "equalPower"}, "events": events,
        }
        clean = _validate_project(project)
        self.publish({"kind": "demo_ready", "version": clean["version"], "duration": 58})
        return clean

    def save_draft(self, project: Any) -> dict[str, Any]:
        current = self.get_draft()
        clean = _validate_project(project)
        clean["version"] = current["version"] + 1
        clean["updatedAt"] = _now()
        self._write_json(self.project_path, clean)
        self.publish({"kind": "saved", "version": clean["version"], "updatedAt": clean["updatedAt"]})
        return clean

    async def import_audio(self, upload: UploadFile) -> dict[str, Any]:
        filename = Path(upload.filename or "").name
        extension = Path(filename).suffix.lower()
        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(415, "仅支持 MP3、WAV、FLAC 文件")
        content_type = (upload.content_type or "").lower()
        if not content_type.startswith("audio/") and content_type != "application/octet-stream":
            raise HTTPException(415, "上传内容不是音频文件")
        asset_id = uuid.uuid4().hex
        destination = self.audio_dir / f"{asset_id}{extension}"
        total = 0
        prefix = bytearray()
        fd, temp_name = tempfile.mkstemp(prefix=".upload-", dir=self.audio_dir)
        try:
            with os.fdopen(fd, "wb") as stream:
                while chunk := await upload.read(1024 * 1024):
                    total += len(chunk)
                    if total > MAX_AUDIO_BYTES:
                        raise HTTPException(413, "单文件大小不能超过 150 MB")
                    if len(prefix) < 16:
                        prefix.extend(chunk[: 16 - len(prefix)])
                    stream.write(chunk)
                stream.flush()
                os.fsync(stream.fileno())
            if total == 0 or not self._valid_signature(extension, bytes(prefix)):
                raise HTTPException(415, "音频内容与文件格式不匹配")
            os.replace(temp_name, destination)
        finally:
            if os.path.exists(temp_name):
                os.unlink(temp_name)
            await upload.close()
        asset = {
            "id": asset_id,
            "filename": filename[:200] or f"audio{extension}",
            "contentType": content_type,
            "size": total,
            "url": f"/api/audio/{asset_id}",
            "importedAt": _now(),
        }
        self._assets[asset_id] = {**asset, "extension": extension}
        self._write_json(self.assets_path, self._assets)
        self.publish({"kind": "imported", "assetId": asset_id, "filename": asset["filename"], "size": total})
        return asset

    @staticmethod
    def _valid_signature(extension: str, prefix: bytes) -> bool:
        if extension == ".wav":
            return len(prefix) >= 12 and prefix[:4] == b"RIFF" and prefix[8:12] == b"WAVE"
        if extension == ".flac":
            return prefix.startswith(b"fLaC")
        if extension == ".mp3":
            return prefix.startswith(b"ID3") or (len(prefix) >= 2 and prefix[0] == 0xFF and prefix[1] & 0xE0 == 0xE0)
        return False

    def audio_path(self, asset_id: str) -> tuple[Path, dict[str, Any]]:
        if not ASSET_ID_RE.fullmatch(asset_id):
            raise HTTPException(404, "音频文件不存在")
        asset = self._assets.get(asset_id)
        if not asset:
            raise HTTPException(404, "音频文件不存在")
        path = self.audio_dir / f"{asset_id}{asset['extension']}"
        if not path.is_file() or path.parent.resolve() != self.audio_dir.resolve():
            raise HTTPException(404, "音频文件不存在")
        return path, asset

    def subscribe(self) -> asyncio.Queue[dict[str, Any]]:
        queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=20)
        self._subscribers.add(queue)
        queue.put_nowait({"kind": "connected", "draftVersion": self.get_draft()["version"]})
        return queue

    def unsubscribe(self, queue: asyncio.Queue[dict[str, Any]]) -> None:
        self._subscribers.discard(queue)

    def publish(self, event: dict[str, Any]) -> None:
        payload = {**event, "at": _now()}
        for queue in tuple(self._subscribers):
            try:
                queue.put_nowait(payload)
            except asyncio.QueueFull:
                try:
                    queue.get_nowait()
                    queue.put_nowait(payload)
                except (asyncio.QueueEmpty, asyncio.QueueFull):
                    pass

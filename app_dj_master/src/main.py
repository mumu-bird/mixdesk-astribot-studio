from __future__ import annotations

import asyncio
import json
import mimetypes
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

from .logic import DJMasterLogic

APP_DIR = Path(__file__).resolve().parent.parent
UI_DIR = APP_DIR / "ui"
DIST_DIR = UI_DIR / "dist"
logic = DJMasterLogic()
app = FastAPI(title="DJ Master", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_methods=["GET", "POST", "PUT"],
    allow_headers=["Content-Type"],
)


@app.get("/api/draft")
async def read_draft():
    return logic.get_draft()


@app.post("/api/draft")
async def create_draft():
    return logic.create_draft()


@app.post("/api/demo/seed")
async def seed_demo():
    """Return a demo candidate; the user saves it through the draft API."""
    return logic.seed_demo()


@app.put("/api/draft")
async def update_draft(payload: dict):
    if "project" not in payload:
        raise HTTPException(422, "缺少 project 字段")
    try:
        return logic.save_draft(payload["project"])
    except HTTPException as error:
        logic.publish({"kind": "save_failed", "message": str(error.detail)})
        raise


@app.post("/api/audio/import")
async def import_audio(file: UploadFile = File(...)):
    try:
        return await logic.import_audio(file)
    except HTTPException as error:
        logic.publish({"kind": "import_failed", "message": str(error.detail)})
        raise


@app.get("/api/audio/{asset_id}")
async def get_audio(asset_id: str):
    path, asset = logic.audio_path(asset_id)
    media_type = asset.get("contentType") or mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    return FileResponse(path, media_type=media_type, filename=asset["filename"], content_disposition_type="inline")


@app.get("/api/state")
async def stream_state():
    queue = logic.subscribe()

    async def events():
        try:
            while True:
                try:
                    state = await asyncio.wait_for(queue.get(), timeout=15)
                    yield f"data: {json.dumps(state, ensure_ascii=False)}\n\n"
                except asyncio.TimeoutError:
                    yield ": keep-alive\n\n"
        finally:
            logic.unsubscribe(queue)

    return StreamingResponse(events(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


if DIST_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")


@app.get("/")
async def serve_index():
    index = DIST_DIR / "index.html" if (DIST_DIR / "index.html").is_file() else UI_DIR / "index.html"
    return FileResponse(index)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("src.main:app", host="0.0.0.0", port=12340, reload=False)

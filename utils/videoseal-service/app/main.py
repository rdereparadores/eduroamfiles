"""FastAPI application – VideoSeal watermarking service."""
from __future__ import annotations

import logging
import shutil
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles

from app.watermark import embed_watermark, detect_watermark

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="VideoSeal Watermarking Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_STATIC = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=str(_STATIC)), name="static")


@app.get("/", response_class=HTMLResponse)
async def root():
    return (_STATIC / "index.html").read_text()


@app.post(
    "/embed",
    summary="Embed a text watermark into a video",
    responses={
        200: {"content": {"video/mp4": {}}, "description": "Watermarked video"},
        400: {"description": "Bad request (text too long, invalid file, …)"},
        500: {"description": "Internal processing error"},
    },
)
async def embed_endpoint(
    video: UploadFile = File(..., description="Source video file"),
    text: str = Form(..., description="Watermark text (max 32 ASCII bytes)"),
):
    if not text.strip():
        raise HTTPException(400, "Watermark text must not be empty")

    suffix = Path(video.filename or "video.mp4").suffix or ".mp4"

    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = f"{tmpdir}/input{suffix}"
        output_path = f"{tmpdir}/output.mp4"

        with open(input_path, "wb") as f:
            shutil.copyfileobj(video.file, f)

        try:
            embed_watermark(input_path, text, output_path)
        except ValueError as exc:
            raise HTTPException(400, str(exc)) from exc
        except Exception as exc:
            raise HTTPException(500, f"Embedding failed: {exc}") from exc

        content = Path(output_path).read_bytes()

    out_name = f"watermarked_{video.filename or 'video.mp4'}"
    return Response(
        content=content,
        media_type="video/mp4",
        headers={"Content-Disposition": f'attachment; filename="{out_name}"'},
    )


@app.post(
    "/detect",
    summary="Detect and decode a watermark from a video",
    response_model=None,
)
async def detect_endpoint(
    video: UploadFile = File(..., description="Video to inspect"),
):
    suffix = Path(video.filename or "video.mp4").suffix or ".mp4"

    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = f"{tmpdir}/input{suffix}"

        with open(input_path, "wb") as f:
            shutil.copyfileobj(video.file, f)

        try:
            result = detect_watermark(input_path)
        except Exception as exc:
            raise HTTPException(500, f"Detection failed: {exc}") from exc

    return JSONResponse(result)

#!/usr/bin/env bash
# Start the VideoSeal service using uv.
# Usage: ./run.sh [uvicorn options]
set -e

# videoseal depends on opencv-python (needs X11) and we also declare
# opencv-python-headless. Remove the GUI variant if present.
# Force headless cv2.abi3.so to win over the X11-linked one
uv pip install --reinstall opencv-python-headless 2>/dev/null || true

exec uv run uvicorn app.main:app --host "${HOST:-0.0.0.0}" --port "${PORT:-8000}" "$@"

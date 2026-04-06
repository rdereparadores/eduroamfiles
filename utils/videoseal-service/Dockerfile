FROM python:3.12-slim

# ── system deps ──────────────────────────────────────────────────────────────
# git: required by uv to fetch videoseal from GitHub
RUN apt-get update && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

# ── uv ────────────────────────────────────────────────────────────────────────
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# ── Python deps (cached layer – only rebuilt when lock/pyproject change) ─────
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project

# ── Application code ──────────────────────────────────────────────────────────
COPY app/ app/

# Install the project itself (editable wheel)
RUN uv sync --frozen

# ── opencv headless fix ───────────────────────────────────────────────────────
# uv installs both opencv-python (X11/libxcb) and opencv-python-headless.
# Both share the same cv2.abi3.so; whichever is installed last wins the RPATH
# race. We force-reinstall the headless variant last so its .so (which links
# against opencv_python_headless.libs/ instead of opencv_python.libs/) takes
# precedence, removing the libxcb dependency.
RUN uv pip install --reinstall opencv-python-headless

# ── videoseal configs packaging workaround ────────────────────────────────────
# Download the missing configs/ directory into the installed package so the
# service doesn't need internet access at startup.
RUN PYTHONPATH=/app /app/.venv/bin/python -c "from app.watermark import _ensure_videoseal_configs; _ensure_videoseal_configs()"

# ── runtime ───────────────────────────────────────────────────────────────────
# ckpts/ is mounted as a named volume so model weights survive image rebuilds.
VOLUME ["/app/ckpts"]

EXPOSE 8000

# Run directly from the venv – avoids 'uv run' triggering an implicit sync
# that would reinstall opencv-python from the lockfile.
CMD ["/app/.venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

"""
VideoSeal watermark embedding and detection.

Text encoding: UTF-8 bytes zero-padded to nbits//8 bytes, then serialised to
binary (MSB first per byte).  Decoding reverses the process and strips trailing
null bytes before UTF-8 decoding.
"""
from __future__ import annotations

import logging
from pathlib import Path

import numpy as np
import torch

logger = logging.getLogger(__name__)

_model: object | None = None
_device: torch.device | None = None

# ── videoseal packaging workaround ───────────────────────────────────────────
# The pip/uv-installed videoseal package omits the `configs/` directory.
# We download the missing YAML files on first use so the service survives
# both fresh `uv sync` runs and Docker image rebuilds.

_CONFIGS = {
    "attenuation.yaml": "https://raw.githubusercontent.com/facebookresearch/videoseal/main/configs/attenuation.yaml",
    "embedder.yaml":    "https://raw.githubusercontent.com/facebookresearch/videoseal/main/configs/embedder.yaml",
    "extractor.yaml":   "https://raw.githubusercontent.com/facebookresearch/videoseal/main/configs/extractor.yaml",
}


def _ensure_videoseal_configs() -> None:
    """Download any missing videoseal config files into the installed package."""
    import importlib.util
    import urllib.request

    spec = importlib.util.find_spec("videoseal")
    if spec is None or spec.origin is None:
        return

    configs_dir = Path(spec.origin).parent / "configs"
    missing = [name for name, _ in _CONFIGS.items() if not (configs_dir / name).exists()]
    if not missing:
        return

    configs_dir.mkdir(exist_ok=True)
    for name in missing:
        url = _CONFIGS[name]
        dest = configs_dir / name
        logger.info("Downloading missing videoseal config: %s", name)
        urllib.request.urlretrieve(url, dest)
        logger.info("Saved → %s", dest)


def _get_device() -> torch.device:
    global _device
    if _device is None:
        _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info("Using device: %s", _device)
    return _device


def get_model():
    global _model
    if _model is None:
        _ensure_videoseal_configs()
        import videoseal  # imported lazily so the service starts fast

        logger.info("Loading VideoSeal model …")
        _model = videoseal.load("videoseal")
        _model.eval()
        _model.to(_get_device())
        logger.info("Model loaded (nbits=%s)", getattr(_model, "nbits", "?"))
    return _model


# ── Text ↔ bits conversion ────────────────────────────────────────────────────

def _nbits(model) -> int:
    return int(getattr(model, "nbits", 256))


def text_to_bits(text: str, nbits: int) -> torch.Tensor:
    """Return float tensor [1, nbits] with values in {0.0, 1.0}."""
    nbytes = nbits // 8
    encoded = text.encode("utf-8")
    if len(encoded) > nbytes:
        raise ValueError(
            f"Text is too long: {len(encoded)} bytes, max {nbytes} bytes "
            f"({nbytes} ASCII chars or fewer multibyte chars)"
        )
    padded = encoded + b"\x00" * (nbytes - len(encoded))
    bits: list[float] = []
    for byte in padded:
        for shift in range(7, -1, -1):
            bits.append(float((byte >> shift) & 1))
    return torch.tensor(bits, dtype=torch.float32).unsqueeze(0)  # [1, nbits]


def bits_to_text(preds: torch.Tensor) -> tuple[str, bool]:
    """
    Convert predictions to (text, is_likely_watermark).

    preds may be [nbits], [1, nbits], or [T, nbits] (averaged over frames).
    Values in [0,1] are treated as probabilities (threshold 0.5).
    Values outside [0,1] are treated as logits (threshold 0).
    """
    t = preds.float()
    if t.dim() > 2:
        t = t.mean(0)   # [T, nbits] → [nbits]
    if t.dim() == 2:
        t = t.mean(0)   # [1, nbits] → [nbits]

    # Auto-detect probability vs logit output
    threshold = 0.5 if (t.min() >= 0.0 and t.max() <= 1.0) else 0.0
    bits = (t > threshold).int().tolist()

    nbytes = len(bits) // 8
    byte_values: list[int] = []
    for i in range(nbytes):
        byte_bits = bits[i * 8 : i * 8 + 8]
        byte_values.append(sum(b << (7 - j) for j, b in enumerate(byte_bits)))

    raw = bytes(byte_values).rstrip(b"\x00")
    try:
        text = raw.decode("utf-8")
        valid = bool(text) and all(c.isprintable() or c in "\n\r\t" for c in text)
        return text, valid
    except UnicodeDecodeError:
        return "", False


# ── Video I/O (imageio_ffmpeg bundled binary – no X11 required) ──────────────

def _load_video(path: str) -> tuple[torch.Tensor, float]:
    """Return (frames [T, C, H, W] float32 in [0,1], fps)."""
    import imageio_ffmpeg

    gen = imageio_ffmpeg.read_frames(path, pix_fmt="rgb24")
    meta = next(gen)                     # first yield is metadata dict
    fps  = float(meta.get("fps", 25.0))
    W, H = meta["size"]

    raw_frames: list[np.ndarray] = []
    for raw in gen:
        arr = np.frombuffer(raw, dtype=np.uint8).reshape(H, W, 3).copy()
        raw_frames.append(arr)

    tensor = torch.from_numpy(np.stack(raw_frames)).permute(0, 3, 1, 2).float() / 255.0
    return tensor, fps


def _save_video(frames: torch.Tensor, path: str, fps: float) -> None:
    """Write frames [T, C, H, W] float in [0,1] to MP4 using bundled ffmpeg."""
    import imageio_ffmpeg

    uint8 = (frames.clamp(0, 1) * 255).byte().permute(0, 2, 3, 1).numpy()
    _T, H, W, _C = uint8.shape

    # yuv444p preserves chroma at full resolution so the embedded watermark
    # survives the encode/decode round-trip without bit errors.
    writer = imageio_ffmpeg.write_frames(
        path,
        size=(W, H),
        fps=fps,
        codec="libx264",
        pix_fmt_in="rgb24",
        pix_fmt_out="yuv444p",
        output_params=["-crf", "0", "-preset", "fast", "-profile:v", "high444"],
    )
    writer.send(None)          # prime the coroutine
    for frame in uint8:
        writer.send(frame.tobytes())
    writer.close()


# ── Public API ────────────────────────────────────────────────────────────────

def embed_watermark(input_path: str, text: str, output_path: str) -> None:
    """Embed *text* as a watermark into the video at *input_path*."""
    model = get_model()
    device = _get_device()
    nbits = _nbits(model)

    frames, fps = _load_video(input_path)
    frames = frames.to(device)

    msgs = text_to_bits(text, nbits).to(device)  # [1, nbits]

    with torch.no_grad():
        outputs = model.embed(frames, msgs=msgs, is_video=True)

    watermarked: torch.Tensor = outputs["imgs_w"]
    _save_video(watermarked.cpu(), output_path, fps)
    logger.info("Watermark embedded → %s", output_path)


def detect_watermark(input_path: str) -> dict:
    """Extract watermark from *input_path* and attempt to decode text."""
    model = get_model()
    device = _get_device()

    frames, _ = _load_video(input_path)
    frames = frames.to(device)

    with torch.no_grad():
        # VideoSeal exposes different method names depending on version;
        # try the most common ones in order.
        preds = None
        for method in ("extract_message", "detect", "decode"):
            fn = getattr(model, method, None)
            if fn is None:
                continue
            try:
                result = fn(frames, is_video=True)
            except TypeError:
                try:
                    result = fn(frames)
                except Exception:
                    continue
            except Exception:
                continue

            if isinstance(result, dict):
                # Look for message bits under common keys
                for key in ("preds", "msgs", "msg", "bits"):
                    if key in result:
                        preds = result[key]
                        break
                if preds is None and result:
                    preds = next(iter(result.values()))
            elif isinstance(result, torch.Tensor):
                preds = result
            break

    if preds is None:
        return {
            "detected": False,
            "text": "",
            "error": "Model returned no predictions; check VideoSeal version.",
        }

    # detect() returns [T, nbits+1]: col 0 is detection score, cols 1: are message bits
    if preds.dim() >= 2 and preds.shape[-1] == 257:
        preds = preds[..., 1:]   # drop detection channel → [T, 256]

    text, valid = bits_to_text(preds)
    return {
        "detected": valid,
        "text": text if valid else "",
    }

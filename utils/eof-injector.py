#!/usr/bin/env python3
"""
EOF Injection Tool
Embeds and extracts hidden text in files via EOF injection.
Requires Python 3.10+
"""

import argparse
import os
import sys

# Delimitador para identificar el payload inyectado
MAGIC_MARKER = b"\x00EOF_INJECT\x00"

# Marcadores EOF por formato de fichero
EOF_MARKERS: dict[str, bytes] = {
    "jpg":  b"\xff\xd9",
    "jpeg": b"\xff\xd9",
    "png":  b"\x49\x45\x4e\x44\xae\x42\x60\x82",  # IEND CRC
    "pdf":  b"%%EOF",
    "gif":  b"\x3b",
}


def detect_format(filepath: str) -> str:
    return os.path.splitext(filepath)[1].lower().lstrip(".")


def find_eof_offset(data: bytes, fmt: str) -> int:
    """Devuelve el offset justo después del marcador EOF del formato."""
    marker = EOF_MARKERS.get(fmt)
    if marker:
        pos = data.rfind(marker)
        if pos != -1:
            return pos + len(marker)
    # Fallback: al final del fichero
    return len(data)


# ---------------------------------------------------------------------------
# Operaciones principales
# ---------------------------------------------------------------------------

def inject(filepath: str, text: str) -> None:
    with open(filepath, "rb") as f:
        data = f.read()

    # Eliminar inyección previa si existe
    if MAGIC_MARKER in data:
        print("[!] El fichero ya contiene datos inyectados. Sobreescribiendo...")
        data = data[: data.find(MAGIC_MARKER)]

    fmt = detect_format(filepath)
    eof_offset = find_eof_offset(data, fmt)
    payload = MAGIC_MARKER + text.encode("utf-8") + MAGIC_MARKER

    new_data = data[:eof_offset] + payload + data[eof_offset:]

    with open(filepath, "wb") as f:
        f.write(new_data)

    print(f"[+] Texto inyectado correctamente en '{filepath}'")
    print(f"    Formato detectado : {fmt or 'genérico'}")
    print(f"    Offset de inyección: {eof_offset} bytes")
    print(f"    Tamaño del payload : {len(payload)} bytes")


def extract(filepath: str) -> str | None:
    with open(filepath, "rb") as f:
        data = f.read()

    start = data.find(MAGIC_MARKER)
    if start == -1:
        return None

    end = data.find(MAGIC_MARKER, start + len(MAGIC_MARKER))
    if end == -1:
        return None

    return data[start + len(MAGIC_MARKER) : end].decode("utf-8")


def clean(filepath: str) -> None:
    with open(filepath, "rb") as f:
        data = f.read()

    idx = data.find(MAGIC_MARKER)
    if idx == -1:
        print("[-] No se encontraron datos inyectados.")
        return

    with open(filepath, "wb") as f:
        f.write(data[:idx])

    print(f"[+] Datos inyectados eliminados de '{filepath}'")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="EOF Injection Tool — Oculta texto en ficheros",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  %(prog)s inject  imagen.jpg "Texto secreto"
  %(prog)s extract imagen.jpg
  %(prog)s clean   imagen.jpg
        """,
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_inject = sub.add_parser("inject", help="Inyectar texto en un fichero")
    p_inject.add_argument("file", help="Fichero destino")
    p_inject.add_argument("text", help="Texto a ocultar")

    p_extract = sub.add_parser("extract", help="Extraer texto inyectado")
    p_extract.add_argument("file", help="Fichero destino")

    p_clean = sub.add_parser("clean", help="Eliminar datos inyectados")
    p_clean.add_argument("file", help="Fichero destino")

    args = parser.parse_args()

    if not os.path.exists(args.file):
        print(f"[!] Fichero no encontrado: {args.file}")
        sys.exit(1)

    match args.command:
        case "inject":
            inject(args.file, args.text)
        case "extract":
            result = extract(args.file)
            if result:
                print(f"[+] Texto oculto encontrado:\n\n    {result}")
            else:
                print("[-] No se encontró texto oculto.")
        case "clean":
            clean(args.file)


if __name__ == "__main__":
    main()
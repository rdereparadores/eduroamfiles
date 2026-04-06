import { useRef, useState } from 'react';
import { PhraseWord } from '../../../components/phrase-word.component';

// ── LSB format ─────────────────────────────────────────────────────────────
// Header: "LSB1" (4 bytes magic) + uint32 big-endian (payload byte length)
// Payload: <messageId bytes> + 0x00 + <message bytes>
// Bits packed into LSB of R,G,B channels in order (3 bits/pixel, alpha untouched)
// ───────────────────────────────────────────────────────────────────────────

const MAGIC = [0x4c, 0x53, 0x42, 0x31]; // "LSB1"
const HEADER_BYTES = 8; // 4 magic + 4 length

function randomId(): string {
    return 'MSG-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function bytesToBits(bytes: number[] | Uint8Array): number[] {
    const bits: number[] = [];
    for (const byte of bytes) {
        for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
    }
    return bits;
}

function bitsToBytes(bits: number[]): Uint8Array {
    const out = new Uint8Array(Math.floor(bits.length / 8));
    for (let i = 0; i < out.length; i++) {
        let b = 0;
        for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
        out[i] = b;
    }
    return out;
}

function readLsbBits(data: Uint8ClampedArray, startBit: number, count: number): number[] {
    const totalChannels = Math.floor(data.length / 4) * 3;
    const bits: number[] = [];
    for (let i = startBit; i < startBit + count && i < totalChannels; i++) {
        const px = Math.floor(i / 3);
        const ch = i % 3;
        bits.push(data[px * 4 + ch] & 1);
    }
    return bits;
}

// Returns encoded ImageData or error string
function encodeMessage(imageData: ImageData, messageId: string, message: string): ImageData | string {
    const enc = new TextEncoder();
    const idBytes = enc.encode(messageId);
    const msgBytes = enc.encode(message);
    const payload = new Uint8Array(idBytes.length + 1 + msgBytes.length);
    payload.set(idBytes, 0);
    payload[idBytes.length] = 0;
    payload.set(msgBytes, idBytes.length + 1);

    const lenBytes = [
        (payload.length >> 24) & 0xff,
        (payload.length >> 16) & 0xff,
        (payload.length >> 8) & 0xff,
        payload.length & 0xff,
    ];

    const bits = [...bytesToBits(MAGIC), ...bytesToBits(lenBytes), ...bytesToBits(payload)];
    const capacity = Math.floor((imageData.data.length / 4) * 3);
    if (bits.length > capacity) {
        const maxChars = Math.floor((capacity - HEADER_BYTES * 8) / 8);
        return `Imagen demasiado pequeña. Capacidad máxima: ~${maxChars} caracteres.`;
    }

    const out = new Uint8ClampedArray(imageData.data);
    let bitIdx = 0;
    for (let px = 0; px < out.length / 4 && bitIdx < bits.length; px++) {
        for (let ch = 0; ch < 3 && bitIdx < bits.length; ch++) {
            out[px * 4 + ch] = (out[px * 4 + ch] & ~1) | bits[bitIdx++];
        }
    }
    return new ImageData(out, imageData.width, imageData.height);
}

export interface DecodeAnalysis {
    rawBytes: Uint8Array;      // first ~200 extracted bytes
    magicOk: boolean;
    payloadLen: number | null;
    messageId: string | null;
    message: string | null;
}

function analyzeImage(imageData: ImageData): DecodeAnalysis {
    const { data } = imageData;
    const SAMPLE = 300;

    // Extract raw bytes from LSB stream
    const rawBits = readLsbBits(data, 0, SAMPLE * 8);
    const rawBytes = bitsToBytes(rawBits);

    const magicBytes = rawBytes.slice(0, 4);
    const magicOk = MAGIC.every((b, i) => magicBytes[i] === b);

    if (!magicOk) return { rawBytes, magicOk: false, payloadLen: null, messageId: null, message: null };

    const lb = rawBytes.slice(4, 8);
    const payloadLen = (lb[0] << 24) | (lb[1] << 16) | (lb[2] << 8) | lb[3];

    if (payloadLen <= 0 || payloadLen > 200_000) {
        return { rawBytes, magicOk: true, payloadLen, messageId: null, message: null };
    }

    const payloadBits = readLsbBits(data, HEADER_BYTES * 8, payloadLen * 8);
    if (payloadBits.length < payloadLen * 8) {
        return { rawBytes, magicOk: true, payloadLen, messageId: null, message: null };
    }

    const payload = bitsToBytes(payloadBits);
    const sep = payload.indexOf(0);
    const dec = new TextDecoder();

    if (sep === -1) return { rawBytes, magicOk: true, payloadLen, messageId: dec.decode(payload), message: null };

    return {
        rawBytes,
        magicOk: true,
        payloadLen,
        messageId: dec.decode(payload.slice(0, sep)),
        message: dec.decode(payload.slice(sep + 1)),
    };
}

function loadImageData(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d')!.drawImage(img, 0, 0);
            resolve(canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height));
            URL.revokeObjectURL(url);
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo cargar la imagen.')); };
        img.src = url;
    });
}

function imageDataToPngBlob(imageData: ImageData): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        canvas.getContext('2d')!.putImageData(imageData, 0, 0);
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Error exportando PNG')), 'image/png');
    });
}


// ── Sub-components ───────────────────────────────────────────────────────────

function FileDropZone({ onFile, preview, label }: { onFile: (f: File) => void; preview: string; label: string }) {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div
            style={{ border: '2px dashed #aaa', background: '#f5f5f5', minHeight: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 6, padding: 8 }}
            onClick={() => ref.current?.click()}
        >
            {preview
                ? <img src={preview} alt="preview" style={{ maxHeight: 90, maxWidth: '100%', objectFit: 'contain' }} />
                : <span style={{ color: '#888', fontSize: 12, textAlign: 'center' }}>{label}</span>
            }
            <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) onFile(e.target.files[0]); e.target.value = ''; }} />
        </div>
    );
}

// Visual hex dump with color-coded sections
function HexDump({ analysis }: { analysis: DecodeAnalysis }) {
    const { rawBytes, magicOk, payloadLen, messageId, message } = analysis;
    const dec = new TextDecoder('utf-8', { fatal: false });

    // Classify each byte index in the raw stream
    function classify(i: number): string {
        if (i < 4) return 'magic';
        if (i < 8) return 'length';
        if (!magicOk || payloadLen === null) return 'unknown';
        const payloadStart = HEADER_BYTES;
        const idLen = messageId !== null ? new TextEncoder().encode(messageId).length : null;
        if (idLen !== null) {
            if (i >= payloadStart && i < payloadStart + idLen) return 'id';
            if (i === payloadStart + idLen) return 'sep';
            if (i > payloadStart + idLen) return 'message';
        }
        return 'payload';
    }

    const COLOR: Record<string, string> = {
        magic:   '#ffddaa',
        length:  '#aaddff',
        id:      '#aaffcc',
        sep:     '#dddddd',
        message: '#ddaaff',
        payload: '#eeeeee',
        unknown: '#f0f0f0',
    };

    const LABEL: Record<string, string> = {
        magic: 'Magic "LSB1"',
        length: 'Longitud',
        id: 'ID',
        sep: 'Separador (0x00)',
        message: 'Mensaje',
        payload: 'Payload',
        unknown: '?',
    };

    const rows: { offset: number; bytes: number[] }[] = [];
    for (let i = 0; i < rawBytes.length; i += 16) {
        rows.push({ offset: i, bytes: Array.from(rawBytes.slice(i, i + 16)) });
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 11 }}>
                {Object.entries(LABEL).filter(([k]) => k !== 'payload' && k !== 'unknown').map(([k, v]) => (
                    <span key={k} style={{ background: COLOR[k], padding: '1px 6px', border: '1px solid #ccc', borderRadius: 2 }}>{v}</span>
                ))}
            </div>

            {/* Hex dump */}
            <div style={{ overflowX: 'auto' }}>
                <pre style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.6, margin: 0, background: '#1e1e1e', color: '#d4d4d4', padding: 8, borderRadius: 2 }}>
                    {rows.map(({ offset, bytes }) => {
                        const hexCells = bytes.map((b, j) => {
                            const idx = offset + j;
                            const cls = classify(idx);
                            return (
                                <span key={j} style={{ background: COLOR[cls], color: '#000', padding: '0 1px', marginRight: j === 7 ? 8 : 2, borderRadius: 1 }}>
                                    {b.toString(16).padStart(2, '0')}
                                </span>
                            );
                        });
                        const asciiCells = bytes.map((b, j) => {
                            const idx = offset + j;
                            const cls = classify(idx);
                            const ch = b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : b === 0 ? '·' : '¿';
                            return (
                                <span key={j} style={{ background: COLOR[cls], color: '#000', borderRadius: 1 }}>{ch}</span>
                            );
                        });
                        return (
                            <div key={offset} style={{ display: 'flex', gap: 8 }}>
                                <span style={{ color: '#888', minWidth: 48 }}>{offset.toString(16).padStart(6, '0')}</span>
                                <span style={{ minWidth: 300 }}>{hexCells}</span>
                                <span style={{ borderLeft: '1px solid #444', paddingLeft: 8 }}>{asciiCells}</span>
                            </div>
                        );
                    })}
                    {rawBytes.length === 0 && <span style={{ color: '#888' }}>(sin datos)</span>}
                </pre>
            </div>
        </div>
    );
}

function DecodeResult({ analysis }: { analysis: DecodeAnalysis }) {
    const { magicOk, payloadLen, messageId, message } = analysis;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Row ok={magicOk} label="Cabecera LSB1" value={magicOk ? 'Detectada' : 'No encontrada — esta imagen no contiene un mensaje LSB codificado con este formato'} />
                {magicOk && <Row ok={payloadLen !== null && payloadLen > 0} label="Longitud del payload" value={payloadLen !== null ? `${payloadLen} bytes` : 'Inválida'} />}
                {payloadLen !== null && payloadLen > 0 && <Row ok={messageId !== null} label="ID del mensaje" value={messageId ?? '(no se pudo extraer)'} mono />}
                {messageId !== null && <Row ok={message !== null} label="Mensaje" value={message ?? '(sin separador encontrado)'} mono />}
            </div>

            <HexDump analysis={analysis} />
        </div>
    );
}

function Row({ ok, label, value, mono }: { ok: boolean; label: string; value: string; mono?: boolean }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12 }}>
            <span style={{ color: ok ? '#1a7a1a' : '#cc0000', fontWeight: 'bold', minWidth: 14 }}>{ok ? '✓' : '✗'}</span>
            <span style={{ minWidth: 160, color: '#555' }}>{label}:</span>
            <span style={{ fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{value}</span>
        </div>
    );
}

// ── Tabs ─────────────────────────────────────────────────────────────────────

function EncodeTab() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState('');
    const [messageId, setMessageId] = useState(randomId);
    const [message, setMessage] = useState('');
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null);
    const [busy, setBusy] = useState(false);

    const handleFile = (f: File) => {
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setResultUrl(null);
        setStatus(null);
    };

    const handleEncode = async () => {
        if (!file) return setStatus({ text: 'Selecciona una imagen primero.', ok: false });
        if (!message.trim()) return setStatus({ text: 'Escribe un mensaje para ocultar.', ok: false });
        setBusy(true);
        setResultUrl(null);
        setStatus(null);
        try {
            const imageData = await loadImageData(file);
            const id = messageId.trim() || randomId();
            const result = encodeMessage(imageData, id, message);
            if (typeof result === 'string') {
                setStatus({ text: result, ok: false });
                return;
            }
            const blob = await imageDataToPngBlob(result);
            setResultUrl(URL.createObjectURL(blob));
            setStatus({ text: `Mensaje oculto con ID "${id}". Haz clic derecho en la imagen → Guardar imagen como…`, ok: true });
        } catch (e: any) {
            setStatus({ text: e.message ?? 'Error inesperado.', ok: false });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="field-row-stacked">
                <label>Imagen de entrada <PhraseWord word="alpha" /></label>
                <FileDropZone onFile={handleFile} preview={preview} label="Haz clic para seleccionar una imagen (JPG, PNG…)" />
            </div>
            <div className="field-row-stacked">
                <label>ID de mensaje</label>
                <div style={{ display: 'flex', gap: 6 }}>
                    <input type="text" value={messageId} onChange={e => setMessageId(e.target.value)} style={{ flex: 1 }} />
                    <button onClick={() => setMessageId(randomId())}>Aleatorio</button>
                </div>
            </div>
            <div className="field-row-stacked">
                <label>Mensaje a ocultar</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 12, width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleEncode} disabled={busy}>{busy ? 'Procesando…' : 'Codificar'}</button>
            </div>
            {status && (
                <div style={{ padding: '6px 8px', background: status.ok ? '#d4edda' : '#f8d7da', border: `1px solid ${status.ok ? '#c3e6cb' : '#f5c6cb'}`, fontSize: 12 }}>
                    {status.text}
                </div>
            )}
            {resultUrl && (
                <div className="field-row-stacked">
                    <label>Imagen resultante (clic derecho → Guardar imagen como…)</label>
                    <img
                        src={resultUrl}
                        alt="Imagen con LSB codificado"
                        style={{ maxWidth: '100%', border: '1px solid #ccc', cursor: 'context-menu' }}
                    />
                </div>
            )}
        </div>
    );
}

function DecodeTab() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState('');
    const [analysis, setAnalysis] = useState<DecodeAnalysis | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const handleFile = (f: File) => {
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setAnalysis(null);
        setError('');
    };

    const handleDecode = async () => {
        if (!file) return setError('Selecciona una imagen primero.');
        setBusy(true);
        setAnalysis(null);
        setError('');
        try {
            const imageData = await loadImageData(file);
            setAnalysis(analyzeImage(imageData));
        } catch (e: any) {
            setError(e.message ?? 'Error inesperado.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="field-row-stacked">
                <label>Imagen a analizar <PhraseWord word="es" /></label>
                <FileDropZone onFile={handleFile} preview={preview} label="Haz clic para seleccionar una imagen" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleDecode} disabled={busy || !file}>{busy ? 'Analizando…' : 'Analizar LSB'}</button>
            </div>
            {error && <div style={{ padding: '6px 8px', background: '#f8d7da', border: '1px solid #f5c6cb', fontSize: 12 }}>{error}</div>}
            {analysis && <DecodeResult analysis={analysis} />}
        </div>
    );
}

// ── Route ─────────────────────────────────────────────────────────────────────

export const LsbToolRoute = () => {
    const [tab, setTab] = useState<'encode' | 'decode'>('encode');

    return (
        <div style={{ height: '100vh', width: '100vw', overflow: 'auto', padding: 12, boxSizing: 'border-box', background: '#d4d0c8', fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}>
            <menu role="tablist" style={{ marginBottom: 0 }}>
                <button role="tab" aria-selected={tab === 'encode'} onClick={() => setTab('encode')}>Codificar</button>
                <button role="tab" aria-selected={tab === 'decode'} onClick={() => setTab('decode')}>Descifrar</button>
            </menu>
            <div role="tabpanel" style={{ padding: 10 }}>
                {tab === 'encode' ? <EncodeTab /> : <DecodeTab />}
            </div>
        </div>
    );
};

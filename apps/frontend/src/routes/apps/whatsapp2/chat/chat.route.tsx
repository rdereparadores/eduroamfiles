import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChatMessage, useChat } from "../../../../hooks/chat.hook";

const AUDIO_EXTS = /\.(mp3|ogg|wav|m4a|aac|flac)(\?.*)?$/i;
const IMAGE_EXTS = /\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i;

function FileAttachment({ url }: { url: string }) {
    if (!url) return null;
    if (AUDIO_EXTS.test(url)) {
        return <audio controls src={url} style={{ maxWidth: 260, marginTop: 4 }} />;
    }
    if (IMAGE_EXTS.test(url)) {
        return <img src={url} alt="adjunto" style={{ maxWidth: 260, borderRadius: 4, marginTop: 4 }} />;
    }
    return (
        <a href={url} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: 4, color: '#1a73e8', fontSize: 12 }}>
            📎 {url}
        </a>
    );
}

function Message({ msg }: { msg: ChatMessage }) {
    const isUser = msg.role === 'user';
    return (
        <div style={{
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            marginBottom: 4,
        }}>
            <div style={{
                background: isUser ? '#dcf8c6' : '#fff',
                border: '1px solid #d4d0c8',
                borderRadius: isUser ? '8px 8px 0 8px' : '8px 8px 8px 0',
                padding: '6px 10px',
                maxWidth: '75%',
            }}>
                {msg.content && <p style={{ margin: 0, fontSize: 13 }}>{msg.content}</p>}
                {msg.fileUrl !== undefined && <FileAttachment url={msg.fileUrl} />}
                <p style={{ margin: '2px 0 0', fontSize: 10, color: '#888', textAlign: 'right' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
}

export const ChatRoute = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { chat, loading, sendMessage } = useChat(Number(id));

    const [text, setText] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [showFileInput, setShowFileInput] = useState(false);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat?.conversation.length]);

    const handleSend = async () => {
        if (!text.trim() && !fileUrl.trim()) return;
        setSending(true);
        await sendMessage(text.trim(), fileUrl.trim() || undefined);
        setText('');
        setFileUrl('');
        setShowFileInput(false);
        setSending(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
            {/* Header */}
            <div style={{
                background: '#25d366', padding: '6px 10px',
                display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
            }}>
                <button onClick={() => navigate('..')} style={{ background: 'none', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer', padding: '0 4px' }}>
                    ←
                </button>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#a0a0a0', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 16,
                }}>
                    {chat?.botName?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <p style={{ margin: 0, fontWeight: 'bold', color: 'white', fontSize: 15 }}>
                    {loading ? '...' : chat?.botName}
                </p>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1, overflowY: 'auto', padding: '8px',
                background: '#ece5dd',
            }}>
                {loading && <p style={{ color: '#888', fontSize: 13 }}>Cargando...</p>}
                {chat?.conversation.map((msg, i) => <Message key={i} msg={msg} />)}
                <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div style={{
                background: '#f0f0f0', borderTop: '1px solid #d4d0c8',
                padding: '6px 8px', flexShrink: 0,
            }}>
                {showFileInput && (
                    <input
                        type="text"
                        placeholder="URL del archivo adjunto..."
                        value={fileUrl}
                        onChange={e => setFileUrl(e.target.value)}
                        style={{ width: '100%', marginBottom: 6, fontSize: 12 }}
                    />
                )}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button
                        title="Adjuntar archivo"
                        onClick={() => setShowFileInput(v => !v)}
                        style={{
                            background: showFileInput ? '#c0c0c0' : 'none',
                            border: '1px solid #aaa', borderRadius: 4,
                            padding: '2px 6px', cursor: 'pointer', fontSize: 14,
                        }}
                    >
                        📎
                    </button>
                    <input
                        type="text"
                        placeholder="Escribe aquí..."
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        disabled={sending}
                        style={{ flex: 1 }}
                    />
                    <button onClick={handleSend} disabled={sending || (!text.trim() && !fileUrl.trim())}>
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
};

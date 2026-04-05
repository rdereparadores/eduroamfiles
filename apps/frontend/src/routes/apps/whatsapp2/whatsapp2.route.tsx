import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../hooks/auth.hook";
import { Chat, useChats } from "../../../hooks/chat.hook";

function lastMessagePreview(chat: Chat): string {
    const msgs = chat.conversation;
    if (!msgs.length) return '';
    const last = msgs[msgs.length - 1];
    if (last.fileUrl !== undefined) return '📎 Archivo adjunto';
    return last.content.length > 40 ? last.content.slice(0, 40) + '…' : last.content;
}

function ChatListItem({ chat, onClick }: { chat: Chat; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px',
                borderBottom: '1px solid #f0f0f0', cursor: 'pointer', background: 'white',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
            onMouseLeave={e => (e.currentTarget.style.background = 'white')}
        >
            <div style={{
                width: 46, height: 46, borderRadius: '50%', background: '#c0c0c0',
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 'bold', color: '#555', overflow: 'hidden',
            }}>
                {chat.botImgUrl
                    ? <img src={chat.botImgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : chat.botName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: 14 }}>{chat.botName}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lastMessagePreview(chat)}
                </p>
            </div>
            <p style={{ fontSize: 11, color: '#999', flexShrink: 0 }}>
                {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
    );
}

function AddContactPanel({ onClose }: { onClose: () => void }) {
    const [value, setValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleAdd = async () => {
        const contact = value.trim();
        if (!contact) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/step3/add-contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ contact }),
            });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                setError(json.message ?? 'Contacto no encontrado.');
                return;
            }
            setSuccess(true);
            setTimeout(onClose, 1200);
        } catch {
            setError('Error al conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            background: '#f9f9f9', borderBottom: '1px solid #ddd',
            padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6,
        }}>
            <p style={{ margin: 0, fontSize: 12, color: '#555' }}>
                Añadir contacto por @ o número de teléfono:
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
                <input
                    type="text"
                    placeholder="@usuario o +34 600 000 000"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    disabled={loading || success}
                    autoFocus
                    style={{ flex: 1, fontSize: 13, padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4 }}
                />
                <button onClick={handleAdd} disabled={loading || success || !value.trim()}
                    style={{ fontSize: 13, padding: '4px 10px' }}>
                    {loading ? '...' : success ? '✓' : 'Añadir'}
                </button>
                <button onClick={onClose} disabled={loading}
                    style={{ fontSize: 13, padding: '4px 8px', background: 'none', border: '1px solid #ccc', borderRadius: 4 }}>
                    ✕
                </button>
            </div>
            {error && <p style={{ margin: 0, fontSize: 12, color: 'red' }}>{error}</p>}
            {success && <p style={{ margin: 0, fontSize: 12, color: 'green' }}>Contacto añadido correctamente.</p>}
        </div>
    );
}

function Whatsapp2LockScreen({ onUnlocked }: { onUnlocked: () => void }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleUnlock = async () => {
        if (!password) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/step1/unlock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ password }),
            });
            if (!res.ok) { setError('Contraseña incorrecta.'); return; }
            onUnlocked();
        } catch {
            setError('Error al conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p>Esta aplicación está protegida con contraseña. Introduzca la contraseña para continuar.</p>
            <div className="field-row-stacked">
                <label htmlFor="wa2-password">Contraseña:</label>
                <input
                    id="wa2-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                    disabled={loading}
                    autoFocus
                />
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className="field-row">
                <button onClick={handleUnlock} disabled={loading || !password}>
                    {loading ? 'Comprobando...' : 'Aceptar'}
                </button>
                <button onClick={() => setPassword('')} disabled={loading}>Cancelar</button>
            </div>
        </div>
    );
}

export const Whatsapp2Route = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [unlocked, setUnlocked] = useState(
        () => user?.progress?.steps?.step1?.substeps?.whatsappUnlocked ?? false
    );
    const { chats, loading } = useChats();
    const [showAddContact, setShowAddContact] = useState(false);

    if (!unlocked) {
        return <Whatsapp2LockScreen onUnlocked={() => {
            setUnlocked(true);
            window.location.reload();
        }} />;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
            {/* Header */}
            <div style={{
                background: '#25d366', padding: '8px 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
            }}>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: 18, color: 'white' }}>WhatsApp 2</p>
                <button
                    onClick={() => setShowAddContact(v => !v)}
                    title="Añadir contacto"
                    style={{
                        background: 'none', border: 'none', color: 'white',
                        fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '0 4px',
                    }}
                >
                    +
                </button>
            </div>

            {/* Panel añadir contacto */}
            {showAddContact && <AddContactPanel onClose={() => setShowAddContact(false)} />}

            {/* Lista de chats */}
            <div style={{ flex: 1, overflowY: 'auto', background: 'white' }}>
                {loading && <p style={{ padding: 12, color: '#888', fontSize: 13 }}>Cargando...</p>}
                {!loading && chats.length === 0 && (
                    <p style={{ padding: 12, color: '#888', fontSize: 13 }}>No hay conversaciones.</p>
                )}
                {chats.map(chat => (
                    <ChatListItem key={chat.id} chat={chat} onClick={() => navigate(String(chat.id))} />
                ))}
            </div>
        </div>
    );
};

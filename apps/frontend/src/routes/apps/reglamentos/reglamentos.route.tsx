import { useState } from 'react';
import { useAuth } from '../../../hooks/auth.hook';

const PLAN_FINAL_PDF_URL = '';

// ── Icons ─────────────────────────────────────────────────────────────────────

const PdfIcon = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="2" width="28" height="36" rx="2" fill="#fff" stroke="#bbb" strokeWidth="1.5" />
        <polygon points="28,2 34,8 28,8" fill="#ddd" stroke="#bbb" strokeWidth="1" />
        <rect x="6" y="28" width="36" height="18" rx="2" fill="#e03030" />
        <text x="24" y="41" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">PDF</text>
        <rect x="10" y="13" width="18" height="2" rx="1" fill="#999" />
        <rect x="10" y="18" width="22" height="2" rx="1" fill="#999" />
        <rect x="10" y="23" width="14" height="2" rx="1" fill="#999" />
    </svg>
);

const FolderIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 4 Q1 3 2 3 L6 3 L7 4 L14 4 Q15 4 15 5 L15 13 Q15 14 14 14 L2 14 Q1 14 1 13 Z" fill="#f5c518" stroke="#d4a017" strokeWidth="0.5" />
    </svg>
);

// ── Password dialog ───────────────────────────────────────────────────────────

function PasswordDialog({ onUnlocked }: { onUnlocked: () => void }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleUnlock = async () => {
        if (!password) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/step5/unlock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ password }),
            });
            if (!res.ok) {
                setError('Contraseña incorrecta.');
                return;
            }
            onUnlocked();
        } catch {
            setError('Error al conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            width: '100vw', height: '100vh',
            background: '#008080',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div className="window" style={{ width: 340 }}>
                <div className="title-bar">
                    <div className="title-bar-text">Conectar a Reglamentos</div>
                    <div className="title-bar-controls">
                        <button aria-label="Close" />
                    </div>
                </div>
                <div className="window-body" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <p style={{ margin: 0, fontSize: 12 }}>
                        Esta carpeta está protegida. Introduzca la contraseña para acceder.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <label htmlFor="folder-password" style={{ minWidth: 90, fontSize: 12 }}>Contraseña:</label>
                        <input
                            id="folder-password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                            disabled={loading}
                            autoFocus
                            style={{ flex: 1 }}
                        />
                    </div>
                    {error && <p style={{ margin: 0, fontSize: 12, color: 'red' }}>{error}</p>}
                    <div className="field-row" style={{ justifyContent: 'flex-end', gap: 6 }}>
                        <button onClick={handleUnlock} disabled={loading || !password} style={{ minWidth: 75 }}>
                            {loading ? 'Comprobando...' : 'Aceptar'}
                        </button>
                        <button onClick={() => setPassword('')} disabled={loading} style={{ minWidth: 75 }}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── File Explorer ─────────────────────────────────────────────────────────────

function FileExplorer() {
    const [selected, setSelected] = useState<string | null>(null);

    const openPdf = () => {
        window.open(PLAN_FINAL_PDF_URL, '_blank');
    };

    return (
        <div style={{
            width: '100vw', height: '100vh',
            display: 'flex', flexDirection: 'column',
            fontFamily: '"Pixelated MS Sans Serif", Tahoma, sans-serif',
            fontSize: 11,
            background: '#d4d0c8',
            overflow: 'hidden',
        }}>
            {/* Menu bar */}
            <div style={{
                background: '#d4d0c8',
                borderBottom: '1px solid #fff',
                padding: '2px 4px',
                display: 'flex', gap: 2,
            }}>
                {['Archivo', 'Edición', 'Ver', 'Favoritos', 'Herramientas', 'Ayuda'].map(item => (
                    <span key={item} style={{
                        padding: '2px 6px', cursor: 'default', fontSize: 11,
                    }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#0a246a', e.currentTarget.style.color = 'white')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = 'black')}
                    >{item}</span>
                ))}
            </div>

            {/* Toolbar */}
            <div style={{
                background: '#d4d0c8',
                borderBottom: '2px groove #fff',
                padding: '2px 4px',
                display: 'flex', alignItems: 'center', gap: 4,
            }}>
                {/* Back button */}
                <button disabled style={{ minWidth: 28, padding: '1px 4px' }}>←</button>
                <button disabled style={{ minWidth: 28, padding: '1px 4px' }}>→</button>
                <button disabled style={{ minWidth: 28, padding: '1px 4px' }}>↑</button>
                <div style={{ width: 1, height: 22, background: '#808080', margin: '0 4px' }} />
                <button disabled style={{ padding: '1px 8px' }}>Buscar</button>
                <button disabled style={{ padding: '1px 8px' }}>Carpetas</button>
                <div style={{ flex: 1 }} />
                <button disabled style={{ padding: '1px 8px' }}>Vistas ▼</button>
            </div>

            {/* Address bar */}
            <div style={{
                background: '#d4d0c8',
                borderBottom: '2px groove #808080',
                padding: '2px 4px',
                display: 'flex', alignItems: 'center', gap: 6,
            }}>
                <span style={{ fontSize: 11, whiteSpace: 'nowrap' }}>Dirección</span>
                <div style={{
                    flex: 1, background: 'white', border: '1px solid #808080',
                    padding: '1px 4px', fontSize: 11, display: 'flex', alignItems: 'center',
                    borderStyle: 'inset',
                }}>
                    <FolderIcon />
                    <span style={{ marginLeft: 4 }}>C:\Reglamentos</span>
                </div>
                <button style={{ padding: '1px 10px' }}>Ir</button>
            </div>

            {/* Main content */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Left task pane */}
                <div style={{
                    width: 180, minWidth: 180,
                    background: '#eef3fb',
                    borderRight: '1px solid #7f9db9',
                    overflowY: 'auto',
                    padding: 0,
                }}>
                    {/* Tareas de archivo */}
                    <div style={{
                        background: 'linear-gradient(to bottom, #3169c0, #2254a8)',
                        color: 'white', padding: '4px 8px',
                        fontSize: 11, fontWeight: 'bold',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        cursor: 'pointer',
                    }}>
                        <span>Tareas de archivo</span>
                        <span style={{ fontSize: 10 }}>▲</span>
                    </div>
                    <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {['Abrir este archivo', 'Imprimir este archivo', 'Copiar este archivo', 'Enviar este archivo por correo'].map(action => (
                            <a key={action} href="#" onClick={e => e.preventDefault()} style={{
                                color: '#0066cc', fontSize: 11, textDecoration: 'none',
                                display: 'flex', alignItems: 'center', gap: 4,
                            }}
                                onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                                onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                            >
                                {action}
                            </a>
                        ))}
                    </div>

                    {/* Otros sitios */}
                    <div style={{
                        background: 'linear-gradient(to bottom, #3169c0, #2254a8)',
                        color: 'white', padding: '4px 8px',
                        fontSize: 11, fontWeight: 'bold',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        cursor: 'pointer',
                        marginTop: 4,
                    }}>
                        <span>Otros sitios</span>
                        <span style={{ fontSize: 10 }}>▲</span>
                    </div>
                    <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {['Mis documentos', 'Mis imágenes', 'Mi música', 'Mis sitios de red'].map(place => (
                            <a key={place} href="#" onClick={e => e.preventDefault()} style={{
                                color: '#0066cc', fontSize: 11, textDecoration: 'none',
                                display: 'flex', alignItems: 'center', gap: 4,
                            }}
                                onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                                onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                            >
                                {place}
                            </a>
                        ))}
                    </div>

                    {/* Detalles */}
                    <div style={{
                        background: 'linear-gradient(to bottom, #3169c0, #2254a8)',
                        color: 'white', padding: '4px 8px',
                        fontSize: 11, fontWeight: 'bold',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        cursor: 'pointer',
                        marginTop: 4,
                    }}>
                        <span>Detalles</span>
                        <span style={{ fontSize: 10 }}>▲</span>
                    </div>
                    {selected && (
                        <div style={{ padding: '6px 8px', fontSize: 11 }}>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>{selected}</p>
                            <p style={{ margin: '2px 0', color: '#555' }}>Documento PDF</p>
                            <p style={{ margin: '2px 0', color: '#555' }}>Modificado: 01/04/2026</p>
                        </div>
                    )}
                </div>

                {/* Right: File list */}
                <div
                    style={{
                        flex: 1,
                        background: 'white',
                        overflowY: 'auto',
                        padding: 16,
                    }}
                    onClick={() => setSelected(null)}
                >
                    {/* Single file: PLAN FINAL.pdf */}
                    <div
                        style={{
                            display: 'inline-flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                            padding: 8,
                            cursor: 'default',
                            borderRadius: 2,
                            background: selected === 'PLAN FINAL.pdf' ? '#cce5ff' : 'transparent',
                            border: selected === 'PLAN FINAL.pdf' ? '1px dotted #0066cc' : '1px solid transparent',
                            userSelect: 'none',
                        }}
                        onClick={e => { e.stopPropagation(); setSelected('PLAN FINAL.pdf'); }}
                        onDoubleClick={openPdf}
                    >
                        <PdfIcon />
                        <span style={{
                            fontSize: 11,
                            textAlign: 'center',
                            maxWidth: 80,
                            background: selected === 'PLAN FINAL.pdf' ? '#0a246a' : 'transparent',
                            color: selected === 'PLAN FINAL.pdf' ? 'white' : 'black',
                            padding: '1px 2px',
                        }}>
                            PLAN FINAL.pdf
                        </span>
                    </div>
                </div>
            </div>

            {/* Status bar */}
            <div style={{
                background: '#d4d0c8',
                borderTop: '1px solid #808080',
                padding: '2px 8px',
                fontSize: 11,
                display: 'flex', gap: 16,
            }}>
                <span>{selected ? '1 objeto seleccionado' : '1 objeto'}</span>
            </div>
        </div>
    );
}

// ── Route ─────────────────────────────────────────────────────────────────────

export const ReglamentosRoute = () => {
    const { user } = useAuth();
    const [unlocked, setUnlocked] = useState(
        () => user?.progress?.steps?.step5?.substeps?.folderUnlocked ?? false
    );

    if (!unlocked) {
        return <PasswordDialog onUnlocked={() => setUnlocked(true)} />;
    }

    return <FileExplorer />;
};

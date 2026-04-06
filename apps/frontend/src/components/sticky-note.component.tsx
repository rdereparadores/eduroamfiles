import { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';

type PhraseEntry = { word: string; unlocked: boolean };

export function StickyNote() {
    const [phrase, setPhrase] = useState<PhraseEntry[]>([]);

    useEffect(() => {
        const fetchPhrase = () => {
            fetch('/api/user', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
                .then(r => r.json())
                .then(u => setPhrase(u?.progress?.finalPhrase ?? []))
                .catch(() => {});
        };
        fetchPhrase();
        const id = setInterval(fetchPhrase, 3000);
        return () => clearInterval(id);
    }, []);

    return (
        <Rnd
            default={{ x: 20, y: 20, width: 170, height: 'auto' as any }}
            minWidth={140}
            enableResizing={false}
            dragHandleClassName="sticky-handle"
            style={{ zIndex: 50 }}
        >
            <div style={{
                background: '#fef08a',
                border: '1px solid #ca8',
                boxShadow: '3px 3px 6px rgba(0,0,0,0.25)',
                fontFamily: '"Pixelated MS Sans Serif", Tahoma, sans-serif',
                fontSize: 11,
                userSelect: 'none',
            }}>
                {/* Handle bar */}
                <div
                    className="sticky-handle"
                    style={{
                        background: '#facc15',
                        borderBottom: '1px solid #ca8',
                        padding: '3px 6px',
                        cursor: 'move',
                        fontSize: 10,
                        color: '#555',
                    }}
                >
                    Nota
                </div>

                {/* Words */}
                <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {phrase.map((p, i) => (
                        <div
                            key={i}
                            onClick={() => p.unlocked && navigator.clipboard.writeText(btoa(p.word))}
                            style={{
                                fontFamily: 'monospace', fontSize: 11,
                                color: p.unlocked ? '#111' : '#ccc',
                                cursor: p.unlocked ? 'copy' : 'default',
                            }}
                        >
                            {p.unlocked ? btoa(p.word) : '· · · · ·'}
                        </div>
                    ))}
                </div>
            </div>
        </Rnd>
    );
}

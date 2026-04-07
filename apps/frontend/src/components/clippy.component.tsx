import { useEffect, useState } from 'react';
import ClippyImg from '../assets/winxp/clippy.webp';

type Progress = {
    steps: {
        step1: { substeps: { whatsappUnlocked: boolean }; completed: boolean };
        step2: { substeps: { urlAccessed: boolean }; completed: boolean };
        step3: { substeps: { pabloContactUnlocked: boolean }; completed: boolean };
        step4: { substeps: { imageSent: boolean; secretariaContactUnlocked: boolean }; completed: boolean };
        step5: { substeps: { videoSent: boolean; folderUnlocked: boolean }; completed: boolean };
    };
    finalPhrase: { word: string; unlocked: boolean }[];
};

function getHint(progress: Progress | undefined): string {
    if (!progress) {
        return 'Parece que acabas de llegar... Hay cosas interesantes en este escritorio. ¿Las has explorado todas?';
    }

    const { steps, finalPhrase } = progress;

    // Final phrase complete
    const allUnlocked = finalPhrase.every(p => p.unlocked);
    if (allUnlocked) {
        return 'Lo has encontrado todo. La verdad estaba ahí desde el principio.';
    }

    // Step 5 complete — looking for phrase words
    if (steps.step5.completed) {
        const count = finalPhrase.filter(p => p.unlocked).length;
        if (count === 0) {
            return 'Algo no cuadra... La historia no termina aquí. Dicen que las respuestas a veces se esconden a plena vista.';
        }
        return `${count} de 6. Hay más de lo que parece en estas aplicaciones.`;
    }

    // Step 5 in progress
    if (steps.step4.completed) {
        const s = steps.step5.substeps;
        if (!s.videoSent) {
            return 'La secretaria recibió tu mensaje. ¿Te habrá respondido ya?';
        }
        if (!s.videoDecoded) {
            return 'Ese vídeo no es solo un vídeo. MetaSeal puede ver lo que el ojo no alcanza.';
        }
        if (!s.folderUnlocked) {
            return 'Encontraste algo codificado. Todo en este reto habla el mismo idioma... ¿cuál será?';
        }
        return 'Esa carpeta lleva tiempo esperando ser abierta...';
    }

    // Step 4 in progress
    if (steps.step3.completed) {
        const s = steps.step4.substeps;
        if (!s.imageSent && !s.secretariaContactUnlocked) {
            return 'Pablo te envió algo. Esa imagen esconde más de lo que parece; ya sabes qué herramienta usar.';
        }
        if (!s.secretariaContactUnlocked) {
            return 'Lo que encontraste en esa imagen... parece un número. ¿Lo has buscado en WhatsApp 2?';
        }
        if (!s.imageSent) {
            return 'Encontraste a alguien nuevo. Pero falta lo que Pablo te envió; analízalo bien.';
        }
        return 'Casi todo encaja. Revisa si te has dejado algo.';
    }

    // Step 3 in progress
    if (steps.step2.completed) {
        if (!steps.step3.substeps.pabloContactUnlocked) {
            return 'La noticia menciona a alguien. Su contacto podría estar más cerca de lo que crees.';
        }
        return 'Ya tienes el contacto. Pero ¿sabe quién eres realmente? Convéncele.';
    }

    // Step 2 in progress
    if (steps.step1.completed) {
        return 'Hay conversaciones que merecen atención. No todo lo importante viene escrito.';
    }

    // Step 1 not complete
    return 'Hay una aplicación en este escritorio que parece estar protegida. Interesante, ¿verdad?';
}

export function Clippy() {
    const [progress, setProgress] = useState<Progress | undefined>(undefined);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetch_ = () => {
            fetch('/api/user', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
                .then(r => r.json())
                .then(u => setProgress(u?.progress ?? undefined))
                .catch(() => {});
        };
        fetch_();
        const id = setInterval(fetch_, 3000);
        return () => clearInterval(id);
    }, []);

    const hint = getHint(progress);

    return (
        <div
            style={{
                position: 'absolute',
                bottom: 48,
                right: 16,
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 6,
                pointerEvents: 'none',
            }}
        >
            {/* Speech bubble */}
            {open && (
                <div
                    style={{
                        pointerEvents: 'auto',
                        background: '#fffbe6',
                        border: '2px solid #f0c040',
                        borderRadius: 8,
                        padding: '8px 10px',
                        maxWidth: 220,
                        fontSize: 11,
                        fontFamily: 'Tahoma, sans-serif',
                        boxShadow: '2px 2px 6px rgba(0,0,0,0.25)',
                        lineHeight: 1.5,
                        color: '#222',
                        position: 'relative',
                    }}
                >
                    {hint}
                    {/* Tail pointing down-right */}
                    <div style={{
                        position: 'absolute',
                        bottom: -10,
                        right: 24,
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderTop: '10px solid #f0c040',
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: -8,
                        right: 25,
                        width: 0,
                        height: 0,
                        borderLeft: '7px solid transparent',
                        borderRight: '7px solid transparent',
                        borderTop: '9px solid #fffbe6',
                    }} />
                </div>
            )}

            {/* Clippy image */}
            <img
                src={ClippyImg}
                alt="Clippy"
                draggable={false}
                onClick={() => setOpen(v => !v)}
                style={{
                    pointerEvents: 'auto',
                    width: 100,
                    height: 'auto',
                    cursor: 'pointer',
                    filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.4))',
                    userSelect: 'none',
                }}
                title="¿Necesitas ayuda?"
            />
        </div>
    );
}

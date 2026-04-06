import { useState } from 'react';
import { useAuth } from '../hooks/auth.hook';

export function PhraseWord({ word }: { word: string }) {
    const { user, unlockWord } = useAuth();
    const [clicked, setClicked] = useState(false);

    const entry = user?.progress?.finalPhrase?.find(p => p.word === word);
    if (!entry || entry.unlocked || clicked) return null;

    const b64 = btoa(word);

    const handleClick = async () => {
        setClicked(true);
        await unlockWord(word);
    };

    return (
        <strong
            onClick={handleClick}
            title={b64}
            style={{ cursor: 'pointer', userSelect: 'none' }}
        >
            {b64}
        </strong>
    );
}

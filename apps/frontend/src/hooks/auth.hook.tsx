import React, {createContext, useContext, useEffect, useMemo, useState} from "react";

type User = {
    id: number;
    email: string;
    progress: {
        steps: {
            step1: {
                substeps: {
                    whatsappUnlocked: boolean
                },
                completed: boolean
            }
            step2: {
                substeps: {
                    audioPlayed: boolean,
                    urlAccessed: boolean
                },
                completed: boolean
            },
            step3: {
                substeps: {
                    imageDownloaded: boolean,
                    pabloContactUnlocked: boolean
                },
                completed: boolean
            },
            step4: {
                substeps: {
                    imageSent: boolean,
                    secretariaContactUnlocked: boolean
                },
                completed: boolean
            },
            step5: {
                substeps: {
                    videoSent: boolean,
                    videoDecoded: boolean,
                    folderUnlocked: boolean
                },
                completed: boolean
            }
        },
        finalPhrase: [
            { "word": "la", "unlocked": boolean },
            { "word": "contraseña", "unlocked": boolean },
            { "word": "del", "unlocked": boolean },
            { "word": "proyecto", "unlocked": boolean },
            { "word": "nose", "unlocked": boolean },
            { "word": "es", "unlocked": boolean }
        ]
    }
}

type AuthContextType = {
    user: User | null | undefined;
    signin: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    signout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<User | null | undefined>(undefined);

    useEffect(() => {
        fetch('/api/user', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok)
                    throw new Error();
                return res.json();
            })
            .then(u => setUser(u))
            .catch(err => setUser(null));
    }, []);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    const signin = async (email: string, password: string) => {
        const res = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            alert('Usuario o contraseña incorrectos');
            throw new Error();
        }

        const json = await res.json() as { access_token: string };
        setToken(json.access_token);
    }

    const signup = async (email: string, password: string) => {
        const res = await fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const json = await res.json();

        if (!res.ok) {
            alert('Error al crear el usuario: ' + json);
            throw new Error();
        }
    }

    const signout = () => {
        setToken(null);
        window.location.href = '/auth/signin';
    }

    const value = useMemo(() => ({ signin, signup, user, signout }), [user]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthContext');
    }
    return context;
}
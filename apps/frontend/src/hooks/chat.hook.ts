import { useCallback, useEffect, useState } from 'react';

export interface ChatMessage {
    role: 'user' | 'bot';
    content: string;
    fileUrl?: string;
    createdAt: string;
}

export interface Chat {
    id: number;
    botName: string;
    botImgUrl: string;
    conversation: ChatMessage[];
    updatedAt: string;
}

function authHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

export function useChats() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const fetch_ = async () => {
            const res = await fetch('/api/chat', { headers: authHeaders() });
            if (res.ok && active) {
                setChats(await res.json());
                setLoading(false);
            }
        };

        fetch_();
        const interval = setInterval(fetch_, 2000);
        return () => { active = false; clearInterval(interval); };
    }, []);

    return { chats, loading };
}

export function useChat(chatId: number) {
    const [chat, setChat] = useState<Chat | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const fetch_ = async () => {
            const res = await fetch(`/api/chat/${chatId}`, { headers: authHeaders() });
            if (res.ok && active) {
                setChat(await res.json());
                setLoading(false);
            }
        };

        fetch_();
        const interval = setInterval(fetch_, 2000);
        return () => { active = false; clearInterval(interval); };
    }, [chatId]);

    const sendMessage = useCallback(async (content: string, fileUrl?: string) => {
        const body: Record<string, string> = { role: 'user', content };
        if (fileUrl) body.fileUrl = fileUrl;

        await fetch(`/api/chat/${chatId}/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify(body),
        });
    }, [chatId]);

    return { chat, loading, sendMessage };
}

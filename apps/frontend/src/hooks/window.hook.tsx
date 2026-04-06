import {createContext, useContext, useMemo, useState} from "react";
import {WindowComponent} from '../components/window.component.tsx';

type Window = {
    id: string;
    title: string;
    open: boolean;
    minimized: boolean;
    link: string;
}

const initialWindows: Window[] = [
    { id: 'whatsapp2', title: 'Whatsapp 2', open: false, minimized: false, link: '/apps/whatsapp2' },
    { id: 'eduroamfiles', title: 'Eduroam Files', open: false, minimized: false, link: '/apps/eduroamfiles' },
    { id: 'browser', title: 'Internet Explorer', open: false, minimized: false, link: '/apps/browser' },
    { id: 'lsbtool', title: 'Herramienta LSB', open: false, minimized: false, link: '/apps/lsbtool' },
    { id: 'reglamentos', title: 'Reglamentos', open: false, minimized: false, link: '/apps/reglamentos' },
    { id: 'metaseal', title: 'MetaSeal', open: false, minimized: false, link: '/apps/metaseal/' },
]

type WindowContextType = {
    windows: Window[];

    get: (id: string) => Window;
    open: (id: string) => void;
    close: (id: string) => void;
    toggleMinimize: (id: string) => void;
}

const WindowContext = createContext<WindowContextType | undefined>(undefined);

export function WindowProvider({ children }: { children: React.ReactNode }) {
    const [windows, setWindows] = useState<Window[]>(initialWindows);

    const get = (id: string) => {
        return windows.find(w => w.id === id)!;
    }

    const open = (id: string) => {
        setWindows(windows.map(w => ({ ...w, open: w.id === id ? true : w.open })));
    }

    const toggleMinimize = (id: string) => {
        setWindows(windows.map(w => ({ ...w, minimized: w.id === id ? !w.minimized : w.minimized })));
    }

    const close = (id: string) => {
        setWindows(windows.map(w => ({ ...w, open: w.id === id ? false : w.open })));
    }

    const value = useMemo(() => ({ windows, open, close, toggleMinimize, get }), [windows]);
    return <WindowContext.Provider value={value}>
        {children}
        {
            windows.map(w => ((w.open && !w.minimized) && <WindowComponent key={w.id} id={w.id} />))
        }
    </WindowContext.Provider>
}

export function useWindow() {
    const context = useContext(WindowContext);
    if (!context) {
        throw new Error('useWindow debe usarse dentro de WindowProvider');
    }
    return context;
}
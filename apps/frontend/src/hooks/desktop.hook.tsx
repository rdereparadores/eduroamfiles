import React, {createContext, useContext, useMemo, useState} from "react";

type DesktopContextType = {
    selectedIcon: string | undefined;
    setSelectedIcon: (id: string | undefined) => void;
}

const DesktopContext = createContext<DesktopContextType | undefined>(undefined);

export function DesktopProvider({ children }: { children: React.ReactNode }) {
    const [selectedIcon, setSelectedIconPrim] = useState<string>();

    const setSelectedIcon = (id: string | undefined) => {
        if (selectedIcon === id) {
            setSelectedIconPrim(undefined);
        } else {
            setSelectedIconPrim(id);
        }
    }

    const value = useMemo(() => ({
        selectedIcon,
        setSelectedIcon,
    }), [selectedIcon]);
    return <DesktopContext.Provider value={value}>{children}</DesktopContext.Provider>
}

export function useDesktop() {
    const context = useContext(DesktopContext);
    if (!context) {
        throw new Error('useDesktop debe usarse dentro de DesktopProvider');
    }
    return context;
}
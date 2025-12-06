import React, { createContext, useContext, useState, type ReactNode } from 'react';

export interface ComposeData {
    to?: string;
    subject?: string;
    body?: string; // HTML string for reply quotes
    replyToId?: string;
}

interface ComposeContextType {
    isOpen: boolean;
    minimized: boolean;
    openCompose: (data?: ComposeData) => void;
    closeCompose: () => void;
    toggleMinimize: () => void;
    composeData: ComposeData;
}

const ComposeContext = createContext<ComposeContextType | undefined>(undefined);

export const ComposeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [composeData, setComposeData] = useState<ComposeData>({});

    const openCompose = (data: ComposeData = {}) => {
        setComposeData(data);
        setIsOpen(true);
        setMinimized(false);
    };

    const closeCompose = () => {
        setIsOpen(false);
        setComposeData({});
    };

    const toggleMinimize = () => {
        setMinimized((prev) => !prev);
    };

    return (
        <ComposeContext.Provider value={{ isOpen, minimized, openCompose, closeCompose, toggleMinimize, composeData }}>
            {children}
        </ComposeContext.Provider>
    );
};

export const useCompose = () => {
    const context = useContext(ComposeContext);
    if (!context) {
        throw new Error('useCompose must be used within a ComposeProvider');
    }
    return context;
};
import React, { useState } from 'react';
import Window from './Window';
import Taskbar from './Taskbar';
import VSCodeApp from './apps/VSCodeApp';
import BrowserApp from './apps/BrowserApp';
import GitHubApp from './apps/GitHubApp';
import GamesApp from './apps/GamesApp';
import WalletAnalyzerApp from './apps/WalletAnalyzerApp';
import HelpApp from './apps/HelpApp';
import GuideCharacter from './GuideCharacter';
import './Desktop.css';

interface WindowState {
    id: string;
    title: string;
    icon: string;
    component: React.ReactNode;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
}

const Desktop: React.FC = () => {
    const [windows, setWindows] = useState<WindowState[]>([]);
    const [activeWindow, setActiveWindow] = useState<string | null>(null);
    const [highestZ, setHighestZ] = useState(100);

    const desktopIcons = [
        { id: 'vscode', name: 'VS Code', icon: '/icons/vscode.png', color: '#007ACC' },
        { id: 'browser', name: 'Browser', icon: '/icons/chrome.png', color: '#4285F4' },
        { id: 'github', name: 'GitHub', icon: '/icons/github.png', color: '#6e5494' },
        { id: 'games', name: 'Game Center', icon: '/icons/appliance.png', color: '#FF6B6B' },
        { id: 'analyzer', name: 'Wallet Analyzer', icon: '/icons/windows.png', color: '#14F195' },
        { id: 'help', name: 'Get Started', icon: '/icons/question-mark.png', color: '#F06292' },
    ];

    const openWindow = (appId: string) => {
        const existingWindow = windows.find(w => w.id === appId);
        if (existingWindow) {
            bringToFront(appId);
            if (existingWindow.isMinimized) {
                setWindows(prev => prev.map(w =>
                    w.id === appId ? { ...w, isMinimized: false } : w
                ));
            }
            return;
        }

        const newZ = highestZ + 1;
        setHighestZ(newZ);

        const isMobile = window.innerWidth < 768;
        const defaultSize = isMobile
            ? { width: window.innerWidth - 20, height: window.innerHeight - 100 }
            : { width: 900, height: 600 };
        const defaultPos = isMobile
            ? { x: 10, y: 10 }
            : { x: 50 + windows.length * 30, y: 50 + windows.length * 30 };

        let windowConfig: Partial<WindowState> = {};

        switch (appId) {
            case 'vscode':
                windowConfig = {
                    title: 'VS Code - kawai project',
                    icon: '/icons/vscode.png',
                    component: <VSCodeApp />,
                };
                break;
            case 'browser':
                windowConfig = {
                    title: 'Browser',
                    icon: '/icons/chrome.png',
                    component: <BrowserApp />,
                };
                break;
            case 'github':
                windowConfig = {
                    title: 'GitHub Desktop',
                    icon: '/icons/github.png',
                    component: <GitHubApp />,
                };
                break;
            case 'games':
                windowConfig = {
                    title: 'Kawai Game Center',
                    icon: '/icons/appliance.png',
                    component: <GamesApp />,
                };
                break;
            case 'analyzer':
                windowConfig = {
                    title: 'Wallet Analyzer',
                    icon: '/icons/windows.png',
                    component: <WalletAnalyzerApp />,
                };
                break;
            case 'help':
                windowConfig = {
                    title: 'Kawai Documentation',
                    icon: '/icons/question-mark.png',
                    component: <HelpApp />,
                };
                break;
        }

        const newWindow: WindowState = {
            id: appId,
            title: windowConfig.title || 'Window',
            icon: windowConfig.icon || '📁',
            component: windowConfig.component || <div>App</div>,
            isMinimized: false,
            isMaximized: isMobile,
            zIndex: newZ,
            position: defaultPos,
            size: defaultSize,
        };

        setWindows(prev => [...prev, newWindow]);
        setActiveWindow(appId);
    };

    const closeWindow = (id: string) => {
        setWindows(prev => prev.filter(w => w.id !== id));
        if (activeWindow === id) {
            const remaining = windows.filter(w => w.id !== id);
            setActiveWindow(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
        }
    };

    const minimizeWindow = (id: string) => {
        setWindows(prev => prev.map(w =>
            w.id === id ? { ...w, isMinimized: true } : w
        ));
    };

    const maximizeWindow = (id: string) => {
        setWindows(prev => prev.map(w =>
            w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
        ));
    };

    const bringToFront = (id: string) => {
        const newZ = highestZ + 1;
        setHighestZ(newZ);
        setWindows(prev => prev.map(w =>
            w.id === id ? { ...w, zIndex: newZ } : w
        ));
        setActiveWindow(id);
    };

    const updateWindowPosition = (id: string, position: { x: number; y: number }) => {
        setWindows(prev => prev.map(w =>
            w.id === id ? { ...w, position } : w
        ));
    };

    const updateWindowSize = (id: string, size: { width: number; height: number }) => {
        setWindows(prev => prev.map(w =>
            w.id === id ? { ...w, size } : w
        ));
    };

    return (
        <div className="desktop">
            {/* Desktop Background Pattern */}
            <div className="desktop-bg">
                <div className="grid-pattern"></div>
                <div className="gradient-overlay"></div>
            </div>

            {/* Desktop Icons */}
            <div className="desktop-icons">
                {desktopIcons.map((icon) => (
                    <div
                        key={icon.id}
                        className="desktop-icon"
                        onDoubleClick={() => openWindow(icon.id)}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            openWindow(icon.id);
                        }}
                    >
                        <div className="icon-image">
                            <img src={icon.icon} alt={icon.name} />
                        </div>
                        <span className="icon-label">{icon.name}</span>
                    </div>
                ))}
            </div>

            {/* Windows */}
            {windows.map((win) => (
                <Window
                    key={win.id}
                    id={win.id}
                    title={win.title}
                    icon={win.icon}
                    isMinimized={win.isMinimized}
                    isMaximized={win.isMaximized}
                    isActive={activeWindow === win.id}
                    zIndex={win.zIndex}
                    position={win.position}
                    size={win.size}
                    onClose={() => closeWindow(win.id)}
                    onMinimize={() => minimizeWindow(win.id)}
                    onMaximize={() => maximizeWindow(win.id)}
                    onFocus={() => bringToFront(win.id)}
                    onPositionChange={(pos) => updateWindowPosition(win.id, pos)}
                    onSizeChange={(size) => updateWindowSize(win.id, size)}
                >
                    {win.component}
                </Window>
            ))}

            {/* 3D Character Guide */}
            <GuideCharacter />

            {/* Taskbar */}
            <Taskbar
                windows={windows}
                activeWindow={activeWindow}
                onWindowClick={(id) => {
                    const win = windows.find(w => w.id === id);
                    if (win?.isMinimized) {
                        setWindows(prev => prev.map(w =>
                            w.id === id ? { ...w, isMinimized: false } : w
                        ));
                    }
                    bringToFront(id);
                }}
                onAppClick={openWindow}
            />
        </div>
    );
};

export default Desktop;

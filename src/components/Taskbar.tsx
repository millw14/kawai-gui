import React, { useState, useEffect } from 'react';
import './Taskbar.css';

interface TaskbarProps {
    windows: Array<{
        id: string;
        title: string;
        icon: string;
        isMinimized: boolean;
    }>;
    activeWindow: string | null;
    onWindowClick: (id: string) => void;
    onAppClick: (id: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ 
    windows, 
    activeWindow, 
    onWindowClick,
    onAppClick 
}) => {
    const [time, setTime] = useState(new Date());
    const [showStart, setShowStart] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const quickApps = [
        { id: 'vscode', icon: '/icons/vscode.png', label: 'VS Code' },
        { id: 'browser', icon: '/icons/chrome.png', label: 'Browser' },
        { id: 'github', icon: '/icons/github.png', label: 'GitHub' },
        { id: 'games', icon: '/icons/appliance.png', label: 'Games' },
    ];

    return (
        <div className="taskbar">
            {/* Start Button */}
            <button 
                className={`start-button ${showStart ? 'active' : ''}`}
                onClick={() => setShowStart(!showStart)}
            >
                <span className="start-icon">🌸</span>
            </button>

            {/* Start Menu */}
            {showStart && (
                <div className="start-menu">
                    <div className="start-header">
                        <img src="/icons/milla.png" alt="Milla" className="start-avatar" />
                        <span>Milla's PC</span>
                    </div>
                    <div className="start-apps">
                        {quickApps.map(app => (
                            <button 
                                key={app.id}
                                className="start-app-item"
                                onClick={() => {
                                    onAppClick(app.id);
                                    setShowStart(false);
                                }}
                            >
                                <img src={app.icon} alt={app.label} className="start-app-icon" />
                                <span>{app.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="start-footer">
                        <button className="start-power">⏻ Power</button>
                    </div>
                </div>
            )}

            {/* Quick Launch */}
            <div className="taskbar-divider"></div>
            <div className="quick-launch">
                {quickApps.map(app => (
                    <button 
                        key={app.id}
                        className="quick-launch-btn"
                        title={app.label}
                        onClick={() => onAppClick(app.id)}
                    >
                        <img src={app.icon} alt={app.label} />
                    </button>
                ))}
            </div>

            {/* Open Windows */}
            <div className="taskbar-divider"></div>
            <div className="taskbar-windows">
                {windows.map(win => (
                    <button
                        key={win.id}
                        className={`taskbar-window-btn ${activeWindow === win.id ? 'active' : ''} ${win.isMinimized ? 'minimized' : ''}`}
                        onClick={() => onWindowClick(win.id)}
                    >
                        <img src={win.icon} alt={win.title} className="taskbar-window-icon" />
                        <span className="taskbar-window-title">{win.title}</span>
                    </button>
                ))}
            </div>

            {/* System Tray */}
            <div className="system-tray">
                <div className="tray-icons">
                    <span className="tray-icon">🔊</span>
                    <span className="tray-icon">📶</span>
                    <span className="tray-icon">🔋</span>
                </div>
                <div className="taskbar-clock">
                    <span className="clock-time">{formatTime(time)}</span>
                    <span className="clock-date">{formatDate(time)}</span>
                </div>
            </div>

            {/* Click outside to close start menu */}
            {showStart && (
                <div 
                    className="start-overlay"
                    onClick={() => setShowStart(false)}
                />
            )}
        </div>
    );
};

export default Taskbar;

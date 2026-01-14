import React, { useRef, useState, useEffect } from 'react';
import './Window.css';

interface WindowProps {
    id: string;
    title: string;
    icon: string;
    children: React.ReactNode;
    isMinimized: boolean;
    isMaximized: boolean;
    isActive: boolean;
    zIndex: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
    onClose: () => void;
    onMinimize: () => void;
    onMaximize: () => void;
    onFocus: () => void;
    onPositionChange: (pos: { x: number; y: number }) => void;
    onSizeChange: (size: { width: number; height: number }) => void;
}

const Window: React.FC<WindowProps> = ({
    id,
    title,
    icon,
    children,
    isMinimized,
    isMaximized,
    isActive,
    zIndex,
    position,
    size,
    onClose,
    onMinimize,
    onMaximize,
    onFocus,
    onPositionChange,
    onSizeChange,
}) => {
    const windowRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isMaximized) return;
        onFocus();
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (isMaximized) return;
        onFocus();
        const touch = e.touches[0];
        setIsDragging(true);
        setDragOffset({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y,
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                onPositionChange({
                    x: Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 100)),
                    y: Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 100)),
                });
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (isDragging) {
                const touch = e.touches[0];
                onPositionChange({
                    x: Math.max(0, Math.min(touch.clientX - dragOffset.x, window.innerWidth - 100)),
                    y: Math.max(0, Math.min(touch.clientY - dragOffset.y, window.innerHeight - 100)),
                });
            }
        };

        const handleEnd = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchend', handleEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging, dragOffset, onPositionChange]);

    if (isMinimized) return null;

    const windowStyle: React.CSSProperties = isMaximized
        ? {
            top: 0,
            left: 0,
            width: '100vw',
            height: 'calc(100vh - 50px)',
            zIndex,
            borderRadius: 0,
        }
        : {
            top: position.y,
            left: position.x,
            width: size.width,
            height: size.height,
            zIndex,
        };

    return (
        <div
            ref={windowRef}
            className={`window ${isActive ? 'active' : ''} ${isMaximized ? 'maximized' : ''}`}
            style={windowStyle}
            onMouseDown={onFocus}
        >
            {/* Title Bar */}
            <div 
                className="window-titlebar"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onDoubleClick={onMaximize}
            >
                <div className="titlebar-left">
                    <img src={icon} alt="" className="window-icon" />
                    <span className="window-title">{title}</span>
                </div>
                <div className="titlebar-buttons">
                    <button 
                        className="titlebar-btn minimize"
                        onClick={(e) => { e.stopPropagation(); onMinimize(); }}
                    >
                        <span>─</span>
                    </button>
                    <button 
                        className="titlebar-btn maximize"
                        onClick={(e) => { e.stopPropagation(); onMaximize(); }}
                    >
                        <span>{isMaximized ? '❐' : '□'}</span>
                    </button>
                    <button 
                        className="titlebar-btn close"
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                    >
                        <span>✕</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="window-content">
                {children}
            </div>

            {/* Resize Handle */}
            {!isMaximized && (
                <div 
                    className="resize-handle"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsResizing(true);
                    }}
                />
            )}
        </div>
    );
};

export default Window;

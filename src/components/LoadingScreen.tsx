import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
    onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [text, setText] = useState('Booting up...');

    const loadingTexts = [
        'Booting up...',
        'Loading kawai assets...',
        'Preparing your workspace...',
        'Almost there~! ♡',
        'Welcome!'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + Math.random() * 15;
                if (newProgress >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 500);
                    return 100;
                }
                setText(loadingTexts[Math.floor((newProgress / 100) * loadingTexts.length)]);
                return newProgress;
            });
        }, 200);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="loading-screen">
            <div className="loading-content">
                {/* Cute mascot */}
                <div className="loading-mascot">
                    <div className="mascot-face">
                        <div className="mascot-eyes">
                            <div className="eye left">
                                <div className="pupil"></div>
                            </div>
                            <div className="eye right">
                                <div className="pupil"></div>
                            </div>
                        </div>
                        <div className="mascot-blush left"></div>
                        <div className="mascot-blush right"></div>
                        <div className="mascot-mouth">ω</div>
                    </div>
                    <div className="mascot-ears">
                        <div className="ear left"></div>
                        <div className="ear right"></div>
                    </div>
                </div>

                <h1 className="loading-title">Milla's PC</h1>
                <p className="loading-subtitle">✨ Virtual Desktop Experience ✨</p>

                {/* Progress bar */}
                <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}>
                        <div className="progress-glow"></div>
                    </div>
                </div>
                <p className="loading-text">{text}</p>

                {/* Floating particles */}
                <div className="particles">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="particle" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}>✦</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;

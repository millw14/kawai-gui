import React, { useState, useEffect } from 'react';

interface DialogueBoxProps {
    message: string;
    onComplete?: () => void;
}

const DialogueBox: React.FC<DialogueBoxProps> = ({ message, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [index, setIndex] = useState(0);

    useEffect(() => {
        setDisplayedText('');
        setIndex(0);
    }, [message]);

    useEffect(() => {
        if (index < message.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + message[index]);
                setIndex((prev) => prev + 1);
            }, 30);
            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [index, message, onComplete]);

    return (
        <div className="dialogue-box glass-card" style={{
            position: 'absolute',
            bottom: '10%',
            right: '10%',
            width: '300px',
            padding: '20px',
            zIndex: 100,
            fontSize: '1rem',
            lineHeight: '1.5',
            color: '#5d5d5d',
            borderBottomRightRadius: '4px'
        }}>
            <div style={{ fontWeight: 'bold', color: '#ff8fa3', marginBottom: '8px' }}>Kawai-chan 🌸</div>
            <div>{displayedText}</div>
            {index === message.length && (
                <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '0.8rem', opacity: 0.5 }}>
                    Click to continue...
                </div>
            )}
        </div>
    );
};

export default DialogueBox;

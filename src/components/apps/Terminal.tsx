import React, { useState, useEffect, useRef } from 'react';
import { VscAdd, VscTrash, VscChevronUp, VscChromeClose } from 'react-icons/vsc';
import './Terminal.css';

interface TerminalProps {
    onClose?: () => void;
}

interface LogLine {
    text: string;
    type?: 'command' | 'output' | 'error' | 'success' | 'info' | 'matrix';
    id: number;
}

const Terminal: React.FC<TerminalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('TERMINAL');
    const [inputObj, setInputObj] = useState('');
    const [history, setHistory] = useState<LogLine[]>([
        { text: 'Kawai Solana Terminal v1.0.0', type: 'info', id: 0 },
        { text: 'Type "help" for available commands', type: 'output', id: 1 }
    ]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleCommand = async (cmd: string) => {
        const trimmedCmd = cmd.trim();
        if (!trimmedCmd) return;

        setCommandHistory(prev => [...prev, trimmedCmd]);
        setHistoryIndex(-1);

        // Add command to history
        setHistory(prev => [...prev, {
            text: `> ${trimmedCmd}`,
            type: 'command',
            id: Date.now()
        }]);

        const args = trimmedCmd.split(' ');
        const command = args[0].toLowerCase();

        // Process commands
        switch (command) {
            case 'help':
                addLog([
                    'Available commands:',
                    '  help           - Show this help message',
                    '  clear          - Clear terminal',
                    '  solana price   - Get current SOL price',
                    '  solana tps     - Monitor network TPS',
                    '  solana meme    - Generate random meme token idea',
                    '  solana grind   - Search for vanity address',
                    '  echo [text]    - Print text'
                ].join('\n'), 'output');
                break;

            case 'clear':
                setHistory([]);
                break;

            case 'echo':
                addLog(args.slice(1).join(' '), 'output');
                break;

            case 'solana':
                if (args[1] === 'price') {
                    addLog('Fetching Solana price...', 'info');
                    setTimeout(() => {
                        const price = (140 + Math.random() * 10).toFixed(2);
                        addLog(`SOL/USD: $${price} 🟢 (+${(Math.random() * 5).toFixed(2)}%)`, 'success');
                    }, 800);
                } else if (args[1] === 'tps') {
                    addLog('Connecting to cluster...', 'info');
                    let tpsCount = 0;
                    const interval = setInterval(() => {
                        if (tpsCount > 5) {
                            clearInterval(interval);
                            return;
                        }
                        const tps = Math.floor(2000 + Math.random() * 1000);
                        addLog(`Current TPS: ${tps} ⚡`, 'matrix');
                        tpsCount++;
                    }, 800);
                } else if (args[1] === 'meme') {
                    const prefixes = ['Bonk', 'Wif', 'Pepe', 'Doge', 'Cat', 'Moon', 'Rocket', 'Elon'];
                    const suffixes = ['Inu', 'Coin', 'Hat', 'Safe', 'Moon', 'Rocket', 'Gem', 'Dao'];
                    const name = prefixes[Math.floor(Math.random() * prefixes.length)] +
                        suffixes[Math.floor(Math.random() * suffixes.length)];
                    addLog(`Generated Token: $${name.toUpperCase()}`, 'info');
                    addLog(`Contract: ${generateFakeAddress()} (simulated)`, 'output');
                } else if (args[1] === 'grind') {
                    addLog('Searching for vanity address start with "kawai"...', 'info');
                    setTimeout(() => {
                        addLog(`Found: kawai${generateFakeAddress().substring(0, 4)}...`, 'success');
                    }, 1500);
                } else {
                    addLog('Unknown solana subcommand. Try "help".', 'error');
                }
                break;

            default:
                addLog(`Command not found: ${command}`, 'error');
        }
    };

    const generateFakeAddress = () => {
        const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let addr = '';
        for (let i = 0; i < 44; i++) addr += chars.charAt(Math.floor(Math.random() * chars.length));
        return addr;
    };

    const addLog = (text: string, type: LogLine['type'] = 'output') => {
        setHistory(prev => [...prev, { text, type, id: Date.now() + Math.random() }]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCommand(inputObj);
            setInputObj('');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInputObj(commandHistory[commandHistory.length - 1 - newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInputObj(commandHistory[commandHistory.length - 1 - newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInputObj('');
            }
        }
    };

    return (
        <div className="vscode-terminal">
            <div className="terminal-header">
                <div className="terminal-tabs">
                    {['PROBLEMS', 'OUTPUT', 'DEBUG CONSOLE', 'TERMINAL'].map(tab => (
                        <div
                            key={tab}
                            className={`terminal-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </div>
                    ))}
                </div>
                <div className="terminal-actions">
                    <button className="terminal-action-btn"><VscAdd /></button>
                    <button className="terminal-action-btn"><VscTrash onClick={() => setHistory([])} /></button>
                    <button className="terminal-action-btn" onClick={onClose}><VscChromeClose /></button>
                    <button className="terminal-action-btn"><VscChevronUp /></button>
                </div>
            </div>

            <div className="terminal-body" onClick={() => inputRef.current?.focus()}>
                {history.map((line) => (
                    <div key={line.id} className={`terminal-line ${line.type === 'command' ? 'command' : ''} ${line.type === 'success' ? 'solana-output-success' : ''} ${line.type === 'error' ? 'solana-output-error' : ''} ${line.type === 'info' ? 'solana-output-info' : ''} ${line.type === 'matrix' ? 'solana-matrix-effect' : ''}`}>
                        {line.text}
                    </div>
                ))}

                <div className="terminal-input-line">
                    <span className="prompt-path">~/kawai-project</span>
                    <span className="prompt-arrow">➜</span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="terminal-input"
                        value={inputObj}
                        onChange={(e) => setInputObj(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        spellCheck={false}
                    />
                </div>
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default Terminal;

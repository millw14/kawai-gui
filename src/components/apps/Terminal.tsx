import React, { useState, useEffect, useRef } from 'react';
import { VscAdd, VscTrash, VscChevronUp, VscChromeClose } from 'react-icons/vsc';
import { Connection, Keypair } from '@solana/web3.js';
import './Terminal.css';

interface TerminalProps {
    onClose?: () => void;
}

interface LogLine {
    text: string;
    type?: 'command' | 'output' | 'error' | 'success' | 'info' | 'matrix';
    id: number;
}

const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';

const Terminal: React.FC<TerminalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('TERMINAL');
    const [inputObj, setInputObj] = useState('');
    const [history, setHistory] = useState<LogLine[]>([
        { text: 'Kawai Solana Terminal v1.1.0 (Connected to Mainnet Beta)', type: 'info', id: 0 },
        { text: 'Type "help" for available commands', type: 'output', id: 1 }
    ]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const connection = useRef(new Connection(RPC_ENDPOINT));

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
                    '  solana price   - Get REAL live SOL price (Jupiter API)',
                    '  solana tps     - Monitor REAL network TPS',
                    '  solana meme    - Generate meme token ideas',
                    '  solana grind [prefix] - Find a vanity address (real keypair)',
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
                    addLog('Fetching real SOL price from Jupiter...', 'info');
                    try {
                        const response = await fetch('https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112');
                        const data = await response.json();
                        const price = data?.data?.['So11111111111111111111111111111111111111112']?.price;

                        if (price) {
                            addLog(`SOL/USD: $${parseFloat(price).toFixed(3)} 🟢`, 'success');
                        } else {
                            addLog('Failed to fetch price.', 'error');
                        }
                    } catch (e) {
                        addLog('Error fetching price: ' + String(e), 'error');
                    }
                } else if (args[1] === 'tps') {
                    addLog('Connecting to Solana Mainnet RPC...', 'info');

                    try {
                        const samples = await connection.current.getRecentPerformanceSamples(3);
                        if (samples.length > 0) {
                            const tps = samples[0].numTransactions / samples[0].samplePeriodSecs;
                            addLog(`Current TPS: ${tps.toFixed(2)} ⚡ (Slot: ${samples[0].slot})`, 'matrix');
                        } else {
                            addLog('No TPS data available.', 'error');
                        }
                    } catch (e) {
                        addLog('Error fetching TPS: ' + String(e), 'error');
                    }

                } else if (args[1] === 'meme') {
                    const prefixes = ['Bonk', 'Wif', 'Pepe', 'Doge', 'Cat', 'Moon', 'Rocket', 'Elon', 'Pop', 'Mew'];
                    const suffixes = ['Inu', 'Coin', 'Hat', 'Safe', 'Moon', 'Rocket', 'Gem', 'Dao', 'Ai', 'Gpt'];
                    const name = prefixes[Math.floor(Math.random() * prefixes.length)] +
                        suffixes[Math.floor(Math.random() * suffixes.length)];
                    addLog(`Generated Idea: $${name.toUpperCase()} 🚀`, 'info');
                    addLog(`Simulating launch sequence...`, 'output');
                    setTimeout(() => addLog('Liquidity pool burned 🔥', 'matrix'), 500);
                    setTimeout(() => addLog('Mint authority revoked 🔒', 'matrix'), 1000);

                } else if (args[1] === 'grind') {
                    const prefix = (args[2] || 'kawai').toLowerCase();
                    if (prefix.length > 4) {
                        addLog('Prefix too long for web browser grind (max 4 chars recommended)', 'error');
                        return;
                    }

                    addLog(`Grinding for vanity address starting with "${prefix}"... This is REAL processing.`, 'info');

                    // Allow UI to update before blocking loop
                    setTimeout(() => {
                        const startTime = Date.now();
                        let attempts = 0;
                        let found = false;

                        // Safety timeout 5s
                        const maxTime = 5000;

                        while (Date.now() - startTime < maxTime) {
                            attempts++;
                            const keypair = Keypair.generate();
                            const pubkey = keypair.publicKey.toString();

                            if (pubkey.toLowerCase().startsWith(prefix)) {
                                found = true;
                                addLog(`FOUND in ${attempts} attempts!`, 'success');
                                addLog(`Pubkey: ${pubkey}`, 'matrix');
                                addLog(`Secret: [HIDDEN] (This is a real keypair!)`, 'info');
                                break;
                            }
                        }

                        if (!found) {
                            addLog(`Timed out after ${attempts} attempts. Try a shorter prefix.`, 'error');
                        }
                    }, 100);

                } else {
                    addLog('Unknown solana subcommand. Try "help".', 'error');
                }
                break;

            default:
                addLog(`Command not found: ${command}`, 'error');
        }
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

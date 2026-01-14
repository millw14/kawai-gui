import React, { useState, useEffect, useCallback, useRef } from 'react';
import './GamesApp.css';

type GameType = 'menu' | 'snake' | 'memory' | 'clicker';

const TOKEN_MINT = '6ggxkzDCAB3hjiRFUGdiNfcW2viET3REtsbEmVFXpump';
const REQUIRED_AMOUNT = 1_000_000;

interface WalletState {
    connected: boolean;
    address: string | null;
    balance: number;
    hasEnoughTokens: boolean;
    loading: boolean;
}

const GamesApp: React.FC = () => {
    const [currentGame, setCurrentGame] = useState<GameType>('menu');
    const [wallet, setWallet] = useState<WalletState>({
        connected: false,
        address: null,
        balance: 0,
        hasEnoughTokens: false,
        loading: false,
    });
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'connect' | 'not-holding' | 'holding'>('connect');

    const games = [
        { id: 'snake', name: '🐍 Snake', desc: 'Classic arcade game', color: '#4CAF50' },
        { id: 'memory', name: '🧠 Memory', desc: 'Card matching game', color: '#FF9800' },
        { id: 'clicker', name: '🍪 Cookie Clicker', desc: 'Click to earn!', color: '#E91E63' },
    ];

    const connectWallet = async () => {
        setWallet(prev => ({ ...prev, loading: true }));
        
        try {
            // Check if Phantom or other Solana wallet is installed
            const solana = (window as any).solana;
            
            if (!solana?.isPhantom) {
                alert('Please install Phantom wallet to play games!\n\nGet it at: https://phantom.app');
                setWallet(prev => ({ ...prev, loading: false }));
                return;
            }

            const response = await solana.connect();
            const publicKey = response.publicKey.toString();
            
            // Check token balance using RPC
            const tokenBalance = await checkTokenBalance(publicKey);
            
            const hasEnough = tokenBalance >= REQUIRED_AMOUNT;
            
            setWallet({
                connected: true,
                address: publicKey,
                balance: tokenBalance,
                hasEnoughTokens: hasEnough,
                loading: false,
            });

            // Show appropriate modal
            setModalType(hasEnough ? 'holding' : 'not-holding');
            setShowModal(true);
            
        } catch (error) {
            console.error('Wallet connection error:', error);
            setWallet(prev => ({ ...prev, loading: false }));
            alert('Failed to connect wallet. Please try again.');
        }
    };

    const checkTokenBalance = async (walletAddress: string): Promise<number> => {
        try {
            // Use Helius or public RPC to check token balance
            const response = await fetch('https://api.mainnet-beta.solana.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getTokenAccountsByOwner',
                    params: [
                        walletAddress,
                        { mint: TOKEN_MINT },
                        { encoding: 'jsonParsed' }
                    ]
                })
            });
            
            const data = await response.json();
            
            if (data.result?.value?.length > 0) {
                const balance = data.result.value[0].account.data.parsed.info.tokenAmount.uiAmount;
                return balance || 0;
            }
            return 0;
        } catch (error) {
            console.error('Error checking token balance:', error);
            return 0;
        }
    };

    const handlePlayGame = (gameId: string) => {
        if (!wallet.connected) {
            setModalType('connect');
            setShowModal(true);
            return;
        }

        if (!wallet.hasEnoughTokens) {
            setModalType('not-holding');
            setShowModal(true);
            return;
        }

        setCurrentGame(gameId as GameType);
    };

    const disconnectWallet = async () => {
        try {
            const solana = (window as any).solana;
            if (solana) {
                await solana.disconnect();
            }
        } catch (e) {
            console.error('Disconnect error:', e);
        }
        
        setWallet({
            connected: false,
            address: null,
            balance: 0,
            hasEnoughTokens: false,
            loading: false,
        });
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    return (
        <div className="games-app">
            {/* Wallet Status Bar */}
            <div className="wallet-bar">
                {wallet.connected ? (
                    <div className="wallet-info">
                        <span className="wallet-address">🔗 {formatAddress(wallet.address!)}</span>
                        <span className="token-balance">
                            {wallet.hasEnoughTokens ? '✅' : '❌'} {wallet.balance.toLocaleString()} $KAWAI
                        </span>
                        <button className="disconnect-btn" onClick={disconnectWallet}>Disconnect</button>
                    </div>
                ) : (
                    <button className="connect-wallet-btn" onClick={connectWallet} disabled={wallet.loading}>
                        {wallet.loading ? '⏳ Connecting...' : '🔗 Connect Wallet'}
                    </button>
                )}
            </div>

            {currentGame === 'menu' ? (
                <div className="games-menu">
                    <div className="menu-header">
                        <h1>🎮 Game Center</h1>
                        <p>Connect wallet & hold 1M $KAWAI to play!</p>
                    </div>

                    {/* Rules Section */}
                    <div className="rules-section">
                        <h3>📜 Rules</h3>
                        <ul>
                            <li>🔗 Connect your Solana wallet</li>
                            <li>💰 Hold at least 1,000,000 $KAWAI tokens</li>
                            <li>🎮 Play games and compete for prizes</li>
                            <li>🏆 <strong>Winners get % of all CRS!</strong></li>
                        </ul>
                        <div className="token-info">
                            <span>Token: </span>
                            <code>{TOKEN_MINT.slice(0, 8)}...{TOKEN_MINT.slice(-4)}</code>
                            <a 
                                href={`https://pump.fun/coin/${TOKEN_MINT}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="buy-link"
                            >
                                Buy on pump.fun →
                            </a>
                        </div>
                    </div>

                    <div className="games-grid">
                        {games.map((game) => (
                            <div 
                                key={game.id}
                                className={`game-card ${!wallet.hasEnoughTokens ? 'locked' : ''}`}
                                onClick={() => handlePlayGame(game.id)}
                                style={{ borderColor: game.color }}
                            >
                                {!wallet.hasEnoughTokens && <div className="lock-overlay">🔒</div>}
                                <div className="game-icon">{game.name.split(' ')[0]}</div>
                                <h3>{game.name.split(' ').slice(1).join(' ')}</h3>
                                <p>{game.desc}</p>
                                <button 
                                    style={{ background: game.color }}
                                    disabled={!wallet.hasEnoughTokens}
                                >
                                    {wallet.hasEnoughTokens ? 'Play' : 'Locked'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="game-container">
                    <div className="game-header">
                        <button className="back-btn" onClick={() => setCurrentGame('menu')}>
                            ← Back to Menu
                        </button>
                    </div>
                    {currentGame === 'snake' && <SnakeGame />}
                    {currentGame === 'memory' && <MemoryGame />}
                    {currentGame === 'clicker' && <ClickerGame />}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        {modalType === 'connect' && (
                            <>
                                <h2>🔗 Connect Wallet</h2>
                                <p>You need to connect your Solana wallet to play games!</p>
                                <button className="modal-btn primary" onClick={() => { setShowModal(false); connectWallet(); }}>
                                    Connect Phantom
                                </button>
                                <a 
                                    href="https://phantom.app" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="get-wallet-link"
                                >
                                    Don't have a wallet? Get Phantom →
                                </a>
                            </>
                        )}
                        
                        {modalType === 'not-holding' && (
                            <>
                                <img src="/icons/not-holding.png" alt="Not Holding" className="modal-image" />
                                <h2>❌ Insufficient Tokens</h2>
                                <p>You need to hold at least <strong>1,000,000 $KAWAI</strong> tokens to play!</p>
                                <p className="current-balance">Your balance: {wallet.balance.toLocaleString()} $KAWAI</p>
                                <div className="buy-info">
                                    <p>Buy $KAWAI on pump.fun:</p>
                                    <a 
                                        href={`https://pump.fun/coin/${TOKEN_MINT}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="modal-btn buy"
                                    >
                                        🛒 Buy $KAWAI
                                    </a>
                                </div>
                            </>
                        )}
                        
                        {modalType === 'holding' && (
                            <>
                                <img src="/icons/holding.png" alt="Holding" className="modal-image" />
                                <h2>✅ Welcome, Holder!</h2>
                                <p>You're holding <strong>{wallet.balance.toLocaleString()} $KAWAI</strong></p>
                                <p className="access-granted">🎮 All games are now unlocked!</p>
                                <button className="modal-btn success" onClick={() => setShowModal(false)}>
                                    Let's Play! 🚀
                                </button>
                            </>
                        )}
                        
                        <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Snake Game
const SnakeGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    const gridSize = 20;
    const canvasSize = 400;

    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let snake = [{ x: 10, y: 10 }];
        let direction = { x: 1, y: 0 };
        let food = { x: 15, y: 15 };
        let currentScore = 0;

        const generateFood = () => {
            food = {
                x: Math.floor(Math.random() * (canvasSize / gridSize)),
                y: Math.floor(Math.random() * (canvasSize / gridSize)),
            };
        };

        const handleKeydown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp': if (direction.y !== 1) direction = { x: 0, y: -1 }; break;
                case 'ArrowDown': if (direction.y !== -1) direction = { x: 0, y: 1 }; break;
                case 'ArrowLeft': if (direction.x !== 1) direction = { x: -1, y: 0 }; break;
                case 'ArrowRight': if (direction.x !== -1) direction = { x: 1, y: 0 }; break;
            }
        };

        window.addEventListener('keydown', handleKeydown);

        const gameLoop = setInterval(() => {
            const head = {
                x: snake[0].x + direction.x,
                y: snake[0].y + direction.y,
            };

            if (head.x < 0 || head.x >= canvasSize / gridSize ||
                head.y < 0 || head.y >= canvasSize / gridSize) {
                setGameOver(true);
                return;
            }

            if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
                setGameOver(true);
                return;
            }

            snake.unshift(head);

            if (head.x === food.x && head.y === food.y) {
                currentScore += 10;
                setScore(currentScore);
                generateFood();
            } else {
                snake.pop();
            }

            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, canvasSize, canvasSize);

            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

            snake.forEach((seg, i) => {
                ctx.fillStyle = i === 0 ? '#4CAF50' : '#81C784';
                ctx.fillRect(seg.x * gridSize, seg.y * gridSize, gridSize - 2, gridSize - 2);
            });
        }, 100);

        return () => {
            clearInterval(gameLoop);
            window.removeEventListener('keydown', handleKeydown);
        };
    }, [gameStarted, gameOver]);

    const startGame = () => {
        setScore(0);
        setGameOver(false);
        setGameStarted(true);
    };

    return (
        <div className="snake-game">
            <div className="game-info">
                <span>Score: {score}</span>
            </div>
            <div className="canvas-container">
                <canvas ref={canvasRef} width={canvasSize} height={canvasSize} />
                {!gameStarted && !gameOver && (
                    <div className="game-overlay">
                        <h2>🐍 Snake</h2>
                        <p>Use arrow keys to move</p>
                        <button onClick={startGame}>Start Game</button>
                    </div>
                )}
                {gameOver && (
                    <div className="game-overlay">
                        <h2>Game Over!</h2>
                        <p>Final Score: {score}</p>
                        <button onClick={startGame}>Play Again</button>
                    </div>
                )}
            </div>
            <div className="mobile-controls">
                <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))}>↑</button>
                <div className="controls-row">
                    <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))}>←</button>
                    <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))}>↓</button>
                    <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))}>→</button>
                </div>
            </div>
        </div>
    );
};

// Memory Game
const MemoryGame: React.FC = () => {
    const emojis = ['🌸', '🎮', '💖', '⭐', '🌙', '🎵', '🦋', '🍰'];
    const [cards, setCards] = useState<string[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matched, setMatched] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);

    const initGame = useCallback(() => {
        const shuffled = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setFlipped([]);
        setMatched([]);
        setMoves(0);
    }, []);

    useEffect(() => {
        initGame();
    }, [initGame]);

    useEffect(() => {
        if (flipped.length === 2) {
            const [first, second] = flipped;
            if (cards[first] === cards[second]) {
                setMatched(prev => [...prev, first, second]);
            }
            setTimeout(() => setFlipped([]), 800);
        }
    }, [flipped, cards]);

    const handleCardClick = (index: number) => {
        if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;
        setFlipped(prev => [...prev, index]);
        if (flipped.length === 1) setMoves(prev => prev + 1);
    };

    const isWon = matched.length === cards.length;

    return (
        <div className="memory-game">
            <div className="game-info">
                <span>Moves: {moves}</span>
                <span>Matched: {matched.length / 2}/{emojis.length}</span>
            </div>
            <div className="memory-grid">
                {cards.map((emoji, index) => (
                    <div
                        key={index}
                        className={`memory-card ${flipped.includes(index) || matched.includes(index) ? 'flipped' : ''}`}
                        onClick={() => handleCardClick(index)}
                    >
                        <div className="card-inner">
                            <div className="card-front">?</div>
                            <div className="card-back">{emoji}</div>
                        </div>
                    </div>
                ))}
            </div>
            {isWon && (
                <div className="win-message">
                    <h2>🎉 You Win!</h2>
                    <p>Completed in {moves} moves</p>
                    <button onClick={initGame}>Play Again</button>
                </div>
            )}
        </div>
    );
};

// Clicker Game
const ClickerGame: React.FC = () => {
    const [cookies, setCookies] = useState(0);
    const [cps, setCps] = useState(0);
    const [upgrades, setUpgrades] = useState([
        { id: 1, name: '🖱️ Auto Clicker', cost: 10, cps: 1, owned: 0 },
        { id: 2, name: '👵 Grandma', cost: 100, cps: 5, owned: 0 },
        { id: 3, name: '🏭 Factory', cost: 500, cps: 20, owned: 0 },
        { id: 4, name: '🚀 Rocket', cost: 2000, cps: 100, owned: 0 },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCookies(prev => prev + cps);
        }, 1000);
        return () => clearInterval(interval);
    }, [cps]);

    const handleClick = () => {
        setCookies(prev => prev + 1);
    };

    const buyUpgrade = (id: number) => {
        const upgrade = upgrades.find(u => u.id === id);
        if (!upgrade || cookies < upgrade.cost) return;

        setCookies(prev => prev - upgrade.cost);
        setCps(prev => prev + upgrade.cps);
        setUpgrades(prev => prev.map(u =>
            u.id === id
                ? { ...u, owned: u.owned + 1, cost: Math.floor(u.cost * 1.5) }
                : u
        ));
    };

    return (
        <div className="clicker-game">
            <div className="clicker-main">
                <div className="cookie-display">
                    <h1>{Math.floor(cookies)} 🍪</h1>
                    <p>{cps} cookies per second</p>
                </div>
                <button className="big-cookie" onClick={handleClick}>
                    🍪
                </button>
            </div>
            <div className="clicker-shop">
                <h3>🛒 Shop</h3>
                {upgrades.map(upgrade => (
                    <button
                        key={upgrade.id}
                        className={`shop-item ${cookies >= upgrade.cost ? 'available' : 'locked'}`}
                        onClick={() => buyUpgrade(upgrade.id)}
                        disabled={cookies < upgrade.cost}
                    >
                        <span className="item-icon">{upgrade.name}</span>
                        <span className="item-info">
                            <span className="item-cost">{upgrade.cost} 🍪</span>
                            <span className="item-owned">Owned: {upgrade.owned}</span>
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GamesApp;

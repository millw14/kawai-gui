import React, { useState, useEffect } from 'react';
import { VscRefresh } from 'react-icons/vsc';
import { FaGamepad, FaQuestion, FaDragon, FaBrain } from 'react-icons/fa';
import './GamesApp.css';

// --- Types ---
type GameType = 'menu' | 'quiz' | 'snake' | 'memory';

interface MemoryCard {
    id: number;
    emoji: string;
    isFlipped: boolean;
    isMatched: boolean;
}

// --- GamesApp Component ---
const GamesApp: React.FC = () => {
    const [activeGame, setActiveGame] = useState<GameType>('menu');

    return (
        <div className="games-app">
            {activeGame === 'menu' && <GameMenu onSelect={setActiveGame} />}
            {activeGame === 'quiz' && <QuizGame onBack={() => setActiveGame('menu')} />}
            {activeGame === 'snake' && <SnakeGame onBack={() => setActiveGame('menu')} />}
            {activeGame === 'memory' && <MemoryGame onBack={() => setActiveGame('menu')} />}
        </div>
    );
};

// --- Menu Component ---
const GameMenu: React.FC<{ onSelect: (game: GameType) => void }> = ({ onSelect }) => {
    return (
        <div className="game-menu">
            <div className="menu-header">
                <FaGamepad className="header-icon" />
                <h1>Game Center</h1>
                <p>Powered by Kawai Plugin</p>
            </div>

            <div className="game-grid">
                <div className="game-card quiz" onClick={() => onSelect('quiz')}>
                    <div className="card-icon"><FaQuestion /></div>
                    <div className="card-content">
                        <h3>Kawai Quiz</h3>
                        <p>Test your knowledge!</p>
                    </div>
                </div>
                <div className="game-card snake" onClick={() => onSelect('snake')}>
                    <div className="card-icon"><FaDragon /></div>
                    <div className="card-content">
                        <h3>Solana Snake</h3>
                        <p>Eat blocks, grow long!</p>
                    </div>
                </div>
                <div className="game-card memory" onClick={() => onSelect('memory')}>
                    <div className="card-icon"><FaBrain /></div>
                    <div className="card-content">
                        <h3>Memory Match</h3>
                        <p>Train your brain!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Quiz Game (Simpler Version) ---
const QuizGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const questions = [
        { q: "What is Kawai designed for?", options: ["Windows", "Mac", "Linux"], a: 0 },
        { q: "Which chain does Kawai support?", options: ["Eth", "Solana", "Btc"], a: 1 },
        { q: "Does Kawai use WSL?", options: ["Yes", "No", "Maybe"], a: 1 },
        { q: "What is the mascot?", options: ["Dog", "Cat", "Kawai-chan"], a: 2 },
    ];
    const [cursor, setCursor] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);

    const handleAnswer = (idx: number) => {
        if (idx === questions[cursor].a) setScore(s => s + 10);
        if (cursor + 1 < questions.length) setCursor(c => c + 1);
        else setFinished(true);
    };

    return (
        <div className="game-container quiz-theme">
            <button className="back-btn" onClick={onBack}>← Back</button>
            {!finished ? (
                <div className="quiz-content">
                    <h2>Question {cursor + 1}/{questions.length}</h2>
                    <p className="question-text">{questions[cursor].q}</p>
                    <div className="options-list">
                        {questions[cursor].options.map((opt, i) => (
                            <button key={i} onClick={() => handleAnswer(i)}>{opt}</button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="result-content">
                    <h2>Game Over!</h2>
                    <p>Score: {score}</p>
                    <button onClick={() => { setCursor(0); setScore(0); setFinished(false); }}>Play Again</button>
                </div>
            )}
        </div>
    );
};

// --- Snake Game ---
const GRID_SIZE = 20;
const CELL_SIZE = 20;

const SnakeGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState({ x: 15, y: 15 });
    const [dir, setDir] = useState({ x: 1, y: 0 });
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' && dir.y === 0) setDir({ x: 0, y: -1 });
            if (e.key === 'ArrowDown' && dir.y === 0) setDir({ x: 0, y: 1 });
            if (e.key === 'ArrowLeft' && dir.x === 0) setDir({ x: -1, y: 0 });
            if (e.key === 'ArrowRight' && dir.x === 0) setDir({ x: 1, y: 0 });
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [dir]);

    useEffect(() => {
        if (gameOver) return;
        const move = setInterval(() => {
            setSnake(prev => {
                const newHead = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };
                if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
                    setGameOver(true);
                    return prev;
                }
                if (prev.some(s => s.x === newHead.x && s.y === newHead.y)) {
                    setGameOver(true);
                    return prev;
                }

                const newSnake = [newHead, ...prev];
                if (newHead.x === food.x && newHead.y === food.y) {
                    setScore(s => s + 1);
                    setFood({
                        x: Math.floor(Math.random() * GRID_SIZE),
                        y: Math.floor(Math.random() * GRID_SIZE)
                    });
                } else {
                    newSnake.pop();
                }
                return newSnake;
            });
        }, 150);
        return () => clearInterval(move);
    }, [dir, food, gameOver]);

    return (
        <div className="game-container snake-theme">
            <div className="snake-header">
                <button className="back-btn" onClick={onBack}>← Back</button>
                <span>Score: {score}</span>
            </div>
            {gameOver ? (
                <div className="game-over">
                    <h2>Game Over!</h2>
                    <button onClick={() => {
                        setSnake([{ x: 10, y: 10 }]);
                        setGameOver(false);
                        setScore(0);
                        setDir({ x: 1, y: 0 });
                    }}>Retry</button>
                </div>
            ) : (
                <div className="snake-board" style={{
                    width: GRID_SIZE * CELL_SIZE,
                    height: GRID_SIZE * CELL_SIZE,
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`
                }}>
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = i % GRID_SIZE;
                        const y = Math.floor(i / GRID_SIZE);
                        const isSnake = snake.some(s => s.x === x && s.y === y);
                        const isFood = food.x === x && food.y === y;
                        return (
                            <div key={i} className={`cell ${isSnake ? 'snake' : ''} ${isFood ? 'food' : ''}`} />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// --- Memory Game ---
const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
const MemoryGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [cards, setCards] = useState<MemoryCard[]>([]);
    const [turns, setTurns] = useState(0);
    const [choiceOne, setChoiceOne] = useState<MemoryCard | null>(null);
    const [choiceTwo, setChoiceTwo] = useState<MemoryCard | null>(null);
    const [disabled, setDisabled] = useState(false);

    const shuffleCards = () => {
        const shuffled = [...EMOJIS, ...EMOJIS]
            .sort(() => Math.random() - 0.5)
            .map((emoji, idx) => ({ id: idx, emoji, isFlipped: false, isMatched: false }));
        setChoiceOne(null);
        setChoiceTwo(null);
        setCards(shuffled);
        setTurns(0);
    };

    const handleChoice = (card: MemoryCard) => {
        choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
    };

    useEffect(() => {
        shuffleCards();
    }, []);

    useEffect(() => {
        if (choiceOne && choiceTwo) {
            setDisabled(true);
            if (choiceOne.emoji === choiceTwo.emoji) {
                setCards(prev => prev.map(c =>
                    c.emoji === choiceOne.emoji ? { ...c, isMatched: true } : c
                ));
                resetTurn();
            } else {
                setTimeout(() => resetTurn(), 1000);
            }
        }
    }, [choiceOne, choiceTwo]);

    const resetTurn = () => {
        setChoiceOne(null);
        setChoiceTwo(null);
        setTurns(prev => prev + 1);
        setDisabled(false);
    };

    return (
        <div className="game-container memory-theme">
            <div className="memory-header">
                <button className="back-btn" onClick={onBack}>← Back</button>
                <button onClick={shuffleCards}><VscRefresh /> New Game</button>
                <span>Turns: {turns}</span>
            </div>
            <div className="memory-grid">
                {cards.map(card => (
                    <div
                        key={card.id}
                        className={`memory-card ${card.isFlipped || card === choiceOne || card === choiceTwo || card.isMatched ? 'flipped' : ''}`}
                        onClick={() => !disabled && !card.isMatched && card !== choiceOne && handleChoice(card)}
                    >
                        <div className="front">{card.emoji}</div>
                        <div className="back">❓</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GamesApp;

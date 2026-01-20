import React, { useState } from 'react';
import { VscBook, VscTerminal, VscPlayCircle, VscGithubInverted, VscHeart } from 'react-icons/vsc';
import './HelpApp.css';

type Section = 'welcome' | 'terminal' | 'games' | 'about';

const HelpApp: React.FC = () => {
    const [activeSection, setActiveSection] = useState<Section>('welcome');

    return (
        <div className="help-app">
            <div className="help-header">
                <VscBook size={24} color="#007acc" />
                <h1>Kawai Documentation</h1>
            </div>
            <div className="help-body">
                <div className="help-sidebar">
                    <div
                        className={`help-nav-item ${activeSection === 'welcome' ? 'active' : ''}`}
                        onClick={() => setActiveSection('welcome')}
                    >
                        <VscHeart /> Welcome
                    </div>
                    <div
                        className={`help-nav-item ${activeSection === 'terminal' ? 'active' : ''}`}
                        onClick={() => setActiveSection('terminal')}
                    >
                        <VscTerminal /> Terminal & CLI
                    </div>
                    <div
                        className={`help-nav-item ${activeSection === 'games' ? 'active' : ''}`}
                        onClick={() => setActiveSection('games')}
                    >
                        <VscPlayCircle /> Games
                    </div>
                    <div
                        className={`help-nav-item ${activeSection === 'about' ? 'active' : ''}`}
                        onClick={() => setActiveSection('about')}
                    >
                        <VscGithubInverted /> About Kawai
                    </div>
                </div>

                <div className="help-content">
                    {activeSection === 'welcome' && <WelcomeSection />}
                    {activeSection === 'terminal' && <TerminalSection />}
                    {activeSection === 'games' && <GamesSection />}
                    {activeSection === 'about' && <AboutSection />}
                </div>
            </div>
        </div>
    );
};

const WelcomeSection = () => (
    <div className="animate-fade-in">
        <h2>Welcome to Kawai 🌸</h2>
        <p>The **Kawai Plugin** brings the power of Solana development directly to your Windows desktop with zero compromise.</p>

        <div className="tip-box">
            <strong>🚀 Powered by Kawai Plugin</strong>
            <p>This entire environment, including the VS Code simulator and Solana tools, is powered by the Kawai Plugin system.</p>
        </div>

        <h3>Key Features</h3>
        <ul>
            <li><strong>Native Windows Support:</strong> No WSL, no Docker needed for basic tasks.</li>
            <li><strong>Integrated Terminal:</strong> Real-time Solana network stats and vanity grinding.</li>
            <li><strong>Game Center:</strong> Relax while your node syncs.</li>
        </ul>
    </div>
);

const TerminalSection = () => (
    <div className="animate-fade-in">
        <h2>Terminal & CLI</h2>
        <p>The integrated terminal provides powerful commands for Solana traders and developers.</p>

        <h3>Available Commands</h3>
        <ul>
            <li><code>solana price</code> - Helper to fetch live SOL/USD price from Jupiter API.</li>
            <li><code>solana tps</code> - Connects to Mainnet RPC to visualize current network performance.</li>
            <li><code>solana grind [prefix]</code> - CPU-based vanity address generator. Finds real keypairs!</li>
            <li><code>solana meme</code> - Brainstorming tool for your next big token launch.</li>
        </ul>

        <div className="tip-box">
            <strong>💡 Pro Tip</strong>
            <p>You can access the terminal from inside the VS Code app by toggling the panel button in the status bar.</p>
        </div>
    </div>
);

const GamesSection = () => (
    <div className="animate-fade-in">
        <h2>Kawai Game Center</h2>
        <p>Need a break from coding? The Game Center offers classic arcade fun.</p>

        <h3>Included Games</h3>
        <ul>
            <li><strong>Kawai Quiz:</strong> Test your knowledge about the ecosystem.</li>
            <li><strong>Solana Snake:</strong> Classic snake game. Don't hit the walls!</li>
            <li><strong>Memory Match:</strong> Train your short-term memory with cute emojis.</li>
        </ul>
    </div>
);

const AboutSection = () => (
    <div className="animate-fade-in">
        <h2>About Kawai Project</h2>
        <p>Kawai is an ambitious project to make Solana development on Windows first-class.</p>
        <p>We believe you shouldn't need a dual-boot system or complex virtual machines to build the future of finance.</p>

        <h3>Version</h3>
        <p>Kawai GUI v0.1.0 (Beta)</p>
        <p>Powered by Tauri + React + Vite</p>
    </div>
);

export default HelpApp;

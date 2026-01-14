import React, { useState } from 'react';
import './BrowserApp.css';

const BrowserApp: React.FC = () => {
    const [url, setUrl] = useState('https://milla.dev');
    const [currentPage, setCurrentPage] = useState('home');

    const bookmarks = [
        { name: 'Home', page: 'home', icon: '/icons/chrome.png' },
        { name: 'GitHub', page: 'github', icon: '/icons/github.png' },
        { name: 'Portfolio', page: 'portfolio', icon: '/icons/milla.png' },
        { name: 'Games', page: 'games', icon: '/icons/appliance.png' },
    ];

    const openExternalLink = (url: string) => {
        window.open(url, '_blank');
    };

    const pages: { [key: string]: React.ReactNode } = {
        home: (
            <div className="browser-page home-page">
                <div className="home-hero">
                    <img src="/icons/milla.png" alt="Milla" className="hero-avatar" />
                    <h1>Welcome to Milla's Web</h1>
                    <p>Your cozy corner of the internet ✨</p>
                    <div className="search-box">
                        <img src="/icons/chrome.png" alt="" className="search-icon" />
                        <input type="text" placeholder="Search the web..." />
                    </div>
                </div>
                <div className="quick-links">
                    <div className="quick-link" onClick={() => setCurrentPage('github')}>
                        <img src="/icons/github.png" alt="GitHub" className="link-icon" />
                        <span>GitHub</span>
                    </div>
                    <div className="quick-link" onClick={() => setCurrentPage('portfolio')}>
                        <img src="/icons/milla.png" alt="Portfolio" className="link-icon" />
                        <span>Portfolio</span>
                    </div>
                    <div className="quick-link" onClick={() => setCurrentPage('games')}>
                        <img src="/icons/appliance.png" alt="Games" className="link-icon" />
                        <span>Games</span>
                    </div>
                    <div className="quick-link" onClick={() => openExternalLink('https://youtube.com')}>
                        <img src="/icons/youtube.png" alt="YouTube" className="link-icon" />
                        <span>YouTube</span>
                    </div>
                    <div className="quick-link" onClick={() => openExternalLink('https://x.com/witchmillaa')}>
                        <img src="/icons/twitter.png" alt="Twitter" className="link-icon" />
                        <span>Twitter</span>
                    </div>
                    <div className="quick-link" onClick={() => openExternalLink('https://discord.gg')}>
                        <img src="/icons/discord.png" alt="Discord" className="link-icon" />
                        <span>Discord</span>
                    </div>
                </div>
            </div>
        ),
        github: (
            <div className="browser-page github-page">
                <div className="gh-header">
                    <div className="gh-logo">
                        <img src="/icons/github.png" alt="GitHub" />
                        <span>GitHub</span>
                    </div>
                    <div className="gh-nav">
                        <span>Pull requests</span>
                        <span>Issues</span>
                        <span>Marketplace</span>
                        <span>Explore</span>
                    </div>
                </div>
                <div className="gh-content">
                    <div className="gh-profile">
                        <img src="/icons/milla.png" alt="Milla" className="gh-avatar" />
                        <h2>millw14</h2>
                        <p>@milla</p>
                        <div className="gh-stats">
                            <span>👥 124 followers</span>
                            <span>⭐ 89 stars</span>
                        </div>
                        <div className="gh-socials">
                            <a href="https://x.com/witchmillaa" target="_blank" rel="noopener noreferrer">
                                <img src="/icons/twitter.png" alt="Twitter" />
                            </a>
                            <a href="https://discord.gg" target="_blank" rel="noopener noreferrer">
                                <img src="/icons/discord.png" alt="Discord" />
                            </a>
                        </div>
                    </div>
                    <div className="gh-repos">
                        <h3>Popular repositories</h3>
                        <div className="repo-list">
                            <div className="repo-card" onClick={() => setCurrentPage('kawai-repo')}>
                                <div className="repo-name">📦 kawai</div>
                                <p>Solana development toolkit with cute anime guide</p>
                                <div className="repo-meta">
                                    <span>⭐ 42</span>
                                    <span>🔀 12</span>
                                    <span className="lang rust">Rust</span>
                                </div>
                            </div>
                            <div className="repo-card">
                                <div className="repo-name">📦 milla-pc</div>
                                <p>Virtual desktop simulation</p>
                                <div className="repo-meta">
                                    <span>⭐ 28</span>
                                    <span>🔀 5</span>
                                    <span className="lang ts">TypeScript</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),
        'kawai-repo': (
            <div className="browser-page repo-page">
                <div className="gh-header">
                    <div className="gh-logo">
                        <img src="/icons/github.png" alt="GitHub" />
                        <span>GitHub</span>
                    </div>
                    <div className="gh-nav">
                        <span onClick={() => setCurrentPage('github')}>← Back</span>
                    </div>
                </div>
                <div className="repo-content">
                    <div className="repo-header">
                        <img src="/icons/milla.png" alt="" className="repo-owner-avatar" />
                        <span className="repo-path">millw14 / <strong>kawai</strong></span>
                        <span className="repo-badge">Public</span>
                    </div>
                    <div className="repo-tabs">
                        <span className="active">📄 Code</span>
                        <span>🔔 Issues</span>
                        <span>🔀 Pull requests</span>
                        <span>📊 Actions</span>
                    </div>
                    <div className="repo-files">
                        <div className="file-header">
                            <span>📁 kawai</span>
                            <span className="commit-msg">for the community</span>
                        </div>
                        <div className="file-tree">
                            <div className="folder">📁 apps/</div>
                            <div className="folder indent">📁 cli/</div>
                            <div className="folder indent">📁 desktop/</div>
                            <div className="folder">📁 crates/</div>
                            <div className="folder indent">📁 kawai-sdk/</div>
                            <div className="folder indent">📁 kawai-wallet/</div>
                            <div className="folder indent">📁 kawai-rpc/</div>
                            <div className="folder indent">📁 kawai-validator/</div>
                            <div className="folder indent">📁 kawai-build/</div>
                            <div className="folder indent">📁 kawai-anchor/</div>
                            <div className="folder">📁 assets/</div>
                            <div className="folder">📁 config/examples/</div>
                            <div className="folder">📁 docs/</div>
                            <div className="folder indent">📁 archive/</div>
                            <div className="folder indent">📁 setup/</div>
                            <div className="folder">📁 scripts/</div>
                            <div className="folder indent">📁 solana/</div>
                            <div className="folder indent">📁 debug/</div>
                            <div className="folder">📁 packages/</div>
                            <div className="folder">📁 src/</div>
                            <div className="file">📄 Cargo.toml</div>
                            <div className="file">📄 README.md</div>
                        </div>
                    </div>
                    <div className="readme-section">
                        <div className="readme-header">📖 README.md</div>
                        <div className="readme-content">
                            <h1>🌸 Kawai - Solana Development Suite</h1>
                            <p className="readme-badge">
                                <span className="badge">✨ Made with love</span>
                                <span className="badge">🦀 Rust</span>
                                <span className="badge">⚡ Solana</span>
                            </p>
                            <blockquote>
                                A cute and powerful toolkit for Solana developers on Windows
                            </blockquote>
                            
                            <h2>✨ Features</h2>
                            <ul>
                                <li>🔑 <strong>Wallet Management</strong> - Create, import, and manage Solana wallets</li>
                                <li>⚙️ <strong>Local Validator</strong> - Run a local Solana test validator</li>
                                <li>🔨 <strong>Program Compilation</strong> - Build Solana programs with ease</li>
                                <li>🚀 <strong>Deployment</strong> - Deploy to devnet, testnet, or mainnet</li>
                                <li>⚓ <strong>Anchor Support</strong> - Full Anchor framework integration</li>
                            </ul>

                            <h2>📦 Project Structure</h2>
                            <pre className="code-block">{`kawai/
├── apps/
│   ├── cli/                    # Command-line tool
│   └── desktop/                # GUI (coming soon)
├── crates/
│   ├── kawai-sdk/              # Core SDK
│   ├── kawai-wallet/           # Wallet management
│   ├── kawai-rpc/              # RPC client
│   ├── kawai-validator/        # Local validator
│   ├── kawai-build/            # Program compilation
│   └── kawai-anchor/           # Anchor integration
├── assets/                     # Images and misc files
├── config/examples/            # Example configurations
├── docs/
│   ├── archive/                # Old documentation
│   └── setup/                  # Setup guides
├── scripts/
│   ├── solana/                 # Solana installation scripts
│   └── debug/                  # Debug utilities
├── packages/                   # JS SDK (coming soon)
└── src/                        # Original monitor`}</pre>

                            <h2>🚀 Quick Start</h2>
                            <pre className="code-block">{`# Install kawai
cargo install kawai

# Create a new wallet
kawai wallet new

# Start local validator
kawai validator start

# Build your program
kawai build

# Deploy to devnet
kawai deploy --network devnet`}</pre>

                            <h2>💖 Support</h2>
                            <p>
                                Follow me on <a href="https://x.com/witchmillaa">Twitter @witchmillaa</a> for updates!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        ),
        portfolio: (
            <div className="browser-page portfolio-page">
                <nav className="portfolio-nav">
                    <div className="nav-brand">
                        <img src="/icons/milla.png" alt="Milla" className="brand-avatar" />
                        <span>Milla.dev</span>
                    </div>
                    <div className="nav-links">
                        <span>Work</span>
                        <span>About</span>
                        <span>Contact</span>
                    </div>
                </nav>
                <div className="portfolio-hero">
                    <img src="/icons/milla.png" alt="Milla" className="portfolio-avatar" />
                    <h1>Hey, I'm Milla 👋</h1>
                    <p>Full-stack developer & creative coder</p>
                    <p className="subtitle">Building beautiful things on the web and blockchain</p>
                    <div className="social-links">
                        <a href="https://x.com/witchmillaa" target="_blank" rel="noopener noreferrer">
                            <img src="/icons/twitter.png" alt="Twitter" />
                        </a>
                        <a href="https://github.com/millw14" target="_blank" rel="noopener noreferrer">
                            <img src="/icons/github.png" alt="GitHub" />
                        </a>
                        <a href="https://discord.gg" target="_blank" rel="noopener noreferrer">
                            <img src="/icons/discord.png" alt="Discord" />
                        </a>
                    </div>
                </div>
                <div className="portfolio-projects">
                    <h2>Featured Projects</h2>
                    <div className="project-grid">
                        <div className="project-card">
                            <img src="/icons/appliance.png" alt="" className="project-preview" />
                            <h3>Game Engine</h3>
                            <p>Custom 2D engine in Rust</p>
                        </div>
                        <div className="project-card">
                            <img src="/icons/vscode.png" alt="" className="project-preview" />
                            <h3>Kawai SDK</h3>
                            <p>Solana dev toolkit</p>
                        </div>
                        <div className="project-card">
                            <img src="/icons/chrome.png" alt="" className="project-preview" />
                            <h3>PC Simulator</h3>
                            <p>Virtual desktop experience</p>
                        </div>
                    </div>
                </div>
            </div>
        ),
        games: (
            <div className="browser-page games-page">
                <div className="games-header">
                    <img src="/icons/appliance.png" alt="" className="games-icon" />
                    <h1>Web Games Hub</h1>
                </div>
                <p>Play some fun browser games!</p>
                <div className="game-list">
                    <div className="game-card">
                        <div className="game-thumb">🐍</div>
                        <div className="game-info">
                            <h3>Snake</h3>
                            <p>Classic snake game</p>
                            <button>Play Now</button>
                        </div>
                    </div>
                    <div className="game-card">
                        <div className="game-thumb">🧱</div>
                        <div className="game-info">
                            <h3>Tetris</h3>
                            <p>Block puzzle game</p>
                            <button>Play Now</button>
                        </div>
                    </div>
                    <div className="game-card">
                        <div className="game-thumb">🎯</div>
                        <div className="game-info">
                            <h3>Memory</h3>
                            <p>Card matching game</p>
                            <button>Play Now</button>
                        </div>
                    </div>
                </div>
            </div>
        ),
    };

    return (
        <div className="browser-app">
            {/* Toolbar */}
            <div className="browser-toolbar">
                <div className="nav-buttons">
                    <button className="nav-btn">←</button>
                    <button className="nav-btn">→</button>
                    <button className="nav-btn">↻</button>
                </div>
                <div className="url-bar">
                    <span className="url-icon">🔒</span>
                    <input 
                        type="text" 
                        value={`https://milla.dev/${currentPage === 'home' ? '' : currentPage}`}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <span className="url-icon">⭐</span>
                </div>
                <div className="toolbar-buttons">
                    <button className="toolbar-btn">⋯</button>
                </div>
            </div>

            {/* Bookmarks */}
            <div className="bookmarks-bar">
                {bookmarks.map((bm, i) => (
                    <button 
                        key={i} 
                        className={`bookmark ${currentPage === bm.page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(bm.page)}
                    >
                        <img src={bm.icon} alt="" className="bookmark-icon" />
                        <span>{bm.name}</span>
                    </button>
                ))}
            </div>

            {/* Page Content */}
            <div className="browser-content">
                {pages[currentPage]}
            </div>
        </div>
    );
};

export default BrowserApp;

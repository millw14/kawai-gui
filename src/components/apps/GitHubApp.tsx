import React, { useState } from 'react';
import './GitHubApp.css';

const GitHubApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState('changes');

    const repos = [
        { name: 'kawai', branch: 'main', changes: 3 },
        { name: 'milla-pc', branch: 'develop', changes: 0 },
        { name: 'solana-tools', branch: 'main', changes: 1 },
    ];

    const [currentRepo, setCurrentRepo] = useState(repos[0]);

    const changes = [
        { file: 'src/App.tsx', status: 'modified', lines: '+12 -5' },
        { file: 'src/components/Desktop.tsx', status: 'modified', lines: '+45 -20' },
        { file: 'src/components/GuideCharacter.tsx', status: 'added', lines: '+120' },
    ];

    const history = [
        { message: 'feat: add guide character component', author: 'milla', time: '2 hours ago', hash: 'a3b4c5d' },
        { message: 'fix: window dragging on mobile', author: 'milla', time: '5 hours ago', hash: 'e6f7g8h' },
        { message: 'style: update loading screen animation', author: 'milla', time: 'yesterday', hash: 'i9j0k1l' },
        { message: 'feat: implement taskbar', author: 'milla', time: '2 days ago', hash: 'm2n3o4p' },
        { message: 'init: project setup', author: 'milla', time: '1 week ago', hash: 'q5r6s7t' },
    ];

    return (
        <div className="github-app">
            {/* Sidebar */}
            <div className="gh-sidebar">
                <div className="repo-selector">
                    <div className="current-repo">
                        <span className="repo-icon">📦</span>
                        <div className="repo-details">
                            <span className="repo-name">{currentRepo.name}</span>
                            <span className="repo-branch">🔀 {currentRepo.branch}</span>
                        </div>
                        <span className="dropdown-arrow">▼</span>
                    </div>
                </div>

                <div className="repo-list-dropdown">
                    {repos.map((repo, i) => (
                        <div 
                            key={i} 
                            className={`repo-item ${repo.name === currentRepo.name ? 'active' : ''}`}
                            onClick={() => setCurrentRepo(repo)}
                        >
                            <span>📦 {repo.name}</span>
                            {repo.changes > 0 && <span className="change-badge">{repo.changes}</span>}
                        </div>
                    ))}
                </div>

                <div className="sidebar-nav">
                    <button 
                        className={`nav-item ${activeTab === 'changes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('changes')}
                    >
                        <span>📝</span> Changes
                        {currentRepo.changes > 0 && <span className="nav-badge">{currentRepo.changes}</span>}
                    </button>
                    <button 
                        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <span>📜</span> History
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="gh-main">
                {activeTab === 'changes' ? (
                    <div className="changes-view">
                        <div className="view-header">
                            <h2>Changes</h2>
                            <div className="header-actions">
                                <button className="action-btn secondary">Discard All</button>
                                <button className="action-btn primary">Commit to {currentRepo.branch}</button>
                            </div>
                        </div>

                        <div className="commit-form">
                            <input 
                                type="text" 
                                placeholder="Summary (required)"
                                className="commit-summary"
                            />
                            <textarea 
                                placeholder="Description"
                                className="commit-description"
                            />
                        </div>

                        <div className="file-changes">
                            <div className="section-header">
                                <span>{changes.length} changed files</span>
                            </div>
                            {changes.map((change, i) => (
                                <div key={i} className="change-item">
                                    <input type="checkbox" defaultChecked />
                                    <span className={`status-icon ${change.status}`}>
                                        {change.status === 'modified' ? '✏️' : '➕'}
                                    </span>
                                    <span className="file-path">{change.file}</span>
                                    <span className="line-changes">{change.lines}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="history-view">
                        <div className="view-header">
                            <h2>History</h2>
                            <div className="branch-indicator">
                                <span>🔀 {currentRepo.branch}</span>
                            </div>
                        </div>

                        <div className="commit-list">
                            {history.map((commit, i) => (
                                <div key={i} className="commit-item">
                                    <div className="commit-dot"></div>
                                    <div className="commit-content">
                                        <div className="commit-message">{commit.message}</div>
                                        <div className="commit-meta">
                                            <span className="commit-author">👤 {commit.author}</span>
                                            <span className="commit-time">🕐 {commit.time}</span>
                                            <span className="commit-hash">#{commit.hash}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div className="gh-statusbar">
                <div className="status-left">
                    <span className="status-item">✓ No conflicts</span>
                    <span className="status-item">↑ 0 ↓ 0</span>
                </div>
                <div className="status-right">
                    <span className="status-item">Last fetch: just now</span>
                </div>
            </div>
        </div>
    );
};

export default GitHubApp;

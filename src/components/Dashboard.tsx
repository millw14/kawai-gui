import React from 'react';

const Dashboard: React.FC = () => {
    return (
        <div className="dashboard-container" style={{ padding: '40px', maxWidth: '600px', zIndex: 10, position: 'relative' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#ff8fa3', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>Kawai</h1>
                <p style={{ fontSize: '1.2rem', color: '#5d5d5d', opacity: 0.8 }}>Solana Development Suite</p>
            </header>

            <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>My Wallet</h2>
                        <p style={{ fontFamily: 'monospace', opacity: 0.6 }}>6ggx...pump</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ fontSize: '1.5rem', color: '#ff8fa3' }}>2.0 SOL</h2>
                        <p style={{ fontSize: '0.9rem', opacity: 0.6 }}>Devnet</p>
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.3)' }} />

                <div className="actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    <button className="kawai-button">🔑 Wallet</button>
                    <button className="kawai-button">⚙️ Validator</button>
                    <button className="kawai-button">🔨 Build</button>
                    <button className="kawai-button">🚢 Deploy</button>
                </div>

                <div className="status" style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                        <span>Network Status</span>
                        <span style={{ color: '#4caf50', fontWeight: 'bold' }}>● Online</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, #ffb6c1, #ff8fa3)' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

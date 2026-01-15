import { useState } from 'react';
import './WalletAnalyzerApp.css';

const HELIUS_API_KEY = '22039ce1-fa6d-44d0-9995-3ac0b4f039e9';
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

interface WalletConnection {
    address: string;
    type: 'direct' | 'indirect' | 'common-counterparty';
    transactions: number;
    totalAmount: number;
    firstSeen: string;
    lastSeen: string;
    confidence: number;
}

interface Transaction {
    signature: string;
    timestamp: number;
    type: string;
    from: string;
    to: string;
    amount: number;
    token?: string;
}

interface AnalysisResult {
    sourceWallet: string;
    connectedWallets: WalletConnection[];
    transactions: Transaction[];
    clusters: string[][];
}

const WalletAnalyzerApp: React.FC = () => {
    const [walletAddress, setWalletAddress] = useState('');
    const [tokenMint, setTokenMint] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState('');
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedWallet, setExpandedWallet] = useState<string | null>(null);

    const validateAddress = (addr: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr);

    const formatAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const fetchTransactionHistory = async (address: string): Promise<any[]> => {
        const response = await fetch(HELIUS_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getSignaturesForAddress',
                params: [address, { limit: 100 }]
            })
        });
        const data = await response.json();
        return data?.result || [];
    };

    const fetchTransactionDetails = async (signatures: string[]): Promise<any[]> => {
        const transactions: any[] = [];
        
        // Batch fetch in groups of 10
        for (let i = 0; i < signatures.length; i += 10) {
            const batch = signatures.slice(i, i + 10);
            const promises = batch.map(sig => 
                fetch(HELIUS_RPC, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'getTransaction',
                        params: [sig, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }]
                    })
                }).then(r => r.json())
            );
            
            const results = await Promise.all(promises);
            transactions.push(...results.map(r => r?.result).filter(Boolean));
        }
        
        return transactions;
    };

    const extractWalletsFromTransaction = (tx: any, sourceWallet: string, targetToken?: string): Map<string, { count: number; amount: number; timestamps: number[] }> => {
        const wallets = new Map<string, { count: number; amount: number; timestamps: number[] }>();
        
        if (!tx?.meta || !tx?.transaction) return wallets;
        
        const timestamp = tx.blockTime || 0;
        
        // Check pre/post token balances for token transfers
        const preBalances = tx.meta.preTokenBalances || [];
        const postBalances = tx.meta.postTokenBalances || [];
        
        const allTokenAccounts = [...preBalances, ...postBalances];
        
        for (const balance of allTokenAccounts) {
            const owner = balance.owner;
            const mint = balance.mint;
            
            // Skip if we have a target token and this isn't it
            if (targetToken && mint !== targetToken) continue;
            
            if (owner && owner !== sourceWallet) {
                const existing = wallets.get(owner) || { count: 0, amount: 0, timestamps: [] };
                existing.count++;
                existing.timestamps.push(timestamp);
                
                // Try to get transfer amount
                const preAmount = preBalances.find((b: any) => b.owner === owner && b.mint === mint)?.uiTokenAmount?.uiAmount || 0;
                const postAmount = postBalances.find((b: any) => b.owner === owner && b.mint === mint)?.uiTokenAmount?.uiAmount || 0;
                existing.amount += Math.abs(postAmount - preAmount);
                
                wallets.set(owner, existing);
            }
        }
        
        // Also check account keys for SOL transfers
        const accountKeys = tx.transaction?.message?.accountKeys || [];
        for (const key of accountKeys) {
            const pubkey = typeof key === 'string' ? key : key.pubkey;
            if (pubkey && pubkey !== sourceWallet && validateAddress(pubkey)) {
                const existing = wallets.get(pubkey) || { count: 0, amount: 0, timestamps: [] };
                if (!existing.timestamps.includes(timestamp)) {
                    existing.count++;
                    existing.timestamps.push(timestamp);
                }
                wallets.set(pubkey, existing);
            }
        }
        
        return wallets;
    };

    const analyzeWallet = async () => {
        if (!validateAddress(walletAddress)) {
            setError('Please enter a valid Solana wallet address');
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setResult(null);
        setProgress('Fetching transaction history...');

        try {
            // Step 1: Get transaction signatures for source wallet
            const signatures = await fetchTransactionHistory(walletAddress);
            setProgress(`Found ${signatures.length} transactions. Analyzing...`);

            if (signatures.length === 0) {
                setError('No transactions found for this wallet');
                setIsAnalyzing(false);
                return;
            }

            // Step 2: Fetch transaction details
            const sigList = signatures.map((s: any) => s.signature);
            setProgress(`Fetching details for ${sigList.length} transactions...`);
            const transactions = await fetchTransactionDetails(sigList.slice(0, 50)); // Limit to 50 for speed

            // Step 3: Extract all connected wallets
            setProgress('Extracting connected wallets...');
            const connectedWalletsMap = new Map<string, { count: number; amount: number; timestamps: number[] }>();
            const processedTxs: Transaction[] = [];

            for (const tx of transactions) {
                const wallets = extractWalletsFromTransaction(tx, walletAddress, tokenMint || undefined);
                
                for (const [addr, data] of wallets) {
                    const existing = connectedWalletsMap.get(addr) || { count: 0, amount: 0, timestamps: [] };
                    existing.count += data.count;
                    existing.amount += data.amount;
                    existing.timestamps.push(...data.timestamps);
                    connectedWalletsMap.set(addr, existing);
                }
            }

            // Step 4: For top connected wallets, check their transactions for indirect connections
            setProgress('Analyzing indirect connections...');
            const topWallets = Array.from(connectedWalletsMap.entries())
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 10);

            const indirectConnections = new Map<string, { count: number; viaWallets: string[] }>();

            for (const [connectedAddr] of topWallets.slice(0, 5)) {
                try {
                    const theirSigs = await fetchTransactionHistory(connectedAddr);
                    const theirTxs = await fetchTransactionDetails(theirSigs.slice(0, 20).map((s: any) => s.signature));
                    
                    for (const tx of theirTxs) {
                        const wallets = extractWalletsFromTransaction(tx, connectedAddr, tokenMint || undefined);
                        for (const [indirectAddr] of wallets) {
                            if (indirectAddr !== walletAddress && !connectedWalletsMap.has(indirectAddr)) {
                                const existing = indirectConnections.get(indirectAddr) || { count: 0, viaWallets: [] };
                                existing.count++;
                                if (!existing.viaWallets.includes(connectedAddr)) {
                                    existing.viaWallets.push(connectedAddr);
                                }
                                indirectConnections.set(indirectAddr, existing);
                            }
                        }
                    }
                } catch (e) {
                    console.log(`Failed to analyze ${connectedAddr}`);
                }
            }

            // Step 5: Build result
            setProgress('Building analysis result...');
            
            const connectedWallets: WalletConnection[] = [];

            // Add direct connections
            for (const [addr, data] of connectedWalletsMap) {
                const timestamps = data.timestamps.filter(t => t > 0).sort();
                connectedWallets.push({
                    address: addr,
                    type: 'direct',
                    transactions: data.count,
                    totalAmount: data.amount,
                    firstSeen: timestamps.length > 0 ? formatDate(timestamps[0]) : 'Unknown',
                    lastSeen: timestamps.length > 0 ? formatDate(timestamps[timestamps.length - 1]) : 'Unknown',
                    confidence: Math.min(100, data.count * 10)
                });
            }

            // Add indirect connections (found via common counterparties)
            for (const [addr, data] of indirectConnections) {
                if (data.viaWallets.length >= 2) {
                    connectedWallets.push({
                        address: addr,
                        type: 'indirect',
                        transactions: data.count,
                        totalAmount: 0,
                        firstSeen: 'Via ' + data.viaWallets.length + ' wallets',
                        lastSeen: '--',
                        confidence: Math.min(80, data.viaWallets.length * 20)
                    });
                }
            }

            // Sort by confidence
            connectedWallets.sort((a, b) => b.confidence - a.confidence);

            // Build clusters (wallets likely owned by same person)
            const clusters: string[][] = [];
            const highConfidence = connectedWallets.filter(w => w.confidence >= 50 && w.type === 'direct');
            if (highConfidence.length > 0) {
                clusters.push([walletAddress, ...highConfidence.slice(0, 5).map(w => w.address)]);
            }

            setResult({
                sourceWallet: walletAddress,
                connectedWallets: connectedWallets.slice(0, 50),
                transactions: processedTxs,
                clusters
            });

            setProgress('Analysis complete!');
        } catch (err) {
            console.error('Analysis error:', err);
            setError('Failed to analyze wallet. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="wallet-analyzer">
            <div className="analyzer-header">
                <h1>🔍 Wallet Analyzer</h1>
                <p>Trace wallet connections and find related addresses</p>
            </div>

            <div className="input-section">
                <div className="input-group">
                    <label>Wallet Address *</label>
                    <input
                        type="text"
                        placeholder="Enter Solana wallet address..."
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="address-input"
                    />
                </div>

                <div className="input-group">
                    <label>Token Mint (Optional)</label>
                    <input
                        type="text"
                        placeholder="Filter by specific token mint..."
                        value={tokenMint}
                        onChange={(e) => setTokenMint(e.target.value)}
                        className="address-input"
                    />
                    <span className="input-hint">Leave empty to analyze all transactions</span>
                </div>

                <button 
                    className="analyze-btn" 
                    onClick={analyzeWallet}
                    disabled={isAnalyzing || !walletAddress}
                >
                    {isAnalyzing ? (
                        <>
                            <span className="spinner-small"></span>
                            Analyzing...
                        </>
                    ) : (
                        <>🔎 Analyze Wallet</>
                    )}
                </button>

                {progress && isAnalyzing && (
                    <div className="progress-text">{progress}</div>
                )}

                {error && (
                    <div className="error-text">❌ {error}</div>
                )}
            </div>

            {result && (
                <div className="results-section">
                    <div className="results-summary">
                        <div className="summary-card">
                            <span className="summary-value">{result.connectedWallets.length}</span>
                            <span className="summary-label">Connected Wallets</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-value">
                                {result.connectedWallets.filter(w => w.type === 'direct').length}
                            </span>
                            <span className="summary-label">Direct Connections</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-value">
                                {result.connectedWallets.filter(w => w.confidence >= 70).length}
                            </span>
                            <span className="summary-label">High Confidence</span>
                        </div>
                    </div>

                    {result.clusters.length > 0 && (
                        <div className="clusters-section">
                            <h3>🔗 Likely Same Owner</h3>
                            <div className="cluster-box">
                                {result.clusters[0].map((addr, i) => (
                                    <span key={addr} className="cluster-address">
                                        {i === 0 ? '👤 ' : '↔️ '}
                                        <code onClick={() => copyToClipboard(addr)}>{formatAddress(addr)}</code>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="wallets-list">
                        <h3>📋 Connected Wallets</h3>
                        {result.connectedWallets.map((wallet) => (
                            <div 
                                key={wallet.address} 
                                className={`wallet-card ${wallet.type} ${expandedWallet === wallet.address ? 'expanded' : ''}`}
                                onClick={() => setExpandedWallet(expandedWallet === wallet.address ? null : wallet.address)}
                            >
                                <div className="wallet-main">
                                    <div className="wallet-address">
                                        <code onClick={(e) => { e.stopPropagation(); copyToClipboard(wallet.address); }}>
                                            {wallet.address}
                                        </code>
                                        <span className={`connection-badge ${wallet.type}`}>
                                            {wallet.type === 'direct' ? '↔️ Direct' : '🔀 Indirect'}
                                        </span>
                                    </div>
                                    <div className="wallet-meta">
                                        <span className="meta-item">
                                            <strong>{wallet.transactions}</strong> txns
                                        </span>
                                        {wallet.totalAmount > 0 && (
                                            <span className="meta-item">
                                                <strong>{wallet.totalAmount.toLocaleString()}</strong> tokens
                                            </span>
                                        )}
                                        <span className="meta-item">
                                            First: {wallet.firstSeen}
                                        </span>
                                        <span className="meta-item">
                                            Last: {wallet.lastSeen}
                                        </span>
                                    </div>
                                    <div className="confidence-bar">
                                        <div 
                                            className="confidence-fill" 
                                            style={{ width: `${wallet.confidence}%` }}
                                        ></div>
                                        <span className="confidence-text">{wallet.confidence}% confidence</span>
                                    </div>
                                </div>
                                
                                {expandedWallet === wallet.address && (
                                    <div className="wallet-actions">
                                        <a 
                                            href={`https://solscan.io/account/${wallet.address}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="action-link"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            View on Solscan →
                                        </a>
                                        <button 
                                            className="action-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setWalletAddress(wallet.address);
                                                setResult(null);
                                            }}
                                        >
                                            Analyze This Wallet
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="analyzer-footer">
                <p>Powered by Helius RPC • Data may not reflect all connections</p>
            </div>
        </div>
    );
};

export default WalletAnalyzerApp;

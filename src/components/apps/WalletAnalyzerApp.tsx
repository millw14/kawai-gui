import { useState } from 'react';
import './WalletAnalyzerApp.css';

const HELIUS_API_KEY = '22039ce1-fa6d-44d0-9995-3ac0b4f039e9';
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const HELIUS_API = `https://api.helius.xyz/v0`;

// Tokens to exclude from similarity analysis (everyone trades these)
const EXCLUDED_TOKENS = [
    'So11111111111111111111111111111111111111112', // Wrapped SOL
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
];

interface TokenTrade {
    signature: string;
    timestamp: number;
    tokenMint: string;
    type: 'buy' | 'sell' | 'transfer';
    amount: number;
}

interface WalletProfile {
    address: string;
    trades: TokenTrade[];
    tokensMinted: string[];
}

interface SimilarWallet {
    address: string;
    similarityScore: number;
    sharedTokens: string[];
    sharedTradeCount: number;
    timingCorrelation: number;
    details: string;
    flags: string[];
}

interface WalletStatus {
    currentlyHolding: boolean;
    holdingAmount: number;
    totalBought: number;
    totalSold: number;
    firstTradeTime: number;
    lastTradeTime: number;
    tradeCount: number;
    isEarlyBuyer: boolean;
    profitStatus: 'profit' | 'loss' | 'holding' | 'unknown';
}

const WalletAnalyzerApp: React.FC = () => {
    const [targetWallet, setTargetWallet] = useState('');
    const [tokenMint, setTokenMint] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState('');
    const [progressPercent, setProgressPercent] = useState(0);
    const [similarWallets, setSimilarWallets] = useState<SimilarWallet[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [expandedWallet, setExpandedWallet] = useState<string | null>(null);
    const [targetProfile, setTargetProfile] = useState<WalletProfile | null>(null);
    const [targetStatus, setTargetStatus] = useState<WalletStatus | null>(null);

    const validateAddress = (addr: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr);
    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    const formatTime = (ts: number) => ts ? new Date(ts * 1000).toLocaleDateString() : 'Unknown';

    // Check current token holdings
    const checkCurrentHolding = async (wallet: string, mint: string): Promise<number> => {
        try {
            const response = await fetch(HELIUS_RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getTokenAccountsByOwner',
                    params: [wallet, { mint }, { encoding: 'jsonParsed' }]
                })
            });
            const data = await response.json();
            const accounts = data?.result?.value || [];
            let total = 0;
            for (const acc of accounts) {
                total += acc?.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0;
            }
            return total;
        } catch {
            return 0;
        }
    };

    // Get token creation time (first transaction)
    const getTokenCreationTime = async (mint: string): Promise<number> => {
        try {
            const response = await fetch(HELIUS_RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getSignaturesForAddress',
                    params: [mint, { limit: 1000 }]
                })
            });
            const data = await response.json();
            const sigs = data?.result || [];
            if (sigs.length > 0) {
                return sigs[sigs.length - 1].blockTime || 0;
            }
            return 0;
        } catch {
            return 0;
        }
    };

    // Analyze wallet status for a specific token
    const analyzeWalletStatus = (profile: WalletProfile, targetToken: string, tokenCreationTime: number): WalletStatus => {
        const tokenTrades = profile.trades.filter(t => t.tokenMint === targetToken);
        
        let totalBought = 0;
        let totalSold = 0;
        let firstTradeTime = Infinity;
        let lastTradeTime = 0;

        for (const trade of tokenTrades) {
            if (trade.type === 'buy') {
                totalBought += trade.amount;
            } else {
                totalSold += trade.amount;
            }
            if (trade.timestamp < firstTradeTime) firstTradeTime = trade.timestamp;
            if (trade.timestamp > lastTradeTime) lastTradeTime = trade.timestamp;
        }

        // Check if early buyer (within first 24 hours of token creation)
        const isEarlyBuyer = tokenCreationTime > 0 && firstTradeTime > 0 && 
            (firstTradeTime - tokenCreationTime) < 86400;

        // Determine profit status
        let profitStatus: 'profit' | 'loss' | 'holding' | 'unknown' = 'unknown';
        if (totalBought > 0 && totalSold > 0) {
            profitStatus = totalSold > totalBought * 0.8 ? 'profit' : 'loss';
        } else if (totalBought > 0 && totalSold === 0) {
            profitStatus = 'holding';
        }

        return {
            currentlyHolding: false, // Will be updated with actual balance check
            holdingAmount: 0,
            totalBought,
            totalSold,
            firstTradeTime: firstTradeTime === Infinity ? 0 : firstTradeTime,
            lastTradeTime,
            tradeCount: tokenTrades.length,
            isEarlyBuyer,
            profitStatus
        };
    };

    // Generate flags/badges for a wallet
    const generateWalletFlags = (status: WalletStatus, currentBalance: number): string[] => {
        const flags: string[] = [];

        if (currentBalance > 0) {
            flags.push('💎 Currently Holding');
        } else if (status.totalBought > 0) {
            flags.push('📤 Sold Out');
        }

        if (status.isEarlyBuyer) {
            flags.push('🚀 Early Buyer');
        }

        if (status.tradeCount >= 10) {
            flags.push('📊 Active Trader');
        } else if (status.tradeCount === 1) {
            flags.push('1️⃣ Single Trade');
        }

        if (status.profitStatus === 'profit') {
            flags.push('💰 Likely Profit');
        } else if (status.profitStatus === 'holding') {
            flags.push('🤲 Diamond Hands');
        }

        // Check if dormant (no trades in 30 days)
        const thirtyDaysAgo = Date.now() / 1000 - 30 * 86400;
        if (status.lastTradeTime < thirtyDaysAgo && status.lastTradeTime > 0) {
            flags.push('😴 Dormant');
        }

        return flags;
    };

    // Fetch parsed transaction history using Helius enhanced API
    const fetchParsedTransactions = async (wallet: string, limit = 100): Promise<any[]> => {
        try {
            const response = await fetch(
                `${HELIUS_API}/addresses/${wallet}/transactions?api-key=${HELIUS_API_KEY}&limit=${limit}`
            );
            if (!response.ok) return [];
            return await response.json();
        } catch {
            return [];
        }
    };

    // Extract trading profile from transactions
    const buildWalletProfile = (wallet: string, transactions: any[]): WalletProfile => {
        const trades: TokenTrade[] = [];
        const tokensMinted = new Set<string>();

        for (const tx of transactions) {
            const timestamp = tx.timestamp || 0;
            const signature = tx.signature || '';

            // Check token transfers
            if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
                for (const transfer of tx.tokenTransfers) {
                    const mint = transfer.mint;
                    if (!mint || EXCLUDED_TOKENS.includes(mint)) continue;

                    tokensMinted.add(mint);

                    const isReceiving = transfer.toUserAccount === wallet;
                    const isSending = transfer.fromUserAccount === wallet;

                    if (isReceiving || isSending) {
                        trades.push({
                            signature,
                            timestamp,
                            tokenMint: mint,
                            type: isReceiving ? 'buy' : 'sell',
                            amount: transfer.tokenAmount || 0
                        });
                    }
                }
            }

            // Check swap events
            if (tx.events?.swap) {
                const swap = tx.events.swap;
                if (swap.tokenInputs) {
                    for (const input of swap.tokenInputs) {
                        if (EXCLUDED_TOKENS.includes(input.mint)) continue;
                        tokensMinted.add(input.mint);
                        trades.push({
                            signature,
                            timestamp,
                            tokenMint: input.mint,
                            type: 'sell',
                            amount: input.tokenAmount || 0
                        });
                    }
                }
                if (swap.tokenOutputs) {
                    for (const output of swap.tokenOutputs) {
                        if (EXCLUDED_TOKENS.includes(output.mint)) continue;
                        tokensMinted.add(output.mint);
                        trades.push({
                            signature,
                            timestamp,
                            tokenMint: output.mint,
                            type: 'buy',
                            amount: output.tokenAmount || 0
                        });
                    }
                }
            }
        }

        return {
            address: wallet,
            trades,
            tokensMinted: Array.from(tokensMinted)
        };
    };

    // Calculate similarity between two wallet profiles
    const calculateSimilarity = (
        target: WalletProfile,
        other: WalletProfile
    ): { score: number; sharedTokens: string[]; sharedTradeCount: number; timingCorrelation: number; details: string } => {
        // Find shared tokens
        const targetTokens = new Set(target.tokensMinted);
        const sharedTokens = other.tokensMinted.filter(t => targetTokens.has(t));

        if (sharedTokens.length === 0) {
            return { score: 0, sharedTokens: [], sharedTradeCount: 0, timingCorrelation: 0, details: 'No shared tokens' };
        }

        // Count trades on same tokens
        let sharedTradeCount = 0;
        let timingMatches = 0;
        const details: string[] = [];

        for (const token of sharedTokens) {
            const targetTrades = target.trades.filter(t => t.tokenMint === token);
            const otherTrades = other.trades.filter(t => t.tokenMint === token);

            sharedTradeCount += Math.min(targetTrades.length, otherTrades.length);

            // Check timing correlation (trades within 1 hour of each other)
            for (const tTrade of targetTrades) {
                for (const oTrade of otherTrades) {
                    const timeDiff = Math.abs(tTrade.timestamp - oTrade.timestamp);
                    if (timeDiff < 3600) { // Within 1 hour
                        timingMatches++;
                        if (tTrade.type === oTrade.type) {
                            details.push(`Both ${tTrade.type === 'buy' ? 'bought' : 'sold'} ${formatAddress(token)} within 1hr`);
                        }
                    } else if (timeDiff < 86400) { // Within 24 hours
                        timingMatches += 0.5;
                    }
                }
            }
        }

        // Calculate overall score (0-100)
        const tokenScore = Math.min(40, sharedTokens.length * 10); // Max 40 points for shared tokens
        const tradeScore = Math.min(30, sharedTradeCount * 5); // Max 30 points for trade count
        const timingScore = Math.min(30, timingMatches * 10); // Max 30 points for timing

        const score = Math.round(tokenScore + tradeScore + timingScore);

        return {
            score,
            sharedTokens,
            sharedTradeCount,
            timingCorrelation: Math.round(timingMatches),
            details: details.slice(0, 3).join('; ') || `${sharedTokens.length} shared tokens, ${sharedTradeCount} similar trades`
        };
    };

    // Get token holders
    const getTokenHolders = async (mint: string): Promise<string[]> => {
        try {
            // Get largest token accounts
            const response = await fetch(HELIUS_RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getTokenLargestAccounts',
                    params: [mint]
                })
            });

            const data = await response.json();
            const accounts = data?.result?.value || [];

            // Get owner addresses for each token account
            const owners: string[] = [];
            for (const account of accounts.slice(0, 20)) {
                try {
                    const infoRes = await fetch(HELIUS_RPC, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jsonrpc: '2.0',
                            id: 1,
                            method: 'getAccountInfo',
                            params: [account.address, { encoding: 'jsonParsed' }]
                        })
                    });
                    const infoData = await infoRes.json();
                    const owner = infoData?.result?.value?.data?.parsed?.info?.owner;
                    if (owner && owner !== targetWallet) {
                        owners.push(owner);
                    }
                } catch {
                    continue;
                }
            }

            return owners;
        } catch {
            return [];
        }
    };

    const analyzeWallet = async () => {
        if (!validateAddress(targetWallet)) {
            setError('Please enter a valid Solana wallet address');
            return;
        }

        if (!tokenMint || !validateAddress(tokenMint)) {
            setError('Please enter a valid token mint address');
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setSimilarWallets([]);
        setTargetProfile(null);
        setTargetStatus(null);
        setProgressPercent(0);

        try {
            // Step 1: Build target wallet profile
            setProgress('Analyzing target wallet trades...');
            setProgressPercent(5);
            
            const targetTxs = await fetchParsedTransactions(targetWallet, 100);
            if (targetTxs.length === 0) {
                setError('No transactions found for target wallet');
                setIsAnalyzing(false);
                return;
            }

            const targetProf = buildWalletProfile(targetWallet, targetTxs);
            setTargetProfile(targetProf);
            setProgressPercent(10);

            // Step 2: Get token creation time and target's current holding
            setProgress('Checking token status...');
            const [tokenCreationTime, targetCurrentBalance] = await Promise.all([
                getTokenCreationTime(tokenMint),
                checkCurrentHolding(targetWallet, tokenMint)
            ]);
            setProgressPercent(15);

            // Step 3: Analyze target wallet status for this token
            const targetStat = analyzeWalletStatus(targetProf, tokenMint, tokenCreationTime);
            targetStat.currentlyHolding = targetCurrentBalance > 0;
            targetStat.holdingAmount = targetCurrentBalance;
            setTargetStatus(targetStat);
            setProgressPercent(20);

            // Step 4: Get token holders
            setProgress('Finding token holders...');
            const holders = await getTokenHolders(tokenMint);
            setProgressPercent(25);

            if (holders.length === 0) {
                setError('Could not find token holders');
                setIsAnalyzing(false);
                return;
            }

            // Step 5: Analyze each holder's trading patterns
            setProgress(`Analyzing ${holders.length} holders...`);
            const results: SimilarWallet[] = [];

            for (let i = 0; i < holders.length; i++) {
                const holder = holders[i];
                setProgress(`Analyzing holder ${i + 1}/${holders.length}: ${formatAddress(holder)}`);
                setProgressPercent(25 + Math.round((i / holders.length) * 65));

                try {
                    const [holderTxs, holderBalance] = await Promise.all([
                        fetchParsedTransactions(holder, 50),
                        checkCurrentHolding(holder, tokenMint)
                    ]);
                    if (holderTxs.length === 0) continue;

                    const holderProfile = buildWalletProfile(holder, holderTxs);
                    const similarity = calculateSimilarity(targetProf, holderProfile);
                    const holderStatus = analyzeWalletStatus(holderProfile, tokenMint, tokenCreationTime);
                    holderStatus.currentlyHolding = holderBalance > 0;
                    holderStatus.holdingAmount = holderBalance;

                    const flags = generateWalletFlags(holderStatus, holderBalance);

                    if (similarity.score > 10) {
                        results.push({
                            address: holder,
                            similarityScore: similarity.score,
                            sharedTokens: similarity.sharedTokens,
                            sharedTradeCount: similarity.sharedTradeCount,
                            timingCorrelation: similarity.timingCorrelation,
                            details: similarity.details,
                            flags
                        });
                    }
                } catch {
                    continue;
                }

                // Small delay to avoid rate limits
                await new Promise(r => setTimeout(r, 150));
            }

            // Sort by similarity score
            results.sort((a, b) => b.similarityScore - a.similarityScore);
            setSimilarWallets(results);
            setProgressPercent(100);
            setProgress(`Found ${results.length} wallets with similar trading patterns`);

        } catch (err) {
            console.error('Analysis error:', err);
            setError('Analysis failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return '#14F195';
        if (score >= 40) return '#FFD700';
        return '#ff8fa3';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 70) return 'High Match';
        if (score >= 40) return 'Medium Match';
        return 'Low Match';
    };

    return (
        <div className="wallet-analyzer">
            <div className="analyzer-header">
                <h1>🔍 Wallet Pattern Analyzer</h1>
                <p>Find wallets with similar trading patterns among token holders</p>
            </div>

            <div className="input-section">
                <div className="input-row">
                    <div className="input-group">
                        <label>🎯 Target Wallet *</label>
                        <input
                            type="text"
                            placeholder="Wallet to find similar traders to..."
                            value={targetWallet}
                            onChange={(e) => setTargetWallet(e.target.value)}
                            className="address-input"
                        />
                    </div>

                    <div className="input-group">
                        <label>🪙 Token Mint *</label>
                        <input
                            type="text"
                            placeholder="Token to scan holders..."
                            value={tokenMint}
                            onChange={(e) => setTokenMint(e.target.value)}
                            className="address-input"
                        />
                    </div>
                </div>

                <div className="info-box">
                    <p>📊 This tool scans token holders and compares their trading history with the target wallet to find potentially related wallets based on:</p>
                    <ul>
                        <li>Shared tokens traded</li>
                        <li>Similar buy/sell timing</li>
                        <li>Trading pattern correlation</li>
                    </ul>
                </div>

                <button 
                    className="analyze-btn" 
                    onClick={analyzeWallet}
                    disabled={isAnalyzing || !targetWallet || !tokenMint}
                >
                    {isAnalyzing ? (
                        <>
                            <span className="spinner-small"></span>
                            Analyzing...
                        </>
                    ) : (
                        <>🔎 Find Similar Wallets</>
                    )}
                </button>

                {isAnalyzing && (
                    <div className="progress-section">
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <p className="progress-text">{progress}</p>
                    </div>
                )}

                {error && (
                    <div className="error-text">❌ {error}</div>
                )}
            </div>

            {targetProfile && (
                <div className="target-summary">
                    <h3>📋 Target Wallet Summary</h3>
                    
                    {targetStatus && (
                        <div className="target-status-flags">
                            {generateWalletFlags(targetStatus, targetStatus.holdingAmount).map((flag, i) => (
                                <span key={i} className="status-flag">{flag}</span>
                            ))}
                        </div>
                    )}

                    <div className="summary-stats">
                        <div className="stat">
                            <span className="stat-value">{targetProfile.trades.length}</span>
                            <span className="stat-label">Total Trades</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">{targetProfile.tokensMinted.length}</span>
                            <span className="stat-label">Tokens Traded</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">{targetProfile.trades.filter(t => t.type === 'buy').length}</span>
                            <span className="stat-label">Buys</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">{targetProfile.trades.filter(t => t.type === 'sell').length}</span>
                            <span className="stat-label">Sells</span>
                        </div>
                    </div>

                    {targetStatus && (
                        <div className="target-token-info">
                            <div className="token-info-row">
                                <span>Token Balance:</span>
                                <strong>{targetStatus.currentlyHolding ? targetStatus.holdingAmount.toLocaleString() : '0 (Sold Out)'}</strong>
                            </div>
                            <div className="token-info-row">
                                <span>First Trade:</span>
                                <strong>{formatTime(targetStatus.firstTradeTime)}</strong>
                            </div>
                            <div className="token-info-row">
                                <span>Last Trade:</span>
                                <strong>{formatTime(targetStatus.lastTradeTime)}</strong>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {similarWallets.length > 0 && (
                <div className="results-section">
                    <h3>🎯 Similar Wallets Found ({similarWallets.length})</h3>
                    <p className="results-subtitle">Sorted by trading pattern similarity</p>

                    <div className="wallets-list">
                        {similarWallets.map((wallet, index) => (
                            <div 
                                key={wallet.address}
                                className={`wallet-card ${expandedWallet === wallet.address ? 'expanded' : ''}`}
                                onClick={() => setExpandedWallet(expandedWallet === wallet.address ? null : wallet.address)}
                            >
                                <div className="wallet-rank">#{index + 1}</div>
                                
                                <div className="wallet-main">
                                    <div className="wallet-header-row">
                                        <code 
                                            className="wallet-address"
                                            onClick={(e) => { e.stopPropagation(); copyToClipboard(wallet.address); }}
                                        >
                                            {wallet.address}
                                        </code>
                                        <div 
                                            className="score-badge"
                                            style={{ 
                                                background: `${getScoreColor(wallet.similarityScore)}20`,
                                                color: getScoreColor(wallet.similarityScore),
                                                borderColor: getScoreColor(wallet.similarityScore)
                                            }}
                                        >
                                            {wallet.similarityScore}% • {getScoreLabel(wallet.similarityScore)}
                                        </div>
                                    </div>

                                    {wallet.flags.length > 0 && (
                                        <div className="wallet-flags">
                                            {wallet.flags.map((flag, i) => (
                                                <span key={i} className="wallet-flag">{flag}</span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="wallet-metrics">
                                        <span className="metric">
                                            <strong>{wallet.sharedTokens.length}</strong> shared tokens
                                        </span>
                                        <span className="metric">
                                            <strong>{wallet.sharedTradeCount}</strong> similar trades
                                        </span>
                                        <span className="metric">
                                            <strong>{wallet.timingCorrelation}</strong> timing matches
                                        </span>
                                    </div>

                                    <div className="wallet-details">{wallet.details}</div>

                                    <div className="score-bar">
                                        <div 
                                            className="score-fill"
                                            style={{ 
                                                width: `${wallet.similarityScore}%`,
                                                background: `linear-gradient(90deg, ${getScoreColor(wallet.similarityScore)}, ${getScoreColor(wallet.similarityScore)}80)`
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {expandedWallet === wallet.address && (
                                    <div className="wallet-expanded">
                                        <div className="shared-tokens">
                                            <h4>Shared Tokens:</h4>
                                            <div className="token-list">
                                                {wallet.sharedTokens.slice(0, 5).map(token => (
                                                    <code key={token} onClick={(e) => { e.stopPropagation(); copyToClipboard(token); }}>
                                                        {formatAddress(token)}
                                                    </code>
                                                ))}
                                                {wallet.sharedTokens.length > 5 && (
                                                    <span className="more-tokens">+{wallet.sharedTokens.length - 5} more</span>
                                                )}
                                            </div>
                                        </div>
                                        
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
                                                    setTargetWallet(wallet.address);
                                                    setSimilarWallets([]);
                                                    setTargetProfile(null);
                                                }}
                                            >
                                                Analyze This Wallet
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isAnalyzing && similarWallets.length === 0 && targetProfile && (
                <div className="no-results">
                    <p>No wallets with similar trading patterns found among the token holders.</p>
                </div>
            )}

            <div className="analyzer-footer">
                <p>Powered by Helius API • Analyzes trading patterns to find potentially related wallets</p>
            </div>
        </div>
    );
};

export default WalletAnalyzerApp;

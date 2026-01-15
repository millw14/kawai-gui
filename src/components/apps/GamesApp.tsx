import { useState, useEffect, useMemo } from 'react';
import './GamesApp.css';

const TOKEN_MINT = '6ggxkzDCAB3hjiRFUGdiNfcW2viET3REtsbEmVFXpump';
const REQUIRED_AMOUNT = 1_000_000;
// Token-2022 program ID for newer tokens
const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
// Multiple RPC endpoints for reliability
const RPC_ENDPOINTS = [
    'https://api.mainnet-beta.solana.com',
    'https://rpc.ankr.com/solana',
    'https://solana-api.projectserum.com',
    'https://ssc-dao.genesysgo.net'
];

interface MarketData {
    priceUsd: number | null;
    priceChange24h: number | null;
    volume24h: number | null;
    liquidityUsd: number | null;
    fdv: number | null;
    lastUpdated: string | null;
}

interface Question {
    id: number;
    question: string;
    options: string[];
    answer: number; // 0-indexed
    category: string;
}

const QUESTIONS: Question[] = [
    { id: 1, question: "What is the primary purpose of the Kawai project?", options: ["To create NFT artwork on Windows", "To provide a native Windows toolkit for Solana development", "To replace Rust with JavaScript for blockchain", "To build games using Solana"], answer: 1, category: "Basics" },
    { id: 2, question: "Which operating system is Kawai specifically designed for?", options: ["Linux only", "macOS only", "Windows", "Android"], answer: 2, category: "Basics" },
    { id: 3, question: "What major tools does Kawai remove the need for?", options: ["Git and GitHub", "Python and Node.js", "WSL, Docker, and Linux VMs", "Visual Studio Code"], answer: 2, category: "Basics" },
    { id: 4, question: "What slogan best represents Kawai's core philosophy?", options: ["Build once, run everywhere", "No WSL. No VM. No Linux. Just Windows.", "Code faster in the cloud", "Blockchain made simple"], answer: 1, category: "Basics" },
    { id: 5, question: "Which blockchain ecosystem does Kawai support?", options: ["Ethereum", "Binance Smart Chain", "Solana", "Polygon"], answer: 2, category: "Basics" },
    { id: 6, question: "What programming language is Kawai primarily written in?", options: ["JavaScript", "Python", "Rust", "Go"], answer: 2, category: "Basics" },
    { id: 7, question: "What type of application is Kawai mainly?", options: ["Mobile application", "Web dashboard", "Command Line Interface (CLI)", "Browser extension"], answer: 2, category: "Basics" },
    { id: 8, question: "What license does the Kawai project use?", options: ["GPL v3", "Apache 2.0", "MIT", "BSD"], answer: 2, category: "Basics" },
    { id: 9, question: "Who is Kawai mainly built for?", options: ["Linux kernel developers", "Mobile app designers", "Windows developers building on Solana", "Game developers only"], answer: 2, category: "Basics" },
    { id: 10, question: "What is the name of the project mascot?", options: ["Solana-chan", "Kawai-chan", "Rusty-chan", "Anchor-kun"], answer: 1, category: "Basics" },
    { id: 11, question: "Why is Kawai faster than WSL for development?", options: ["It uses Java instead of Rust", "It runs as a native Windows process", "It stores data in the cloud", "It compiles only in debug mode"], answer: 1, category: "Why Kawai" },
    { id: 12, question: "How does Kawai reduce memory usage compared to WSL?", options: ["By disabling logging", "By using compressed binaries", "By avoiding virtual machines and overhead", "By running only in browser"], answer: 2, category: "Why Kawai" },
    { id: 13, question: "What type of file system does Kawai use for better I/O performance?", options: ["FAT32", "EXT4", "NTFS", "ZFS"], answer: 2, category: "Why Kawai" },
    { id: 14, question: "How does Kawai handle networking compared to WSL?", options: ["Uses VPN tunnels", "Uses virtual adapters", "Uses direct sockets", "Uses only HTTP"], answer: 2, category: "Why Kawai" },
    { id: 15, question: "What is one major setup advantage of Kawai?", options: ["Requires Linux installation", "Works only in containers", "One-command setup", "Needs dual boot"], answer: 2, category: "Why Kawai" },
    { id: 16, question: "What does `kawai validator start` do?", options: ["Starts Docker containers", "Connects to mainnet only", "Launches a native Windows Solana test validator", "Installs Rust"], answer: 2, category: "Validator" },
    { id: 17, question: "Which of the following is NOT required to run Kawai's validator?", options: ["Docker", "WSL", "Linux VM", "All of the above"], answer: 3, category: "Validator" },
    { id: 18, question: "How do you stop the validator?", options: ["kawai validator close", "kawai stop validator", "kawai validator stop", "kawai exit validator"], answer: 2, category: "Validator" },
    { id: 19, question: "Which command checks whether the validator is running?", options: ["kawai status", "kawai validator status", "kawai check validator", "kawai info"], answer: 1, category: "Validator" },
    { id: 20, question: "Which flag allows you to reset the validator state?", options: ["--clear", "--wipe", "--reset", "--new"], answer: 2, category: "Validator" },
    { id: 21, question: "How can you specify a custom port for the validator?", options: ["--bind", "--listen", "--port", "--address"], answer: 2, category: "Validator" },
    { id: 22, question: "What command shows validator logs and epoch info?", options: ["kawai logs", "kawai validator logs", "kawai validator info", "kawai debug"], answer: 1, category: "Validator" },
    { id: 23, question: "How does Kawai's validator run?", options: ["In Docker container", "In Linux VM", "As a native Windows process", "In browser"], answer: 2, category: "Validator" },
    { id: 24, question: "What is special about Kawai's local validator?", options: ["Requires internet always", "Uses Ethereum backend", "Pure Windows implementation", "Only works on macOS"], answer: 2, category: "Validator" },
    { id: 25, question: "Which of these backends is considered deprecated in Kawai?", options: ["Native Windows", "Docker", "WSL", "Cloud"], answer: 1, category: "Validator" },
    { id: 26, question: "What does `kawai build program` do?", options: ["Creates a wallet", "Compiles Solana programs", "Starts validator", "Transfers SOL"], answer: 1, category: "Build" },
    { id: 27, question: "What file extension does Kawai output after building a program?", options: [".exe", ".wasm", ".so", ".dll"], answer: 2, category: "Build" },
    { id: 28, question: "Where is the compiled program stored?", options: ["bin/output/", "target/deploy/", "dist/", "build/"], answer: 1, category: "Build" },
    { id: 29, question: "Which flag enables optimized builds?", options: ["--opt", "--fast", "--release", "--pro"], answer: 2, category: "Build" },
    { id: 30, question: "Which flag provides detailed output during compilation?", options: ["--details", "--verbose", "--debug", "--trace"], answer: 1, category: "Build" },
    { id: 31, question: "What does the `--backend` option allow?", options: ["Change wallet", "Choose build engine", "Switch networks", "Modify logs"], answer: 1, category: "Build" },
    { id: 32, question: "Which backend is NOT available?", options: ["auto", "docker", "wsl", "kubernetes"], answer: 3, category: "Build" },
    { id: 33, question: "How do you check the build toolchain status?", options: ["kawai status", "kawai build status", "kawai toolchain", "kawai info"], answer: 1, category: "Build" },
    { id: 34, question: "Can Kawai build programs without leaving Windows?", options: ["No", "Only in Docker", "Only in WSL", "Yes"], answer: 3, category: "Build" },
    { id: 35, question: "What does cloud build provide?", options: ["Offline compilation", "Backup storage", "Remote fallback build environment", "NFT minting"], answer: 2, category: "Build" },
    { id: 36, question: "Does Kawai support the Anchor framework?", options: ["No", "Partially", "Yes, fully", "Only on Linux"], answer: 2, category: "Anchor" },
    { id: 37, question: "How do you create a new Anchor project?", options: ["kawai new anchor", "kawai anchor init", "kawai create anchor", "kawai init anchor"], answer: 1, category: "Anchor" },
    { id: 38, question: "How do you build an Anchor project?", options: ["kawai anchor compile", "kawai anchor build", "kawai build anchor", "kawai make anchor"], answer: 1, category: "Anchor" },
    { id: 39, question: "Which command tests Anchor programs?", options: ["kawai anchor run", "kawai anchor test", "kawai test anchor", "kawai run tests"], answer: 1, category: "Anchor" },
    { id: 40, question: "What happens automatically when you run `kawai anchor test`?", options: ["Deletes wallet", "Starts validator", "Switches network", "Exports key"], answer: 1, category: "Anchor" },
    { id: 41, question: "How do you deploy an Anchor program?", options: ["kawai deploy anchor", "kawai anchor deploy", "kawai publish anchor", "kawai ship anchor"], answer: 1, category: "Anchor" },
    { id: 42, question: "Which clusters can you deploy to?", options: ["Only devnet", "Devnet and testnet", "Devnet, testnet, mainnet", "Only local"], answer: 2, category: "Anchor" },
    { id: 43, question: "What does `kawai anchor idl` do?", options: ["Builds program", "Tests contracts", "Generates interface definition", "Imports wallet"], answer: 2, category: "Anchor" },
    { id: 44, question: "Which language is used for Anchor tests?", options: ["Python", "Rust", "TypeScript", "Go"], answer: 2, category: "Anchor" },
    { id: 45, question: "What key advantage does Kawai provide for Anchor on Windows?", options: ["Requires WSL", "Runs natively", "Needs Docker", "Needs Linux VM"], answer: 1, category: "Anchor" },
    { id: 46, question: "How do you create a new wallet?", options: ["kawai new wallet", "kawai wallet add", "kawai wallet create", "kawai make wallet"], answer: 2, category: "Wallet" },
    { id: 47, question: "Which command imports an existing wallet?", options: ["kawai wallet import", "kawai wallet load", "kawai wallet add", "kawai wallet sync"], answer: 0, category: "Wallet" },
    { id: 48, question: "Which command lists all wallets?", options: ["kawai wallets", "kawai wallet list", "kawai wallet show", "kawai wallet status"], answer: 1, category: "Wallet" },
    { id: 49, question: "How do you set a default wallet?", options: ["kawai wallet choose", "kawai wallet main", "kawai wallet default", "kawai wallet primary"], answer: 2, category: "Wallet" },
    { id: 50, question: "What command exports a wallet?", options: ["kawai wallet export", "kawai wallet save", "kawai wallet backup", "kawai wallet print"], answer: 0, category: "Wallet" },
    { id: 51, question: "Which command checks your SOL balance in Kawai?", options: ["kawai check", "kawai wallet", "kawai balance", "kawai sol"], answer: 2, category: "Commands" },
    { id: 52, question: "How do you request free SOL on devnet?", options: ["kawai free-sol", "kawai faucet", "kawai airdrop", "kawai claim"], answer: 2, category: "Commands" },
    { id: 53, question: "Which command sends SOL to another wallet?", options: ["kawai send", "kawai transfer", "kawai pay", "kawai move"], answer: 1, category: "Commands" },
    { id: 54, question: "Which network options does Kawai support?", options: ["Only mainnet", "Devnet only", "Devnet, Testnet, Mainnet", "Local only"], answer: 2, category: "Commands" },
    { id: 55, question: "What does 'kawai monitor' do?", options: ["Starts validator", "Watches accounts in real time", "Deploys programs", "Checks build tools"], answer: 1, category: "Commands" },
    { id: 56, question: "Can Kawai monitor multiple accounts at once?", options: ["No", "Only two", "Yes", "Only in cloud"], answer: 2, category: "Commands" },
    { id: 57, question: "What command shows installed build tools?", options: ["kawai tools", "kawai build status", "kawai check", "kawai info"], answer: 1, category: "Commands" },
    { id: 58, question: "Which toolchain can Kawai install automatically?", options: ["Node.js", "Python", "Solana", "Git"], answer: 2, category: "Commands" },
    { id: 59, question: "Which command installs Anchor?", options: ["kawai install anchor", "kawai toolchain install-anchor", "kawai add anchor", "kawai get anchor"], answer: 1, category: "Commands" },
    { id: 60, question: "Does Kawai require Docker to work?", options: ["Yes always", "No", "Only for wallets", "Only for Anchor"], answer: 1, category: "Commands" },
    { id: 61, question: "Where is the CLI located in the project structure?", options: ["/src", "/apps/cli", "/bin", "/tools"], answer: 1, category: "Structure" },
    { id: 62, question: "Where is the desktop app located?", options: ["/apps/desktop", "/gui", "/ui", "/desktop"], answer: 0, category: "Structure" },
    { id: 63, question: "Where is the SDK core found?", options: ["/crates/kawai-sdk", "/sdk", "/lib", "/core"], answer: 0, category: "Structure" },
    { id: 64, question: "Where is the validator implementation stored?", options: ["/validator", "/crates/kawai-validator", "/tools/validator", "/apps/validator"], answer: 1, category: "Structure" },
    { id: 65, question: "Where are project images kept?", options: ["/images", "/media", "/assets", "/graphics"], answer: 2, category: "Structure" },
    { id: 66, question: "Which folder contains setup guides?", options: ["/docs/setup", "/guide", "/tutorial", "/help"], answer: 0, category: "Structure" },
    { id: 67, question: "What was introduced in version 0.1?", options: ["Desktop GUI", "Wallet management", "Account monitoring", "Token minting"], answer: 2, category: "Versions" },
    { id: 68, question: "What feature was added in version 0.2?", options: ["SDK & CLI", "NFT tools", "Desktop GUI", "Token swaps"], answer: 0, category: "Versions" },
    { id: 69, question: "Which update introduced Anchor and validator?", options: ["v0.1", "v0.2", "v0.3", "v1.0"], answer: 2, category: "Versions" },
    { id: 70, question: "What is planned for version 0.4?", options: ["Token tools", "Desktop GUI", "Mobile app", "Game engine"], answer: 1, category: "Versions" },
    { id: 71, question: "What will version 0.5 focus on?", options: ["NFT and token tools", "Validator rewrite", "Cloud only mode", "Rust removal"], answer: 0, category: "Versions" },
    { id: 72, question: "What is the long-term goal for version 1.0?", options: ["Marketing", "UI themes", "Production readiness", "Mobile port"], answer: 2, category: "Versions" },
    { id: 73, question: "What license does Kawai use?", options: ["GPL", "Apache", "MIT", "BSD"], answer: 2, category: "General" },
    { id: 74, question: "What emoji best represents the Kawai brand?", options: ["🔥", "🌸", "💀", "🧱"], answer: 1, category: "General" },
    { id: 75, question: "Who is Kawai mainly for?", options: ["Linux admins", "Mobile developers", "Windows Solana developers", "Game modders"], answer: 2, category: "General" },
    { id: 76, question: "Which mascot represents the project?", options: ["Sol-chan", "Anchor-kun", "Kawai-chan", "Rusty"], answer: 2, category: "General" },
    { id: 77, question: "What does Kawai aim to eliminate?", options: ["Rust", "Linux dependency", "GitHub", "Smart contracts"], answer: 1, category: "General" },
    { id: 78, question: "Which build backend is always available?", options: ["WSL", "Docker", "Cloud", "Native only"], answer: 2, category: "General" },
    { id: 79, question: "What does 'kawai init' do?", options: ["Starts validator", "Creates new project", "Builds program", "Exports wallet"], answer: 1, category: "General" },
    { id: 80, question: "What does 'kawai config' manage?", options: ["Network settings", "Wallet balance", "NFT minting", "Account transfer"], answer: 0, category: "General" },
    { id: 81, question: "Which command changes network?", options: ["kawai network", "kawai set net", "kawai config network", "kawai rpc"], answer: 2, category: "General" },
    { id: 82, question: "What does 'kawai info' display?", options: ["Network statistics", "Wallet keys", "Token prices", "Docker images"], answer: 0, category: "General" },
    { id: 83, question: "What is stored in the /packages folder?", options: ["Python libs", "JS SDK (coming soon)", "Logs", "CLI tools"], answer: 1, category: "Structure" },
    { id: 84, question: "What is in /src?", options: ["Validator", "Desktop app", "Original monitor", "Rust compiler"], answer: 2, category: "Structure" },
    { id: 85, question: "Which skill is needed for core contribution?", options: ["Java", "Rust & Solana", "PHP", "Lua"], answer: 1, category: "Contributing" },
    { id: 86, question: "Which skill is needed for desktop app contribution?", options: ["Tauri & React", "Django", "Unity", "Flutter"], answer: 0, category: "Contributing" },
    { id: 87, question: "What does the MIT license allow?", options: ["Closed-source only", "Free usage and modification", "No redistribution", "Only academic use"], answer: 1, category: "Contributing" },
    { id: 88, question: "What is the primary design philosophy of Kawai?", options: ["Cloud-first", "Windows-native", "Mobile-first", "Enterprise-only"], answer: 1, category: "Philosophy" },
    { id: 89, question: "What does 'kawai deploy' do?", options: ["Runs tests", "Sends tokens", "Deploys Solana programs", "Installs tools"], answer: 2, category: "Commands" },
    { id: 90, question: "Can you specify a keypair during deployment?", options: ["No", "Only sometimes", "Yes", "Only on mainnet"], answer: 2, category: "Commands" },
    { id: 91, question: "Which environment is fastest in Kawai?", options: ["WSL", "Docker", "Native Windows", "Cloud"], answer: 2, category: "Performance" },
    { id: 92, question: "What does Kawai avoid using?", options: ["Rust", "Linux", "Git", "JSON"], answer: 1, category: "Philosophy" },
    { id: 93, question: "What makes Kawai unique compared to other Solana toolkits?", options: ["Mobile support", "Native Windows development", "NFT marketplace", "Token exchange"], answer: 1, category: "Philosophy" },
    { id: 94, question: "What is the purpose of kawai-wallet?", options: ["Token minting", "Wallet management", "Program testing", "UI rendering"], answer: 1, category: "Structure" },
    { id: 95, question: "What is the kawai-anchor crate for?", options: ["Desktop UI", "Anchor framework integration", "NFT minting", "Cloud syncing"], answer: 1, category: "Structure" },
    { id: 96, question: "What does kawai-rpc handle?", options: ["Rendering", "Blockchain communication", "Image storage", "Token burning"], answer: 1, category: "Structure" },
    { id: 97, question: "Which command shows toolchain status?", options: ["kawai toolchain status", "kawai toolchain list", "kawai toolchain show", "kawai status tools"], answer: 0, category: "Commands" },
    { id: 98, question: "What is the tone of Kawai branding?", options: ["Corporate", "Dark", "Cute and developer-friendly", "Military"], answer: 2, category: "Branding" },
    { id: 99, question: "What does Kawai help developers avoid?", options: ["Rust syntax", "Linux setups", "Programming", "Debugging"], answer: 1, category: "Philosophy" },
    { id: 100, question: "What is Kawai's ultimate mission?", options: ["Replace Solana", "Make Windows Solana development simple and native", "Build games only", "Create NFTs only"], answer: 1, category: "Philosophy" },
];

type GameState = 'wallet' | 'checking' | 'not-holding' | 'holding' | 'playing' | 'result';

const GamesApp: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('wallet');
    const [walletAddress, setWalletAddress] = useState('');
    const [tokenBalance, setTokenBalance] = useState(0);
    const [accountCount, setAccountCount] = useState(0);
    const [lastChecked, setLastChecked] = useState<string | null>(null);
    const [rpcUsed, setRpcUsed] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
    const [timeLeft, setTimeLeft] = useState(30);
    const [streak, setStreak] = useState(0);
    const [marketData, setMarketData] = useState<MarketData>({
        priceUsd: null,
        priceChange24h: null,
        volume24h: null,
        liquidityUsd: null,
        fdv: null,
        lastUpdated: null
    });
    const [priceHistory, setPriceHistory] = useState<number[]>([]);

    // Shuffle and pick 10 random questions
    const startGame = () => {
        const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
        setGameQuestions(shuffled);
        setCurrentQuestion(0);
        setScore(0);
        setStreak(0);
        setTimeLeft(30);
        setGameState('playing');
    };

    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return;
        if (timeLeft <= 0) {
            handleTimeout();
            return;
        }
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, gameState]);

    const handleTimeout = () => {
        setStreak(0);
        nextQuestion();
    };

    const validateWallet = (address: string) => {
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    };

    const parseTokenAmount = (tokenAmount: { amount: string; decimals: number; uiAmount: number | null; uiAmountString?: string }) => {
        if (tokenAmount.uiAmount !== null) return tokenAmount.uiAmount;
        if (tokenAmount.uiAmountString) return Number(tokenAmount.uiAmountString);
        const raw = tokenAmount.amount || '0';
        return Number(raw) / Math.pow(10, tokenAmount.decimals);
    };

    const fetchTokenAccountsByMint = async (endpoint: string) => {
        console.log(`[KAWAI] Fetching by mint from ${endpoint}`);
        const response = await fetch(endpoint, {
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
        console.log(`[KAWAI] By mint response:`, data);
        return data;
    };

    const fetchTokenAccountsByProgram = async (endpoint: string, programId: string) => {
        console.log(`[KAWAI] Fetching by program ${programId} from ${endpoint}`);
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getTokenAccountsByOwner',
                params: [
                    walletAddress,
                    { programId: programId },
                    { encoding: 'jsonParsed' }
                ]
            })
        });
        const data = await response.json();
        console.log(`[KAWAI] By program response:`, data);
        return data;
    };

    const checkWallet = async () => {
        if (!validateWallet(walletAddress)) {
            alert('Please enter a valid Solana wallet address');
            return;
        }

        setGameState('checking');
        console.log(`[KAWAI] Checking wallet: ${walletAddress}`);
        console.log(`[KAWAI] Looking for token: ${TOKEN_MINT}`);

        try {
            let allAccounts: any[] = [];
            let usedRpc: string | null = null;

            for (const endpoint of RPC_ENDPOINTS) {
                try {
                    console.log(`[KAWAI] Trying RPC: ${endpoint}`);
                    
                    // Method 1: Query by mint directly (most reliable)
                    const byMint = await fetchTokenAccountsByMint(endpoint);
                    
                    if (byMint?.result) {
                        usedRpc = endpoint;
                        const mintAccounts = byMint.result.value || [];
                        console.log(`[KAWAI] Found ${mintAccounts.length} accounts by mint`);
                        allAccounts.push(...mintAccounts);
                        
                        // Also try Token-2022 program for this mint
                        try {
                            const by2022 = await fetchTokenAccountsByProgram(endpoint, TOKEN_2022_PROGRAM_ID);
                            const accounts2022 = (by2022?.result?.value || []).filter((acc: any) => {
                                const mint = acc?.account?.data?.parsed?.info?.mint;
                                return mint === TOKEN_MINT;
                            });
                            console.log(`[KAWAI] Found ${accounts2022.length} Token-2022 accounts`);
                            allAccounts.push(...accounts2022);
                        } catch (e) {
                            console.log(`[KAWAI] Token-2022 query failed:`, e);
                        }
                        
                        break; // Success, stop trying other endpoints
                    } else if (byMint?.error) {
                        console.log(`[KAWAI] RPC error:`, byMint.error);
                    }
                } catch (e) {
                    console.log(`[KAWAI] Endpoint ${endpoint} failed:`, e);
                }
            }

            // Calculate total balance from all accounts
            let totalBalance = 0;
            for (const account of allAccounts) {
                const tokenAmount = account?.account?.data?.parsed?.info?.tokenAmount;
                if (tokenAmount) {
                    const amount = parseTokenAmount(tokenAmount);
                    console.log(`[KAWAI] Account balance: ${amount}`);
                    totalBalance += amount;
                }
            }

            console.log(`[KAWAI] Total balance: ${totalBalance}`);
            console.log(`[KAWAI] Required: ${REQUIRED_AMOUNT}`);
            console.log(`[KAWAI] Accounts found: ${allAccounts.length}`);
            console.log(`[KAWAI] RPC used: ${usedRpc}`);

            setAccountCount(allAccounts.length);
            setTokenBalance(totalBalance);
            setLastChecked(new Date().toLocaleTimeString());
            setRpcUsed(usedRpc ? new URL(usedRpc).hostname : null);

            if (totalBalance >= REQUIRED_AMOUNT) {
                setGameState('holding');
            } else {
                setGameState('not-holding');
            }
        } catch (error) {
            console.error('[KAWAI] Error checking wallet:', error);
            setTokenBalance(0);
            setAccountCount(0);
            setLastChecked(new Date().toLocaleTimeString());
            setRpcUsed('error');
            setGameState('not-holding');
        }
    };

    const handleAnswer = (answerIndex: number) => {
        if (selectedAnswer !== null) return;
        
        setSelectedAnswer(answerIndex);
        const correct = answerIndex === gameQuestions[currentQuestion].answer;
        
        if (correct) {
            const timeBonus = Math.floor(timeLeft / 3);
            const streakBonus = streak * 5;
            setScore(s => s + 10 + timeBonus + streakBonus);
            setStreak(s => s + 1);
        } else {
            setStreak(0);
        }

        setTimeout(() => nextQuestion(), 1500);
    };

    const nextQuestion = () => {
        if (currentQuestion + 1 >= gameQuestions.length) {
            setGameState('result');
        } else {
            setCurrentQuestion(c => c + 1);
            setSelectedAnswer(null);
            setTimeLeft(30);
        }
    };

    const formatAddress = (addr: string) => {
        if (addr.length < 8) return addr;
        return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    };

    const formatNumber = (num: number | null) => {
        if (num === null || Number.isNaN(num)) return '--';
        if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
        if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
        if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
        return num.toFixed(4);
    };

    const sparklinePoints = useMemo(() => {
        if (priceHistory.length === 0) return '';
        const min = Math.min(...priceHistory);
        const max = Math.max(...priceHistory);
        const range = max - min || 1;
        return priceHistory.map((p, i) => {
            const x = (i / (priceHistory.length - 1 || 1)) * 200;
            const y = 40 - ((p - min) / range) * 40;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');
    }, [priceHistory]);

    const fetchMarketData = async () => {
        try {
            const [priceRes, dexRes] = await Promise.allSettled([
                fetch(`https://price.jup.ag/v4/price?ids=${TOKEN_MINT}`),
                fetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKEN_MINT}`)
            ]);

            let priceUsd: number | null = null;
            let priceChange24h: number | null = null;
            let volume24h: number | null = null;
            let liquidityUsd: number | null = null;
            let fdv: number | null = null;

            if (priceRes.status === 'fulfilled') {
                const priceData = await priceRes.value.json();
                const jupPrice = priceData?.data?.[TOKEN_MINT]?.price;
                if (Number.isFinite(jupPrice)) priceUsd = Number(jupPrice);
            }

            if (dexRes.status === 'fulfilled') {
                const dexData = await dexRes.value.json();
                const pair = dexData?.pairs?.[0];
                if (pair) {
                    const dexPrice = Number(pair.priceUsd);
                    if (!priceUsd && Number.isFinite(dexPrice)) priceUsd = dexPrice;
                    priceChange24h = Number(pair.priceChange?.h24);
                    volume24h = Number(pair.volume?.h24);
                    liquidityUsd = Number(pair.liquidity?.usd);
                    fdv = Number(pair.fdv);
                }
            }

            const computedChange = priceHistory.length >= 2
                ? ((priceHistory[priceHistory.length - 1] - priceHistory[0]) / priceHistory[0]) * 100
                : null;

            setMarketData({
                priceUsd: Number.isFinite(priceUsd) ? priceUsd : null,
                priceChange24h: Number.isFinite(priceChange24h) ? priceChange24h : computedChange,
                volume24h: Number.isFinite(volume24h) ? volume24h : null,
                liquidityUsd: Number.isFinite(liquidityUsd) ? liquidityUsd : null,
                fdv: Number.isFinite(fdv) ? fdv : null,
                lastUpdated: new Date().toLocaleTimeString()
            });

            if (Number.isFinite(priceUsd)) {
                const safePrice = priceUsd as number;
                setPriceHistory(prev => {
                    const next = [...prev, safePrice];
                    return next.slice(-24);
                });
            }
        } catch (error) {
            console.error('Market data error:', error);
        }
    };

    useEffect(() => {
        fetchMarketData();
        const interval = setInterval(fetchMarketData, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="games-app">
            {/* Wallet Entry Screen */}
            {gameState === 'wallet' && (
                <div className="wallet-screen">
                    <div className="wallet-header">
                        <h1>🌸 Kawai Quiz Challenge</h1>
                        <p>Test your knowledge about Kawai and win rewards!</p>
                    </div>
                    
                    <div className="rules-box">
                        <h3>📜 Rules</h3>
                        <ul>
                            <li>🎯 Answer 10 random questions about Kawai</li>
                            <li>⏱️ 30 seconds per question</li>
                            <li>🔥 Build streaks for bonus points</li>
                            <li>🏆 Winners get % of all CRS!</li>
                        </ul>
                    </div>

                    <div className="market-panel">
                        <div className="market-header">
                            <h3>📈 KAWAI Live Market</h3>
                            <span className="market-updated">Updated: {marketData.lastUpdated ?? '--'}</span>
                        </div>
                        <div className="market-cards">
                            <div className="market-card">
                                <span className="label">Price</span>
                                <span className="value">${formatNumber(marketData.priceUsd)}</span>
                                <span className={`change ${marketData.priceChange24h !== null && marketData.priceChange24h < 0 ? 'down' : 'up'}`}>
                                    {marketData.priceChange24h === null ? '--' : `${marketData.priceChange24h.toFixed(2)}%`}
                                </span>
                            </div>
                            <div className="market-card">
                                <span className="label">Liquidity</span>
                                <span className="value">${formatNumber(marketData.liquidityUsd)}</span>
                            </div>
                            <div className="market-card">
                                <span className="label">Volume (24h)</span>
                                <span className="value">${formatNumber(marketData.volume24h)}</span>
                            </div>
                            <div className="market-card">
                                <span className="label">FDV</span>
                                <span className="value">${formatNumber(marketData.fdv)}</span>
                            </div>
                        </div>
                        <div className="sparkline">
                            <svg viewBox="0 0 200 40" preserveAspectRatio="none">
                                <polyline
                                    points={sparklinePoints}
                                    fill="none"
                                    stroke="#ff8fa3"
                                    strokeWidth="2"
                                />
                            </svg>
                            <div className="sparkline-label">Live price trend</div>
                        </div>
                    </div>

                    <div className="wallet-input-section">
                        <h3>💰 Enter Reward Wallet</h3>
                        <p className="requirement">Must hold at least <strong>1,000,000 $KAWAI</strong> to play</p>
                        
                        <input
                            type="text"
                            placeholder="Paste your Solana wallet address..."
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            className="wallet-input"
                        />
                        
                        <button className="verify-btn" onClick={checkWallet}>
                            Verify Wallet & Play 🚀
                        </button>

                        <div className="token-info">
                            <span>Token: </span>
                            <code>{TOKEN_MINT.slice(0, 8)}...{TOKEN_MINT.slice(-4)}</code>
                            <a
                                href={`https://pump.fun/coin/${TOKEN_MINT}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="token-link"
                            >
                                View on pump.fun →
                            </a>
                        </div>
                    </div>

                    <div className="fun-panel">
                        <div className="fun-card">
                            <h4>✨ Kawai Tip</h4>
                            <p>No WSL. No VM. No Linux. Just Windows.</p>
                        </div>
                        <div className="fun-card">
                            <h4>🎀 Daily Challenge</h4>
                            <p>Score 80+ to unlock the “Kawai Pro” badge!</p>
                        </div>
                        <div className="fun-card">
                            <h4>🧠 Fun Fact</h4>
                            <p>Kawai runs native Windows processes for faster builds.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Checking Wallet */}
            {gameState === 'checking' && (
                <div className="checking-screen">
                    <div className="spinner"></div>
                    <h2>Checking wallet...</h2>
                    <p>Verifying $KAWAI holdings</p>
                </div>
            )}

            {/* Not Holding Enough */}
            {gameState === 'not-holding' && (
                <div className="result-screen not-holding">
                    <img src="/icons/not-holding.png" alt="Not Holding" className="result-image" />
                    <h2>❌ Insufficient $KAWAI!</h2>
                    <p className="balance-text">Your balance: <strong>{tokenBalance.toLocaleString()} $KAWAI</strong></p>
                    <p>You need at least <strong>1,000,000 $KAWAI</strong> to play!</p>
                    <p className="meta-text">Token accounts found: {accountCount}</p>
                    <p className="meta-text">Last checked: {lastChecked ?? '--'}</p>
                    <p className="meta-text">RPC: {rpcUsed ?? '--'}</p>
                    
                    <div className="action-buttons">
                        <a 
                            href={`https://pump.fun/coin/${TOKEN_MINT}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="buy-btn"
                        >
                            🛒 Buy $KAWAI on pump.fun
                        </a>
                        <button className="back-btn" onClick={() => setGameState('wallet')}>
                            ← Try Another Wallet
                        </button>
                    </div>
                </div>
            )}

            {/* Holding - Ready to Play */}
            {gameState === 'holding' && (
                <div className="result-screen holding">
                    <img src="/icons/holding.png" alt="Holding" className="result-image" />
                    <h2>✅ Welcome, Kawai Holder!</h2>
                    <p className="balance-text">Your balance: <strong>{tokenBalance.toLocaleString()} $KAWAI</strong></p>
                    <p className="wallet-text">Rewards wallet: <strong>{formatAddress(walletAddress)}</strong></p>
                    <p className="meta-text">Token accounts found: {accountCount}</p>
                    <p className="meta-text">Last checked: {lastChecked ?? '--'}</p>
                    <p className="meta-text">RPC: {rpcUsed ?? '--'}</p>
                    <p className="ready-text">You're ready to play! 🎮</p>
                    
                    <button className="play-btn" onClick={startGame}>
                        Start Quiz! 🌸
                    </button>
                </div>
            )}

            {/* Playing the Quiz */}
            {gameState === 'playing' && gameQuestions.length > 0 && (
                <div className="quiz-screen">
                    <div className="quiz-header">
                        <div className="progress-info">
                            <span className="question-num">Question {currentQuestion + 1}/{gameQuestions.length}</span>
                            <span className="category-badge">{gameQuestions[currentQuestion].category}</span>
                        </div>
                        <div className="stats">
                            <span className="score">🏆 {score}</span>
                            {streak > 1 && <span className="streak">🔥 {streak}x streak!</span>}
                            <span className={`timer ${timeLeft <= 10 ? 'danger' : ''}`}>⏱️ {timeLeft}s</span>
                        </div>
                    </div>

                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${((currentQuestion + 1) / gameQuestions.length) * 100}%` }}></div>
                    </div>

                    <div className="question-card">
                        <h2>{gameQuestions[currentQuestion].question}</h2>
                    </div>

                    <div className="options-grid">
                        {gameQuestions[currentQuestion].options.map((option, index) => {
                            let className = 'option-btn';
                            if (selectedAnswer !== null) {
                                if (index === gameQuestions[currentQuestion].answer) {
                                    className += ' correct';
                                } else if (index === selectedAnswer) {
                                    className += ' wrong';
                                }
                            }
                            return (
                                <button
                                    key={index}
                                    className={className}
                                    onClick={() => handleAnswer(index)}
                                    disabled={selectedAnswer !== null}
                                >
                                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                                    <span className="option-text">{option}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Final Result */}
            {gameState === 'result' && (
                <div className="final-result">
                    <div className="result-content">
                        {score >= 80 ? (
                            <>
                                <img src="/icons/holding.png" alt="Winner" className="result-image" />
                                <h1>🏆 Amazing!</h1>
                                <p className="score-big">{score} points</p>
                                <p>You're a true Kawai expert! 🌸</p>
                            </>
                        ) : score >= 50 ? (
                            <>
                                <img src="/icons/milla.png" alt="Good" className="result-image" />
                                <h1>👏 Good Job!</h1>
                                <p className="score-big">{score} points</p>
                                <p>You know your Kawai! Keep learning! 📚</p>
                            </>
                        ) : (
                            <>
                                <img src="/icons/not-holding.png" alt="Try Again" className="result-image" />
                                <h1>📖 Keep Learning!</h1>
                                <p className="score-big">{score} points</p>
                                <p>Study up and try again! 💪</p>
                            </>
                        )}
                        
                        <div className="result-details">
                            <p>Correct answers: {Math.floor(score / 10)}/10</p>
                            <p>Reward wallet: {formatAddress(walletAddress)}</p>
                        </div>

                        <div className="result-actions">
                            <button className="play-again-btn" onClick={startGame}>
                                Play Again 🔄
                            </button>
                            <button className="back-btn" onClick={() => setGameState('wallet')}>
                                Change Wallet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GamesApp;

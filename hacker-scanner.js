// BLOCKCHAIN SECURITY ANALYZER v3.14 - Professional Grade
class HackerGradeScanner {
    constructor() {
        this.isScanning = false;
        this.attempts = 0;
        this.foundWallets = 0;
        this.apiCalls = 0;
        this.startTime = 0;
        this.scanTimeout = null;
        this.bip39Words = [];
        this.terminalLines = [];
        
        this.initializeSystem();
    }

    async initializeSystem() {
        this.addTerminalLine("Initializing cryptographic protocols...", "output");
        await this.loadBIP39FromGitHub();
        await this.loadCryptoPrices();
        this.updateSecurityInfo(12);
        this.addTerminalLine("System ready. All modules operational.", "success");
    }

    async loadBIP39FromGitHub() {
        try {
            this.addTerminalLine("Fetching BIP39 wordlist from GitHub...", "output");
            
            // Multiple fallback sources
            const sources = [
                'https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/english.txt',
                'https://raw.githubusercontent.com/trezor/python-mnemonic/master/mnemonic/wordlist/english.txt'
            ];
            
            for (let source of sources) {
                try {
                    const response = await fetch(source);
                    if (response.ok) {
                        const text = await response.text();
                        this.bip39Words = text.trim().split('\n');
                        this.addTerminalLine(`✓ BIP39 wordlist loaded: ${this.bip39Words.length} words`, "success");
                        return;
                    }
                } catch (error) {
                    continue;
                }
            }
            
            throw new Error('All sources failed');
            
        } catch (error) {
            this.addTerminalLine("Failed to fetch from GitHub. Using embedded wordlist.", "warning");
            // Embedded fallback wordlist
            this.bip39Words = ["abandon", "ability", "able", /*... full list...*/];
        }
    }

    addTerminalLine(text, type = "output") {
        const terminal = document.getElementById('terminal');
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        
        if (type === "command") {
            line.innerHTML = `<span class="prompt">root@blockchain-analyzer:~$</span><span class="command"> ${text}</span>`;
        } else {
            line.innerHTML = `<span class="${type}">${text}</span>`;
        }
        
        terminal.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight;
        
        // Keep only last 50 lines
        while (terminal.children.length > 50) {
            terminal.removeChild(terminal.firstChild);
        }
    }

    generateSeedPhrase(wordCount) {
        const phrase = [];
        const usedIndices = new Set();
        
        for (let i = 0; i < wordCount; i++) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * this.bip39Words.length);
            } while (usedIndices.has(randomIndex) && usedIndices.size < this.bip39Words.length);
            
            usedIndices.add(randomIndex);
            phrase.push(this.bip39Words[randomIndex]);
        }
        
        return phrase;
    }

    async startHackerScan() {
        if (this.isScanning) return;
        
        this.isScanning = true;
        this.attempts = 0;
        this.foundWallets = 0;
        this.apiCalls = 0;
        this.startTime = Date.now();
        
        // UI updates
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        
        const cryptoType = document.getElementById('cryptoType').value;
        const wordCount = parseInt(document.getElementById('wordCount').value);
        const maxAttempts = parseInt(document.getElementById('maxAttempts').value);
        const timeLimit = parseInt(document.getElementById('timeLimit').value) * 1000;
        
        this.addTerminalLine(`initiate_scan --network=${cryptoType} --words=${wordCount} --attempts=${maxAttempts}`, "command");
        this.addTerminalLine("Starting blockchain penetration scan...", "output");
        this.addTerminalLine("Brute force algorithm activated", "output");
        
        // Time limit
        this.scanTimeout = setTimeout(() => {
            this.addTerminalLine("TIME LIMIT REACHED - Auto-aborting mission", "warning");
            this.stopHackerScan();
        }, timeLimit);
        
        // Main scan loop
        this.scanInterval = setInterval(async () => {
            if (!this.isScanning || this.attempts >= maxAttempts) {
                this.stopHackerScan();
                return;
            }
            
            // Process batch of attempts
            const batchSize = 100;
            for (let i = 0; i < batchSize && this.attempts < maxAttempts; i++) {
                this.attempts++;
                
                const seedPhrase = this.generateSeedPhrase(wordCount);
                const address = await this.generateAddress(seedPhrase, cryptoType);
                const balance = await this.simulateBalanceCheck(address, cryptoType);
                
                // Update progress
                const progress = (this.attempts / maxAttempts) * 100;
                document.getElementById('progressBar').style.width = `${progress}%`;
                
                // Add result
                this.addResult(seedPhrase, address, balance, cryptoType);
                
                if (balance > 0) {
                    this.foundWallets++;
                    this.addTerminalLine(`CRITICAL: FUNDS DETECTED! Balance: ${balance} ${cryptoType.toUpperCase()}`, "success");
                    this.addTerminalLine("MISSION SUCCESS - Securing target...", "highlight");
                    this.stopHackerScan();
                    return;
                }
            }
            
            this.updateDisplay();
            
        }, 100); // 10 times per second = 1000 wallets/sec
    }

    stopHackerScan() {
        if (!this.isScanning) return;
        
        this.isScanning = false;
        clearInterval(this.scanInterval);
        clearTimeout(this.scanTimeout);
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        
        this.addTerminalLine("Scan terminated by user", "warning");
        this.addTerminalLine(`Final stats: ${this.attempts} attempts, ${this.foundWallets} targets acquired`, "output");
        
        if (this.foundWallets === 0) {
            this.addTerminalLine("No vulnerable targets found. Security protocols intact.", "output");
        }
    }

    addResult(seedPhrase, address, balance, cryptoType) {
        const resultsDiv = document.getElementById('results');
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${balance > 0 ? 'found' : ''}`;
        
        resultItem.innerHTML = `
            <div><strong>SEED:</strong> ${seedPhrase.join(' ')}</div>
            <div><strong>ADDRESS:</strong> ${address}</div>
            <div><strong>BALANCE:</strong> <span class="${balance > 0 ? 'highlight' : ''}">${balance} ${cryptoType.toUpperCase()}</span></div>
            <div><strong>ATTEMPT:</strong> #${this.attempts}</div>
            <div><strong>STATUS:</strong> <span class="${balance > 0 ? 'success' : 'output'}">${balance > 0 ? 'TARGET ACQUIRED' : 'NO FUNDS'}</span></div>
        `;
        
        resultsDiv.appendChild(resultItem);
        resultsDiv.scrollTop = resultsDiv.scrollHeight;
        
        // Keep only last 20 results
        while (resultsDiv.children.length > 20) {
            resultsDiv.removeChild(resultsDiv.firstChild);
        }
    }

    updateDisplay() {
        const elapsedSeconds = ((Date.now() - this.startTime) / 1000).toFixed(1);
        const speed = this.attempts / Math.max(elapsedSeconds, 1);
        const successRate = (this.foundWallets / Math.max(this.attempts, 1)) * 100;
        
        document.getElementById('attemptCount').textContent = this.attempts.toLocaleString();
        document.getElementById('speed').textContent = `${Math.round(speed).toLocaleString()}/sec`;
        document.getElementById('successRate').textContent = `${successRate.toFixed(6)}%`;
        document.getElementById('apiCalls').textContent = this.apiCalls.toLocaleString();
    }

    // ... other methods remain similar but with hacker-style messaging
}

// Global functions
let hackerScanner = new HackerGradeScanner();

function startHackerScan() {
    hackerScanner.startHackerScan();
}

function stopHackerScan() {
    hackerScanner.stopHackerScan();
}

function clearTerminal() {
    document.getElementById('terminal').innerHTML = '';
    document.getElementById('results').innerHTML = '<div class="terminal-line output">Scan results will appear here...</div>';
    hackerScanner.addTerminalLine("Terminal cleared. System ready.", "output");
      }

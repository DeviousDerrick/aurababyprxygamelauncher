"use strict";

// Game URL mappings
const GAME_URLS = {
    'yorg3': 'https://yorg3.io/',
    'stickman': 'https://poki.com/en/g/stickman-climb-3d',
    'vacation': 'https://virtualvacation.us/guess'
};

// Global variables
let scramjet = null;
let connection = null;
let isReady = false;

// Initialize Scramjet + BareMux
async function initScramjet() {
    try {
        console.log('🔧 Initializing Scramjet + BareMux...');
        
        // 1. Initialize Scramjet
        const { ScramjetController } = $scramjetLoadController();
        scramjet = new ScramjetController({
            files: {
                wasm: '/scram/scramjet.wasm.wasm',
                all: '/scram/scramjet.all.js',
                sync: '/scram/scramjet.sync.js',
            },
        });

        await scramjet.init();
        console.log('✅ Scramjet initialized');
        
        // 2. Load and initialize BareMux
        try {
            // Import BareMux module
            const BareMuxModule = await import('/baremux/index.mjs');
            
            if (BareMuxModule && BareMuxModule.BareMuxConnection) {
                // Create BareMux connection
                connection = new BareMuxModule.BareMuxConnection("/baremux/worker.js");
                console.log('✅ BareMux connection created');
                
                // Set up WISP transport
                const wispUrl = (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/wisp/";
                console.log('📡 WISP URL:', wispUrl);
                
                await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
                console.log('✅ BareMux transport configured');
            } else {
                console.warn('⚠️ BareMux not available, using pure Scramjet');
            }
        } catch (err) {
            console.warn('⚠️ BareMux initialization failed:', err);
            console.log('Continuing with pure Scramjet...');
        }
        
        isReady = true;
        console.log('✅ Ready to launch games!');

    } catch (error) {
        console.error('❌ Initialization error:', error);
        showStatus('Failed to initialize: ' + error.message, 'error');
    }
}

// Initialize when DOM loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScramjet);
} else {
    initScramjet();
}

// Add enter key support
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('custom-url');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                launchCustomUrl();
            }
        });
    }
});

function showStatus(message, type) {
    const statusEl = document.getElementById('statusMsg');
    if (!statusEl) return;
    
    statusEl.className = `status ${type}`;
    statusEl.style.display = 'block';
    
    if (type === 'loading') {
        statusEl.innerHTML = `<span class="spinner"></span>${message}`;
    } else {
        statusEl.textContent = message;
    }

    if (type !== 'loading') {
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 5000);
    }
}

async function launchGame(gameKey) {
    const url = GAME_URLS[gameKey];
    if (!url) {
        showStatus('Game not found!', 'error');
        return;
    }

    await loadGame(url);
}

async function launchCustomUrl() {
    const input = document.getElementById('custom-url');
    let url = input.value.trim();
    
    if (!url) {
        showStatus('Please enter a URL!', 'error');
        return;
    }

    // Auto-add https:// if not present
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    await loadGame(url);
}

async function loadGame(targetUrl) {
    try {
        if (!isReady || !scramjet) {
            showStatus('Still initializing... wait a moment', 'error');
            return;
        }

        showStatus('Registering service worker...', 'loading');

        // Register service worker
        try {
            await registerSW();
            console.log('✅ Service worker registered');
        } catch (err) {
            showStatus('Service worker failed!', 'error');
            console.error(err);
            return;
        }

        // Wait for service worker to activate
        await new Promise(resolve => setTimeout(resolve, 1500));

        showStatus('Launching game...', 'loading');

        // Add cache buster
        const gameUrl = new URL(targetUrl);
        gameUrl.searchParams.set('_t', Date.now());

        // Encode URL with Scramjet
        const encodedUrl = scramjet.encodeUrl(gameUrl.toString());

        console.log('🎮 Loading game:', targetUrl);
        console.log('🔗 Encoded URL:', encodedUrl);

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Show iframe and load game
        const frame = document.getElementById('sj-frame');
        const launcher = document.getElementById('launcher');
        
        frame.src = encodedUrl;
        frame.style.display = 'block';
        launcher.classList.add('hidden');

        console.log('✅ Game launched!');

    } catch (error) {
        console.error('❌ Launch error:', error);
        showStatus(`Error: ${error.message}`, 'error');
    }
}

// Make functions globally accessible
window.launchGame = launchGame;
window.launchCustomUrl = launchCustomUrl;

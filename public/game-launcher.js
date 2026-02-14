"use strict";

// Get game info from script tag data attributes
const scriptTag = document.currentScript;
const gameKey = scriptTag.getAttribute('data-game');
const gameUrl = scriptTag.getAttribute('data-url');

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
            const BareMuxModule = await import('/baremux/index.mjs');
            
            if (BareMuxModule && BareMuxModule.BareMuxConnection) {
                connection = new BareMuxModule.BareMuxConnection("/baremux/worker.js");
                console.log('✅ BareMux connection created');
                
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
        console.log('✅ Ready to launch game!');

    } catch (error) {
        console.error('❌ Initialization error:', error);
        showStatus('Failed to initialize: ' + error.message, 'error');
    }
}

// Initialize on page load
initScramjet();

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

async function launchGame() {
    try {
        if (!isReady || !scramjet) {
            showStatus('Still initializing... wait a moment', 'error');
            return;
        }

        if (!gameUrl) {
            showStatus('Game URL not configured!', 'error');
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

        // IMPORTANT: NO cache buster for progress saving!
        // Same URL = game can save/load progress via localStorage/cookies
        const encodedUrl = scramjet.encodeUrl(gameUrl);

        console.log('🎮 Loading game:', gameUrl);
        console.log('🔗 Encoded URL:', encodedUrl);
        console.log('💾 Progress saving enabled (consistent URL)');

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Show iframe and load game
        const frame = document.getElementById('game-frame');
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

// Make launchGame globally accessible
window.launchGame = launchGame;

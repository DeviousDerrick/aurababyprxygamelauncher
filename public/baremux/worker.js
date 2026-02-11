// BareMux worker stub - Disabled for Vercel
// This prevents SharedWorker errors

self.onconnect = function(e) {
  const port = e.ports[0];
  
  port.onmessage = function(event) {
    // Respond with null/empty to prevent retries
    port.postMessage({ error: 'BareMux disabled - static hosting' });
  };
  
  port.start();
  
  console.log('[BareMux Worker] Disabled (no backend available)');
};

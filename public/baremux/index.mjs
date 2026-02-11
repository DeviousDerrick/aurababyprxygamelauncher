// BareMux stub - Disabled for Vercel static hosting
// This prevents Scramjet from trying to use BareMux

export class BareMuxConnection {
  constructor() {
    console.log('[BareMux] Disabled (static hosting - no backend available)');
  }
  
  setTransport() {
    return Promise.resolve();
  }
  
  getTransport() {
    return null;
  }
}

export default {
  BareMuxConnection
};

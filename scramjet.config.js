// Scramjet configuration - DISABLE BareMux for Vercel
self.$scramjet = {
  codec: {
    encode: function(str) {
      return encodeURIComponent(str);
    },
    decode: function(str) {
      return decodeURIComponent(str);
    }
  },
  config: {
    prefix: '/scramjet/',
    files: {
      wasm: '/scram/scramjet.wasm.wasm',
      all: '/scram/scramjet.all.js',
      sync: '/scram/scramjet.sync.js',
      worker: '/scram/scramjet.worker.js',
      client: '/scram/scramjet.client.js',
      shared: '/scram/scramjet.shared.js',
      codecs: '/scram/scramjet.codecs.js',
    }
  }
};

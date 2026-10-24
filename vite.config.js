import {defineConfig} from 'vite';

export default defineConfig({
  // Prebundle the optional export worker on startup, so the first export in
  // development cannot trigger an optimizer reload and discard the session.
  optimizeDeps: {include: ['7z-wasm/7zz.es6.js']},
});

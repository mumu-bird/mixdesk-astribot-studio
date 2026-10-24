import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: `${here}ui`,
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    proxy: { '/api': process.env.DJ_MASTER_API_URL || 'http://127.0.0.1:8765' },
  },
  build: { outDir: `${here}ui/dist`, emptyOutDir: true },
});

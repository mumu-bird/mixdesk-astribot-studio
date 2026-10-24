import { defineConfig } from '@playwright/test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { existsSync } from 'node:fs';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = resolve(tmpdir(), `dj-master-e2e-${process.pid}`);
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:5174',
    viewport: { width: 1440, height: 1000 },
    launchOptions: {
      ...(existsSync(chrome) ? { executablePath: chrome } : {}),
      args: ['--autoplay-policy=no-user-gesture-required', '--disable-audio-output'],
    },
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: `DJ_MASTER_DATA_DIR="${dataDir}" python3 -m uvicorn src.main:app --host 127.0.0.1 --port 8766`,
      cwd: appRoot,
      url: 'http://127.0.0.1:8766/api/draft',
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command: 'DJ_MASTER_API_URL=http://127.0.0.1:8766 npm run dev -- --port 5174 --strictPort',
      cwd: appRoot,
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: false,
      timeout: 30000,
    },
  ],
});

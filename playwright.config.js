import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    viewport: { width: 1440, height: 1080 },
    launchOptions: {
      ...(existsSync(chrome) ? { executablePath: chrome } : {}),
      // Playwright's default --mute-audio also freezes AudioContext.currentTime
      // on headless Chrome. Keep the graph renderable without touching the
      // host speakers so transport and DSP tests observe a real audio clock.
      args: ['--autoplay-policy=no-user-gesture-required', '--disable-audio-output'],
    },
    screenshot: 'only-on-failure',
  },
  webServer: { command: 'npm run dev -- --port 5173 --strictPort', url: 'http://127.0.0.1:5173', reuseExistingServer: true },
});

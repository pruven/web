import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  use: {
    baseURL: process.env.TEST_URL || 'http://localhost:4321',
    headless: true,
  },
  webServer: {
    command: 'bun run preview --port 4321',
    url: process.env.TEST_URL || 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
});

import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  use: {
    baseURL: process.env.TEST_URL || 'http://localhost:4321',
    headless: true,
  },
  webServer: {
    command: 'node scripts/test-server.mjs',
    url: process.env.TEST_URL || 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
});

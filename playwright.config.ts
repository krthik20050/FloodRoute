import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: './e2e',
  outputDir:
    process.env.PLAYWRIGHT_STATIC_DEMO === '1' ? 'test-results/pages' : 'test-results/server',
  testMatch:
    process.env.PLAYWRIGHT_STATIC_DEMO === '1'
      ? 'pages.spec.ts'
      : ['workspace.spec.ts', 'usability.spec.ts'],
  timeout: 30000,
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: process.env.PLAYWRIGHT_CHANNEL || undefined },
    },
  ],
  webServer: {
    command: process.env.PLAYWRIGHT_SERVER_COMMAND || 'npm run dev',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120000,
  },
});

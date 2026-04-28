import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : 4,
  reporter: 'list',
  timeout: 120000,
  
  use: {
    trace: 'on-first-retry',
    headless: false, // Use headed mode to bypass Amazon bot detection
    actionTimeout: 60000, // Increased action timeout for Amazon
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage']
        }
      },
    },
  ],
});

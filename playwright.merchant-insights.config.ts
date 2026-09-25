import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'merchant-insights-charts.spec.ts',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4176',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'mobile-320', use: { viewport: { width: 320, height: 900 } } },
    { name: 'mobile-375', use: { viewport: { width: 375, height: 900 } } },
    { name: 'mobile-414', use: { viewport: { width: 414, height: 900 } } },
    { name: 'tablet-768', use: { viewport: { width: 768, height: 900 } } },
    { name: 'desktop-1024', use: { viewport: { width: 1024, height: 900 } } },
    { name: 'desktop-1440', use: { viewport: { width: 1440, height: 900 } } }
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4176 --strictPort',
    url: 'http://127.0.0.1:4176',
    reuseExistingServer: false,
    timeout: 120_000
  }
});

import {defineConfig,devices} from '@playwright/test';
// BASE_URL targets an already-running server (e.g. `wrangler pages dev dist` or a *.pages.dev deploy);
// without it, Playwright starts the Astro dev server.
const baseURL=process.env.BASE_URL||'http://127.0.0.1:4321';
export default defineConfig({
  testDir:'tests/e2e', timeout:30000,
  use:{baseURL,...devices['Desktop Chrome']},
  ...(process.env.BASE_URL?{}:{webServer:{command:'npm run dev -- --host 127.0.0.1',url:'http://127.0.0.1:4321',reuseExistingServer:!process.env.CI,timeout:120000}})
});

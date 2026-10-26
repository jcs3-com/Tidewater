import { defineConfig } from 'astro/config';
export default defineConfig({
  site: process.env.SITE_URL || 'https://tidewaterbid.com',
  output: 'static',
  trailingSlash: 'never',
  // Emit /pricing.html rather than /pricing/index.html. Cloudflare Pages serves
  // pricing.html at /pricing, which matches the slashless canonicals and links.
  build: { format: 'file' },
  vite: { define: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development') } }
});

import worker from './index.js';

// Pages Functions run on the Cloudflare Workers runtime. Keeping the routes
// same-origin avoids a second Worker deployment and cross-origin form setup.
export function handle(context) {
  const origin = new URL(context.request.url).origin;
  return worker.fetch(context.request, {
    ...context.env,
    SITE_URL: context.env.SITE_URL || origin,
    WORKER_URL: context.env.WORKER_URL || origin,
    ALLOWED_ORIGIN: context.env.ALLOWED_ORIGIN || origin
  });
}

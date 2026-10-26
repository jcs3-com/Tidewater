// The first v1 deployment published the repository root by mistake (README, docs,
// source files). Cloudflare can keep those responses in its edge cache for up to a
// week, so these paths are routed through Functions (see public/_routes.json) and
// answered here with an uncacheable 410 instead of any cached copy.
// Never list a path the built site serves (/assets, /scripts, /_astro, /bids, ...).
const RETIRED = /^\/(?:README\.md|LAUNCH_CHECKLIST\.md|package(?:-lock)?\.json|\.env\.example|\.gitignore|astro\.config\.mjs|tsconfig\.json|playwright\.config\.mjs)$|^\/(?:src|worker|docs|seed|tests|\.github|functions|public)(?:\/|$)/;

export async function onRequest(context) {
  const {pathname} = new URL(context.request.url);
  if (RETIRED.test(pathname)) {
    return new Response('Gone', {
      status: 410,
      headers: {'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex'}
    });
  }
  return context.next();
}

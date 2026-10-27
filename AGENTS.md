# Tidewater development guide

## Existing project and source of truth

Continue this repository; do not rebuild it or replace its hosting. GitHub `jcs3-com/Tidewater` is the source of truth. The v2 design is already implemented and published. Older Drive candidate archives and handoffs predate newer domain, email, market and bid-listing changes; never apply them over current main without reviewing the diff.

## Business positioning

Tidewater is a bid desk for DMV hospitality and service operators, with government bidding as the sole primary offer. Food waste is a separate project, currently labeled Tidewater Food Waste pending naming, linked quietly from the footer to `/restaurant-advisory` with its own enquiry form. Supported categories are catering, concessions, janitorial, security and event services. Preserve the current market labels in `src/lib/config.ts`, including the Charleston, SC area.

Preserve approved page copy and pricing: $250–$500 for bids under $100k; $1,500–$3,000 for $100k–$1m; larger engagements and implementation are quoted retainers. No contingent fees, award guarantees, fabricated clients, results, credentials, addresses or government affiliation. Keep unresolved facts marked `[[TODO: ...]]`. The project brief is context, not evidence of legal formation or program eligibility. Preserve the footer disclosures. Verify agency information before publishing real bids; never invent values or due times. Keep SAMPLE records conspicuously fictional and out of production.

Contact comes first, browsing opportunities second. Keep readiness inside `/becoming-a-contractor`, with the existing `/readiness` tool intact. Homepage order: bid-desk introduction, scope/audience, engagement process, current opportunities, contact. Newsletter belongs on Insights; regional editorial imagery belongs on About. Preserve the approved palette, typography and cartographic treatment.

## Architecture

- Astro 5 static site, TypeScript, Node 22 deployment runtime; package-lock.json is authoritative.
- `src/pages/`: home, bid desk, pricing, restaurant advisory, board, readiness, insights, about/contact, legal, newsletter result pages, bid details, category-by-jurisdiction pages, sitemap, robots and release marker.
- `src/layouts/Base.astro`: shared metadata, navigation, theme, footer and disclosures. `src/components/`: reusable forms, bid cards and calls to action. `src/styles/global.css`: shared responsive design tokens and styles.
- `src/lib/rfps.ts`: build-time Airtable read, pagination, normalization, publication checks and optional sample fallback. Invalid configured reads fail the build rather than silently publishing stale data. Static listings update only on rebuild.
- `public/scripts/`: browser form handling, filtering, readiness scoring and landscape motion. `score.js` is also imported by the server; preserve consistent scoring.
- `functions/api/` and `functions/health.js` delegate through `worker/src/pages-handler.js` to `worker/src/index.js`. Same-origin Pages Functions are production's default API; the standalone Worker is optional.
- Runtime code validates submissions, writes Prospects and Matches, and manages newsletter confirmation/unsubscribe. Preserve consent, honeypot, optional Turnstile, CORS, token hashing and truthful failed-delivery states with email fallback.
- `functions/_middleware.js` and `public/_routes.json` retire source paths accidentally served by v1. Preserve these routes and the static asset exclusions.
- `src/data/release.ts` derives the build SHA from Cloudflare, GitHub or Git; `/release.json` and the homepage meta tag identify the deployed source.

## Visual direction

Premium advisory-firm restraint inspired by Carlyle and Verlaine Capital's hierarchy and pacing, without copying their assets, logos or claims. Preserve oyster-shell `#F5F5F0`, slate `#243943`, marine `#294B5A`, mist surfaces, generous spacing, quiet rules, and locally hosted Cormorant Garamond / DM Sans typography.

The existing panoramic Chesapeake hero uses licensed aerial still photography with subtle CSS motion, an opaque oyster-shell headline panel and a primary contact CTA with browsing opportunities secondary. It is not video footage. Retain the Swan Island secondary aerial, blue-gray treatment and original decorative estuary contours. Genuine footage remains an optional enhancement only when a suitable licensed asset is available; preserve responsive posters, silent playback, a pause control, reduced-motion support and page performance if adding it. Do not claim decorative contours are navigational maps.

Record asset provenance and licenses in `docs/asset-register.md` and public credits. Preserve self-hosted responsive images, alt text, dimensions, lazy loading below the fold, visible keyboard focus, mobile navigation and dark mode. See `docs/TIDEWATER_SITE_DESIGN_SYSTEM.md` for detailed tokens.

## Development conventions and verification

Use focused changes, existing components and the locked dependencies. Keep routes and business behavior intact. Never commit environment files, credentials or customer data. On Windows use a local NTFS checkout for Git and npm; a streamed Drive mount can fail package extraction and Git index writes. Use `fileURLToPath` when converting file URLs to filesystem paths.

1. Run `npm ci --no-audit --no-fund` and `npm run check` (Worker tests, contrast, copy guard and Astro diagnostics).
2. Build with `DEMO_SEED=0 SITE_INDEXABLE=0 NEWSLETTER_ENABLED=0 npm run build`. In PowerShell set each variable using `$env:NAME='0'` before running the command. This validates an empty board without credentials; it does not prove production Airtable access.
3. Use `npx wrangler pages dev dist --port 8788` for production-output tests, then `BASE_URL=http://127.0.0.1:8788 DEMO_SEED=0 npm run test:e2e` in another terminal. Install Playwright Chromium if needed. Astro dev alone does not implement Pages Functions or the retired-path middleware, so it cannot pass the entire integration suite.
4. Check desktop/mobile widths 360, 390, 768 and 1440; light/dark axe audits, keyboard menu, readiness, board filters/sample separation, failed-form fallback, motion controls, missing-image readability, canonical URLs and launch gates. Mock form delivery during browser checks; do not send unsolicited production leads or emails.

## Deployment and integration readiness

Use existing Cloudflare Pages project `tidewater`, connected to `main`. Production URLs: https://tidewaterbid.com and https://tidewater-6ik.pages.dev. Build command `npm run build`, output `dist`, Node 22. Do not publish the repository root or create a replacement project. Pages Functions deploy with the site; no separate Worker deployment is required.

Push a reviewed feature branch, open a PR, check the Pages preview, and merge after required checks pass when deployment is authorized. Verify the production `/release.json` SHA and homepage `tidewater-commit` against the actual merged commit. A successful local build or PR preview is not production evidence. Record actual validation and deployment status in the release log.

Keep production `DEMO_SEED=0`, `SITE_URL=https://tidewaterbid.com` and `PUBLIC_API_URL` blank for same-origin APIs. Preserve `SITE_INDEXABLE=0` and `NEWSLETTER_ENABLED=0` until launch requirements are explicitly satisfied. Do not reset existing hosted credentials merely because local credentials are absent.

Airtable stays ready through the existing Prospects/RFPs/Matches schema documented in README. Build needs a restricted read token; runtime needs the appropriate read/write token and base ID. Keep `AIRTABLE_PAT` server-side, never `PUBLIC_`. Credentials and actual delivery verification are separate from a visual release. Newsletter activation also requires verified Resend sender, mailing address and HMAC secret; receive-only email forwarding does not satisfy sending configuration.

`.github/workflows/daily-rebuild.yml` refreshes listings and deploys to the same Pages project; scheduled runs require `DAILY_REBUILD=1` and configured Airtable/Cloudflare secrets. Manual dispatch always attempts the job. Keep GitHub build variables aligned with Pages. Never deploy a local credential-free empty board over a populated production board; use the configured Git integration.

Drive release synchronization is opt-in (`DRIVE_SYNC_ENABLED=1`) and requires Google OAuth configuration. Leave it disabled unless configured; GitHub remains authoritative. `docs/DRIVE_SYNC.md` describes secret-free release archives. Keep historical QA clearly dated and do not present old results as new measurements.

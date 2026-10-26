# Tidewater release log

## Blue-gray photographic treatment — 2026-10-26

Updated both homepage photographs to muted blue-gray monochrome at the user's request. The shared CSS removes original hues and adds a restrained cool tint, retaining local image files, responsive sources, motion controls and attribution. Desktop/mobile preview and build verification accompany the updated candidate archive. Publication remains subject to the GitHub write-access blocker described below; this update is not claimed live.

## 2.0.0 candidate — 2026-10-26

**Status: implemented locally; publication blocked by GitHub write authorization. Not deployed.**

- Repository: https://github.com/jcs3-com/Tidewater
- Baseline branch: `main`, commit `c8dbde3138d2722ecf1e4fd2f1f01dcb914018e4`.
- Candidate branch: `feat/tidewater-v2`. The exact final candidate SHA is recorded in the generated `release-manifest.json` and Git bundle; no remote commit or PR URL is claimed before publication.
- Production URL inspected: https://tidewater-6ik.pages.dev/
- v2 deployed SHA: **none**. The existing baseline Cloudflare Pages check reports success; this is not proof of a v2 deployment.

### Changes

Panoramic Chesapeake tidal-marsh hero and oyster-shell headline banner; gray-blue/mist/slate palette; locally hosted serif/sans typography; restrained editorial practice/approach layouts; secondary Swan Island aerial; original decorative estuary contour backgrounds; shared interior styling and status/form refinements. Responsive image variants, static fallbacks, reduced motion and pause/resume control. Keyboard mobile navigation, direct-email form fallback, public attribution page, canonical default and release commit marker.

Astro, all existing public routes, readiness quiz, bid board/filtering/sample labels, pricing, API/Worker/Pages Functions, Airtable interfaces and legal disclosures preserved. Indexing and newsletter gates are still off. Airtable production credentials remain pending and have not been invented.

### Validation

- `npm ci` completed. `npm run check`: 9 Worker/readiness/validation/CORS/lead/opt-in/unsubscribe tests; copy guard; all 27 enumerated color pairs at WCAG AA; Astro diagnostics 0 errors/warnings/hints.
- Production build with `DEMO_SEED=0 SITE_INDEXABLE=0 NEWSLETTER_ENABLED=0` succeeded; sample detail routes excluded.
- Playwright covers 360, 390, 768 and 1440px across home, bid desk, open bids, pricing, restaurant advisory, readiness, about, insights, contact, privacy, terms and category/jurisdiction routes. No horizontal overflow.
- axe WCAG 2 A/AA and 2.1 A/AA audits on 13 primary routes in light desktop and dark mobile modes: zero violations after correcting the new wordmark's accessible name.
- Browser coverage includes quiz scoring, menu/keyboard/Escape focus restoration, local imagery, pause/reduced motion, broken-image readability, failed-delivery data retention/email fallback, noindex/robots/newsletter gates, source marker and screenshots.
- Production output also tested under local `wrangler pages dev` with Pages Functions and absent production credentials. Detailed final runs are recorded in the accompanying QA evidence/receipt.
- Mobile Lighthouse (local production home): performance **97**, accessibility **100**, best practices **100**, SEO **69** with the intentional noindex gate; LCP 2.1s and CLS 0. See `QA_REPORT.md`.
- Automated accessibility checks and local browser emulation do not constitute a full manual assistive-technology audit or physical-device test. Live v2 checks cannot pass until v2 is published.

### Publication blocker

`git push --dry-run origin feat/tidewater-v2` returned `Permission to jcs3-com/Tidewater.git denied ... HTTP 403`. The GitHub connector's branch-create operation also returned `403 Resource not accessible by integration`. Repository role metadata reports push capability for the owner, but the connected integration's effective authorization denies writes. Actions secrets and variables listing is also forbidden. A supported Cloudflare plugin search found no connection; no Cloudflare runtime credentials are configured. These are access blockers, not Airtable or design/build blockers.

### Archive and synchronization

The existing Drive folder and both supplied references were read successfully using the connected Drive account. Candidate documents, verified asset/license records and a secret-free versioned source snapshot are prepared for the existing folder. Confirm actual uploaded IDs/bytes in the companion Drive receipt; preparation alone does not mean synchronization succeeded. Automated release-to-Drive workflow is safely opt-in and is **not active or installed remotely**. Required OAuth client ID, client secret and offline refresh token are documented in `DRIVE_SYNC.md`.

### Remaining operational gates

Restore GitHub Contents/Workflows write access and publish/verify the candidate. Configure Airtable restricted production tokens and verify actual lead delivery/records. Complete legal/address/bio/engagement approval; configure email/Turnstile as appropriate. Keep `SITE_INDEXABLE=0` and `NEWSLETTER_ENABLED=0` until the original launch requirements are satisfied. Production Lighthouse, live source marker, sitemap/OG and end-to-end operational data checks remain pending where they depend on deployment or credentials.

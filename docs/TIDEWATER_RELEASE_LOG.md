# Tidewater release log

## Custom domain — 2026-10-26

`tidewaterbid.com` was registered through Cloudflare Registrar (Cloudflare nameservers). Repository defaults, release tests, the source-archive manifest and the opt-in Drive workflow now use it as the canonical origin. Production canonical URLs keep following the Cloudflare Pages `SITE_URL` variable, which remains `https://tidewater-6ik.pages.dev` until the domain is attached to the Pages project and serving HTTPS; then switch the variable and redeploy. Release verification still reads `https://tidewater-6ik.pages.dev/release.json`, which always serves the production deployment. Email Routing is enabled for the domain and the site's public contact is `hello@tidewaterbid.com`; no personal email address is published on the site or in repository docs.

## Production verification — 2026-10-26 11:41–11:45 ET

**v2.0.0 is live on Cloudflare Pages production.** Verified against the live site, not a local build or preview.

- PR: https://github.com/jcs3-com/Tidewater/pull/1, merged to `main` as merge commit `8a1d728d8af5a510798825faa0b4ec539f78163d` (candidate commit `18020133c30b93cdc453ebf17d9a444d08d6a35a` plus doc-status commit `7430b2217076e92eb5533337987faae3df49dc84`).
- Source: `Tidewater-v2.0.0-dfb247d099f5ec7ddb57df522a502250fe026297.zip` from the established Drive folder, SHA-256 `9189b7b4bdec4082d1626b7b6320da781eff743ef74f10b7078fa42c839b475f`, applied unchanged on baseline `c8dbde3`. A fresh commit was created from the archive, so the published SHAs differ from `dfb247d`.
- Cloudflare Pages check on `8a1d728`: **success**, deployment `4129016b` (https://4129016b.tidewater-6ik.pages.dev). PR preview `ca8ecee4` on `7430b22` also succeeded.
- Live `https://tidewater-6ik.pages.dev/release.json` returned `{"version":"2.0.0","commit":"8a1d728d8af5a510798825faa0b4ec539f78163d"}`; the homepage `tidewater-commit` meta tag matched.
- Live Playwright run (`BASE_URL=https://tidewater-6ik.pages.dev DEMO_SEED=0`): **19/19 passed**, including axe WCAG 2.1 A/AA on 13 routes (light desktop, dark mobile), 360/390/768/1440px overflow, keyboard navigation, motion pause/reduced motion, failed-image readability, failed-delivery fallback and launch gates.
- Launch gates confirmed live: `noindex, nofollow` meta, robots.txt `Disallow: /`, newsletter signups closed, SAMPLE detail URL 404.
- Release-to-Drive workflow ran on the merge and was **skipped** (`DRIVE_SYNC_ENABLED` unset). No automatic or manual Drive upload was made in this publication.
- Known residue: Cloudflare's edge cache still returned raw repository files (for example `/README.md`) from the earlier misconfigured v1 deployment for a short period after release. The v2 deployment does not contain them (cache-bypassed requests return 404). The repository is public, so no non-public content is involved.
- Not verified: Airtable writes from live forms. `AIRTABLE_PAT` is not yet configured, so contact/quiz submissions return 503 by design and the bid board shows no live bids.

Later commits that only change documentation also redeploy and update `/release.json`; the live marker is always the authoritative deployed SHA.

## Blue-gray photographic treatment — 2026-10-26

Updated both homepage photographs to muted blue-gray monochrome at the user's request. The shared CSS removes original hues and adds a restrained cool tint, retaining local image files, responsive sources, motion controls and attribution. Desktop/mobile preview and build verification accompany the updated candidate archive. Publication remains subject to the GitHub write-access blocker described below; this update is not claimed live.

## 2.0.0 candidate — 2026-10-26

**Status: published via [PR #1](https://github.com/jcs3-com/Tidewater/pull/1) to `main`; production verification is recorded under "Production verification" below.** The earlier publication blocker is retained below as history.

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

### Publication blocker (resolved 2026-10-26)

Resolved: a later session pushed `feat/tidewater-v2` and opened/merged PR #1 with the same repository. Original report: `git push --dry-run origin feat/tidewater-v2` returned `Permission to jcs3-com/Tidewater.git denied ... HTTP 403`. The GitHub connector's branch-create operation also returned `403 Resource not accessible by integration`. Repository role metadata reports push capability for the owner, but the connected integration's effective authorization denies writes. Actions secrets and variables listing is also forbidden. A supported Cloudflare plugin search found no connection; no Cloudflare runtime credentials are configured. These are access blockers, not Airtable or design/build blockers.

### Archive and synchronization

The existing Drive folder and both supplied references were read successfully using the connected Drive account. Candidate documents, verified asset/license records and a secret-free versioned source snapshot are prepared for the existing folder. Confirm actual uploaded IDs/bytes in the companion Drive receipt; preparation alone does not mean synchronization succeeded. Automated release-to-Drive workflow is now installed in the repository through PR #1 but remains **inactive**: it is skipped unless repository variable `DRIVE_SYNC_ENABLED=1`, which is not set, and its Google OAuth secrets are not configured. Required OAuth client ID, client secret and offline refresh token are documented in `DRIVE_SYNC.md`.

### Remaining operational gates

Configure Airtable restricted production tokens and verify actual lead delivery/records. Complete legal/address/bio/engagement approval; configure email/Turnstile as appropriate. Keep `SITE_INDEXABLE=0` and `NEWSLETTER_ENABLED=0` until the original launch requirements are satisfied. Production Lighthouse, live source marker, sitemap/OG and end-to-end operational data checks remain pending where they depend on deployment or credentials.

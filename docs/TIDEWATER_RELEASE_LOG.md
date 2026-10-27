# Tidewater release log

## v3.1.0 Homepage restructure around two practices — 2026-10-27

**Live in production, verified ~03:10 ET.** [PR #9](https://github.com/jcs3-com/Tidewater/pull/9) merged as `b5e190cd25d23a92acaba7afc80706ec1c7a7456`; the Pages production build succeeded and `/release.json` reported `3.1.0` / `b5e190c…`. Live checks: all practice routes returned 200; the homepage nav lists The Bid Desk, The Restaurant Advisory, About (+ mobile Contact); the topline reads Virginia; the homepage has no bid list. `/bids` shows "Our RFP process" before "Current open bids" with 6 live bid cards. `/restaurant-advisory` shows 5 stages and 4 live funding cards ("8 open of 14 tracked", Airtable source).

Owner direction: the hero should cover both practices; remove the "Who we help" block and the homepage bid board; the split panels route to each practice's landing page, which explains its process and then lists open opportunities; nav becomes The Bid Desk, The Restaurant Advisory, About (Contact stays as the header button); Northern Virginia becomes Virginia on the homepage; remove the hero buttons.

- Homepage: hero (inclusive intro, no buttons, "DC / Maryland / Virginia") → split panels → contact CTA. "Who we help", "What you receive", the four-phase approach and the bid board were removed from the homepage.
- `/bids`: the Opportunity → Proposal → Award → Implementation flow and its four phases moved here as "Our RFP process", followed by up to six current open bids and a link to the full board. The existing who/what/your part/FAQ/basics content follows.
- `/restaurant-advisory`: the five-stage process (shared with the food-waste page through `src/data/restaurant-process.ts`, so the copy cannot drift), followed by up to four Open/Upcoming funding cards (shared `FundingCard` component) with a link to the full desk.
- Nav: three items, with section-aware `aria-current`. The header Contact button is now visible at every desktop width (it was previously hidden below 1200px) and appears as the last mobile-menu item. The footer adds Open bids and Funding desk.
- Bid-desk pages still say Northern Virginia where they describe the bid markets (Fairfax, Arlington, Alexandria, Loudoun).

Validation: `npm run check` (0 diagnostics); production-oriented build; 25/25 Playwright tests against `wrangler pages dev dist`, including the new Bid Desk landing-order test, the restaurant landing test (5 stages, funding list, nav current state), the mobile menu with Contact, and light/dark axe across routes.

## Production verification, v3.0.0 — 2026-10-27 ~02:50 ET

**v3.0.0 is live on Cloudflare Pages production**, verified against the live site.

- Owner approved deployment and the dual-practice headline "Find the opportunity. Realize the value." (contact-first hero actions kept). [PR #8](https://github.com/jcs3-com/Tidewater/pull/8) merged to `main` as `d0cdf5851f7980344a40e921e0c1c3d29dab150b` (branch head `6a61a3e`).
- The Cloudflare Pages production build succeeded. `https://tidewaterbid.com/release.json`, `https://tidewater-6ik.pages.dev/release.json` and the homepage `tidewater-commit` meta tag all reported `3.0.0` / `d0cdf58…`.
- Live routes returned 200: `/`, `/bids`, `/open-bids`, `/pricing`, `/restaurant-advisory`, `/restaurant-advisory/food-waste`, `/restaurant-advisory/funding`, `/readiness`, `/becoming-a-contractor`, `/contact`, `/credits`, `/health`, `/sitemap.xml`, `/robots.txt`. `noindex` was still present (launch gate unchanged). The open-bid board was still populated (11 cards).
- The funding desk built from **Airtable**, not the snapshot (no snapshot notice). 14 Approved records published, each with an official https source and a 2026-10-27 verified date. No listing with a past deadline showed Open. The Draft Charlottesville CDBG record was excluded. Ten of the 14 records were added to Airtable after the v3 branch review; their content was not independently re-verified in this session.
- The food-waste page at `/restaurant-advisory/food-waste` carries the current copy: "Waste less. Give more back.", all five stages, and the `food-waste-project` form source.
- No leads or newsletter messages were sent. Pages environment variables and credentials were not changed.

## v3.0.0 Restaurant Advisory and funding desk — 2026-10-27 (branch preparation)

Source: owner-supplied `Tidewater_v3_Claude_Overlay.zip` (`docs/V3_HANDOFF.md`), packaged from a Drive mirror that predates main commits `46cc049` (bid-desk focus), `7854407` (bid-card due dates), `c241d13` (food-waste repositioning) and `561f33a` (homepage flow). Applied as a three-way merge against base `b0b1d57` on branch `feature/tidewater-3-restaurant-advisory`, not as a file replacement. Wherever main had changed since the snapshot, main's newer copy was kept.

- New `/restaurant-advisory` hub (overlay copy; food-waste panel aligned to current page). Main's current food-waste page moved unchanged in substance to `/restaurant-advisory/food-waste`, keeping its enquiry form and `food-waste-project` source.
- New `/restaurant-advisory/funding` directory with build-time `src/lib/funding.ts` (Airtable `Funding Opportunities`, `Publication Status=Approved` gate, expired deadlines retired at build and in the browser, configured-but-failing read fails the build) and a 4-record editorial snapshot used only without `AIRTABLE_PAT`.
- Homepage keeps the contact-first hero, Opportunity → Proposal → Award → Implementation flow and bid board; adds the overlay's two-practice image panels. Nav adds Restaurant advisory and Funding and keeps Pricing and Contact; Insights moves to the footer. Footer adds Bid pricing, Insights, Tidewater Food Waste and the grant-funding disclaimer; the removed tagline stays removed.
- The overlay's hotlinked Pexels image was not shipped. Two owner-supplied photographs are self-hosted instead; the owner confirmed on 2026-10-27 that the rights are their own (recorded in `docs/asset-register.md` and `/credits`).
- Sitemap includes both restaurant subroutes and keeps `/becoming-a-contractor` (the overlay's sitemap had dropped it).

Validation (local Linux container, Node 22): `npm ci`; `npm run check` (backend tests, contrast, copy guard, 0 Astro errors/warnings/hints); `DEMO_SEED=0 SITE_INDEXABLE=0 NEWSLETTER_ENABLED=0 npm run build`; 24/24 Playwright tests against `wrangler pages dev dist`, including light/dark axe on all primary routes plus the two new restaurant routes, four widths with no horizontal scroll, and new hub/funding tests (official https source and verified date on every card, region filter, no expired deadline shown as Open). The Airtable schema and live records were checked through the Airtable connector: field names match the loader; 4 Approved records will publish and the Charlottesville Draft will not. The loader was exercised with mocked Airtable pagination and a 403. AFID Fall 2026 terms (closes Oct 30, 2026; $50,000 maximum; equal locality cash match, reduced for distressed localities) were re-checked against VDACS's spring 2026 release and a secondary listing. The VDACS program page itself could not be fetched from this environment. No leads or emails were sent. Nothing was merged or deployed. The owner reports the production `AIRTABLE_PAT` is unchanged; Airtable tokens are scoped to a base rather than to tables, so the existing build token should be able to read `Funding Opportunities`. The first production build is the proof: if it cannot read the table, the build fails and the current site stays up.

## Government bid desk focus — 2026-10-27

User direction: government bidding is the primary offer; contact comes first, browsing opportunities second. Preserve the palette, typography, aerial imagery and decorative cartography. Reordered the homepage into bid-desk introduction, audience/scope, process, current listings and contact. Removed the competing restaurant-practice pitch, readiness quiz promotion and newsletter panel from the home flow. Regional editorial imagery moved to About; gated newsletter remains on Insights.

Food waste remains accessible at `/restaurant-advisory` through a quiet footer link, with its own enquiry form using the existing contact handler and a distinct source value. `Tidewater Food Waste` is a working label pending naming. Added `/becoming-a-contractor` as an interior starting point linking to the preserved `/readiness` quiz. Contact now leads the header, service/pricing and market-page calls to action. Existing routes, bids, pricing, Airtable/API behavior, disclosures and launch gates remain intact.

Validated with backend tests, contrast and copy checks, zero Astro diagnostics, production-oriented build, and 22 Playwright tests against local Cloudflare Pages. Coverage includes the new contact/contractor/food-waste path, four responsive widths and light/dark axe audits; desktop visual review also completed. No real leads or newsletter messages sent. Production publication is verified separately against the resulting merged commit.

## Development takeover and verification — 2026-10-26

Inspected current `main` at `869e5bf3b50679f554da4bf88e5ef8fb8bd5285b`; both production domains returned that SHA. The v2 redesign was already published, so the older Drive candidate was not reapplied. Existing visuals, routes, business copy, integrations and Cloudflare deployment configuration are preserved.

Added root `AGENTS.md` with architecture, business positioning and constraints, visual direction, development conventions, credential boundaries and deployment verification. Corrected obsolete README setup/design/A-B-test statements and the completed Pages setup checklist item. Fixed file-URL conversion in copy checking and release archiving for Windows; release archives now include `AGENTS.md`.

Validation in a local Windows checkout: `npm ci`; `npm run check` (9 backend tests, 27 contrast pairs, copy guard, zero Astro errors/warnings/hints); production-oriented build with samples/indexing/newsletter disabled (59 pages); all 21 Playwright tests against `wrangler pages dev`, including light/dark axe, four responsive widths, keyboard navigation, readiness, media fallbacks and Pages middleware. `npm run release:archive` succeeded and archive contents included the new guide. Browser form-delivery failures were mocked; no live leads or newsletter messages were sent. Airtable runtime writes and credential configuration were not verified or changed.

This entry records preparation and local verification; the resulting PR, merged commit and production marker must be checked before describing this update as deployed. The photographs remain licensed animated stills, not video footage.

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

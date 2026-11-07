# Tidewater release log

## Academy: January 9 Food Funding Workshop — 2026-11-07

**Live in production, verified 2026-11-07 by Claude.** [PR #38](https://github.com/jcs3-com/Tidewater/pull/38) squash-merged as `a8981d9`; live `/release.json` and the `/academy` `tidewater-commit` both report `a8981d9…`.

Owner decision (2026-11-07): publish the first workshop — Saturday, January 9, 2027, 2:30–4:30 p.m., La Cosecha (1280 4th St NE); free, RSVP required, 50 seats; RSVP through the site form.

- `/academy`: workshop listing and RSVP form; Fundamentals and Fellowship stay labeled planned.
- RSVPs post to `/api/lead` as `kind=contact`, `source=workshop-2027-01-09` (lands in Airtable Prospects). No worker or allow-list change.
- `LeadForm`: optional `submitLabel` prop; existing forms unchanged.

Checks: `npm run check` (0 errors); `DEMO_SEED=0` build (75 pages); Playwright 32/32 locally; Cloudflare Pages check passed. Production smoke: `/academy` serves the listing, address and RSVP form.

Rollback: `git revert a8981d9` on `main` and merge.

## Quote-link checkout removed; www→apex redirect — 2026-11-06

**Live in production, verified 2026-11-06 by Claude.** [PR #36](https://github.com/jcs3-com/Tidewater/pull/36) squash-merged as `a78bc8a`; live `/release.json` and the homepage `tidewater-commit` both report `a78bc8a…`.

Owner decision (2026-11-06): quoted, retainer and other engagements are invoiced by hand in Stripe. `HMAC_SECRET` was never set in production, so signed quote links could not have worked.

- Removed `signQuote`, the quote-token branch of `/api/checkout`, `/engage` and `engage.js`; `/engage` 301s to `/pricing`. Listing checkout and `/api/stripe-webhook` unchanged.
- Cloudflare zone redirect rule (outside the repo): `www.tidewaterbid.com/*` 301s to `https://tidewaterbid.com/*`, path and query kept.
- Search Console: domain verified by DNS TXT (added 2026-11-05).

Checks: `npm run check` (19/19 unit); `DEMO_SEED=0` build; Playwright 32/32 locally; Cloudflare Pages check passed. Production smoke: `/engage` 301 → `/pricing`; `/api/checkout` with a quote token 400, with an unknown listing id 404; `/`, `/pricing`, `/bids`, `/funding-directory`, `/engagement-received` 200; `www` 301 → apex.

Rollback: `git revert a78bc8a` on `main` and merge; delete the zone redirect rule "www to apex (tidewaterbid.com)".

## Stale rules and guardrails dropped — 2026-11-05

**Live in production, verified 2026-11-05 by Claude.** [PR #34](https://github.com/jcs3-com/Tidewater/pull/34) squash-merged as `6b340a0`; live `/release.json` and the homepage `tidewater-commit` both report `6b340a0…`.

Owner decisions (2026-11-05): XcelHR is no constraint on this project; motion allowed; funding records are vetted upstream and publish as-is; Funding Services retainer from $2,500/month.

- AGENTS.md / README: removed entity-unconfirmed, re-verification, fixed tool/project counts, reserved-concept limits, legal-page and Airtable-schema approval, no-new-project, board-PNG, retired tagline/prices, placeholder and motion rules.
- Funding records no longer flip to Unverified after 45 days; expired deadlines still show Closed.
- Copy guard and tests trimmed to match.

Checks: `npm run check` (19/19 unit); `DEMO_SEED=0` build; Playwright 32/32 locally; Cloudflare Pages check passed. Production smoke: `/funding-directory` 200, 14 records (7 Open, 3 Monitoring, 4 Closed).

Rollback: `git revert 6b340a0` on `main` and merge.

## Public indexing on; checkout live — 2026-11-05

**Live in production, verified 2026-11-05 by Claude.** Owner set `CHECKOUT_ENABLED=1` (live Stripe keys) and `SITE_INDEXABLE=1` in Cloudflare Pages.

- [PR #29](https://github.com/jcs3-com/Tidewater/pull/29) removed schools from site copy and the Opportunity Finder (owner decision); #31 dropped the related copy guard.
- [PR #32](https://github.com/jcs3-com/Tidewater/pull/32) (`2550b6b`) fixed `flag()`: Astro coerces `1` to a number, so build launch flags could never turn on.
- Production smoke: robots.txt `Allow: /` with sitemap; no `noindex` on public pages (`/engage` keeps its own); sitemap 83 URLs; `/api/checkout` returns a live-mode Stripe session.
- No completed purchase recorded yet (no Secured listing, no `bid_purchase` Prospect).

Rollback: set `SITE_INDEXABLE=0` / `CHECKOUT_ENABLED=0` in Pages and redeploy.

## Terms of Service, Support page, Stripe products — 2026-11-05

**Live in production, verified 2026-11-05 by Claude.** [PR #25](https://github.com/jcs3-com/Tidewater/pull/25) (`38f20b4`) and [PR #26](https://github.com/jcs3-com/Tidewater/pull/26) (`1ae05fc`) squash-merged; live `/release.json` and the homepage `tidewater-commit` both report `1ae05fc…`.

Owner decisions (2026-11-05): Tidewater operates as a sole-proprietor DBA; the owner's legal name is not shown as the business entity anywhere on the site.

- **/terms** is now Terms of Service: bid purchases, advisory, payments, refunds (`/terms#refunds`), confidentiality, liability, DC law. **/support** added and linked in the footer and sitemap.
- Footer reads "Tidewater is an independent consultancy based in Washington, DC." Tidewater Advisory LLC and `legalName` removed; copy guard blocks the legal name in the footer and legal pages. Privacy lists Stripe.
- Checkout bills to Stripe products from runtime `STRIPE_PRODUCT_TIER1` / `STRIPE_PRODUCT_TIER2`; webhook handles `checkout.session.async_payment_succeeded` for ACH.

Checks: `npm run check` 20/20 on merged `main`; Playwright 33/33 locally for #25; Cloudflare Pages checks passed. Production smoke: `/support`, `/terms`, `/privacy` 200 with no legal name; refund anchor present; noindex present; `/api/checkout` 503.

Still off: `CHECKOUT_ENABLED=0`.

Rollback: `git revert 1ae05fc 38f20b4` on `main` and merge.

## Listing checkout and badges — 2026-11-05

**Live in production, verified 2026-11-05 by Claude.** [PR #23](https://github.com/jcs3-com/Tidewater/pull/23) squash-merged as `da3d6f64d78d8fb9dffd49f9d266ca3678ebbc0e`; live `/release.json` and the homepage `tidewater-commit` meta tag both report `da3d6f6…`.

Owner decisions applied (2026-11-05): sell one bid straight from a listing at the existing tiers ($1,250 under $100,000; $2,500 at $100,000+); no availability check before checkout, duplicates resolved by hand; checkout page shows only the opportunity, "We prepare and submit your proposal.", the price and a Terms link; delivery-contingent fee stated in Terms.

- **Checkout:** `/api/checkout` accepts a listing id, reads the RFP from Airtable and prices it server-side (blank Est. Value = $1,250). Excluded, closed and past-due listings refused. Operator-signed quote path unchanged.
- **Webhook:** `/api/stripe-webhook` verifies `STRIPE_WEBHOOK_SECRET`, sets `Listing Badge` = Secured, records the buyer in Prospects (`Lead Type` bid_purchase), calls `PAGES_DEPLOY_HOOK`.
- **Badges:** Airtable `Listing Badge` field added (Secured, Featured, Top Pick, Excluded). Featured pins first; Top pick and Featured stay for sale; Secured and Excluded ("Not offered") hide the buy button.
- **Terms:** "Bid purchases" section added; effective date November 5, 2026.

Checks: `npm run check` passed (20/20 unit); `DEMO_SEED=0` build; Playwright 33/33 against local `wrangler pages dev`; Cloudflare Pages PR check passed. Production smoke: noindex present, `/api/checkout` 503 (checkout off), `/api/stripe-webhook` 503 (not configured), Terms section live, 5 open listings show "Bid on this with Tidewater — $1,250" and a checkout block.

Still off: `CHECKOUT_ENABLED=0`. Before enabling: Stripe account in the LLC's name; `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAGES_DEPLOY_HOOK` in Pages; entity formation and engagement terms.

Rollback: `git revert da3d6f6` on `main` and merge; confirm `/release.json` reports the revert commit.

## v4.1 Funding-first — 2026-11-02

**Live in production, verified 2026-11-02 by Claude.** [PR #20](https://github.com/jcs3-com/Tidewater/pull/20) squash-merged as `e892671bd0706344992e48b901dc9087616d5d48`; live `/release.json` reports `4.1.0` / `e892671…` and the homepage `tidewater-commit` meta tag matches.

Owner decisions applied (2026-11-02): funding-first positioning; tagline "Funding opportunity at the source." everywhere; photo motion retired; Bid Desk keeps its 2026-11-01 wording and $1,250 / $2,500 tiers; privacy and terms rewritten short and moved to footer small print; business address 1708 A St SE, Washington, DC 20003 published.

- **New routes:** `/funding-directory`, `/funding-services`, `/projects`, `/resources`, `/tools`, `/academy`, `/fundamentals`, `/fellowship`, `/ethics`, `/careers`. Nav: Funding Finder · Funding Services · Resources · About · Bid Desk.
- **Finder/intake:** school, nonprofit, farm, market/distributor and Other organization types, accepted by `/api/lead` (worker test added).
- **Consolidation:** `/restaurant-advisory/funding` 301 → `/funding-directory`; DMV/National programs stay visible under state filters.
- **Brand:** regenerated `og-default.png`, collateral and structured data carry the new tagline; copy guard blocks the retired tagline and public `[[TODO]]` placeholders.
- **Fixes to the Drive package:** `tools.astro` frontmatter (build failure); overlay script overwrote its own Finder edit; light-on-light contrast on `/funding-directory` and `/projects`.

Checks: `npm run check` passed (18/18 unit); `DEMO_SEED=0` build; Playwright 33/33 against local `wrangler pages dev`; Cloudflare Pages PR check passed. Production Playwright run: 32/33 on first pass — one transient 500 on `/funding-services` during edge rollout, then 15/15 direct requests returned 200 and the rerun passed. Production smoke: noindex present, `/api/checkout` 503, 14 Airtable funding records live, retired tagline absent.

Rollback: `git revert e892671` on `main` and merge; confirm `/release.json` reports version `3.3.0` and the revert commit.

## Bid Desk audience broadened — 2026-11-01

**Live in production, verified 2026-11-01 by Claude.** [PR #18](https://github.com/jcs3-com/Tidewater/pull/18) squash-merged as `f3a88353a6c296e958c824f89e38096684b1a39b`; live `/release.json` and the homepage `tidewater-commit` meta tag both report `f3a8835…`.

Owner decision: the Bid Desk serves any firm pursuing government (B2G) contracts, not only hospitality, janitorial and event-service operators.

- **Copy:** default and home meta, home hero and Bid Desk card, `/bids` "Who it's for" (now "Firms ready to sell to government." with first-time bidders, growing contractors and solicitation-in-hand panels), finder path blurb, readiness and becoming-a-contractor meta.
- **Finder/readiness:** "Something else" service option; unlisted services get a hand-matching message instead of category bid matches. `categories` in `config.ts` unchanged, so county landing pages and Airtable categories are untouched.
- **Fix:** finder results no longer render a stray "null" or stringified elements (`replaceChildren` now receives a flattened, filtered list).

Checks: `npm run check` passed; `DEMO_SEED=0` build; Playwright 31/31 against local `wrangler pages dev`; Cloudflare Pages PR check passed; production `/bids` and `/opportunity-finder` serve the new copy.

Rollback: `git revert f3a8835` on `main` and merge; confirm `/release.json`.

## v3.3.0 Simplification — 2026-10-28

**Live in production, verified 2026-10-28 ~13:35 ET by Claude.** [PR #16](https://github.com/jcs3-com/Tidewater/pull/16) squash-merged as `75885ad3737cb2bc5252b82a41d083ed2a385f96`; live `/release.json` reported `3.3.0` / `75885ad…`.

Owner decisions applied: newsletter deleted, checkout scaffold kept dormant, county landing pages kept, `/open-bids` folded into `/bids`.

- **Site:** `/bids` carries the full filterable board (5 verified open at deploy, plus closed/awarded history); `/open-bids` → `/bids` 301. Newsletter forms, result pages, `/api/confirm`, `/api/unsubscribe` and Resend code removed; old newsletter URLs 301 to `/`. 66 pages (was 70).
- **Infra removed:** standalone Worker config, never-run daily-rebuild and Drive-sync workflows and scripts, manual `site:deploy`.
- **Docs:** README is the single operating doc; AGENTS.md holds rules only. Removed LAUNCH_CHECKLIST, V3_HANDOFF, QA_REPORT, DRIVE_SYNC and the v2 design-system doc. Net −746 lines across 39 files.

Production checks: Playwright against `https://tidewaterbid.com` 31/31; `/open-bids` 301; `/api/confirm` 404; `kind=newsletter` 400; scripted lead POST 403; checkout 503; robots disallow all.

Rollback: `git revert 75885ad` on `main` and merge; confirm `/release.json`.

## v3.2.1 Lead-intake spam gates and region-scoped finder fallback — 2026-10-28

**Live in production, verified 2026-10-28 ~13:06 ET by Claude.** [PR #14](https://github.com/jcs3-com/Tidewater/pull/14) squash-merged as `a3f62a7fa9163188941db16a7bd505a0795c7136`; `/release.json` on `tidewaterbid.com` reported `3.2.1` / `a3f62a7…`, matching the homepage `tidewater-commit` meta tag. Preceded by docs-only [PR #13](https://github.com/jcs3-com/Tidewater/pull/13) (`f851c8d`, verified live), which makes Claude the operator of record.

Takeover reconciliation: before this release, live `/release.json` reported `dbecd1e` (docs-only PR #12 on top of the reported v3.2.0 merge `b52cf30`), equal to `main`. The abandoned Codex transition left no branches, PRs or commits.

- **Intake:** `/api/lead` rejects POSTs with neither a same-origin `Origin` nor `Referer` (403); previously requests without `Origin` skipped the CORS check. Contact messages with two or more vendor-pitch signals receive a neutral 200 and are not stored (both 2026-10-28 SEO-agency submissions are caught by test fixtures). Free text with more than two links is refused with an explicit message. Turnstile remains opt-in pending owner-provisioned keys.
- **Finder:** the "other areas" bid fallback is scoped to the visitor's market `region` (`dmv`, `charleston`) from `src/lib/config.ts`; DMV leads no longer see Charleston, SC work by default.
- **Data (Airtable, not code):** Montgomery County RFP 1196087 (due 2026-10-28, closing time not verifiable this session) set Closed; two SEO-spam Prospects relabelled `Lead Type=spam`.

Production checks after deployment:
- Playwright against `https://tidewaterbid.com`: **31/31 passed** (2.7 min).
- Live data: 5 Open sourced bids, 14 approved funding records.
- Scripted lead POST → 403; labelled same-origin QA contact → 201, Airtable `recQoblHFrS3tO8UN`.
- `/api/checkout` 503; `robots.txt` disallows all; homepage `noindex`; `$1,250` / `$2,500` on `/pricing`, no retired prices.
- Not fixed (needs zone access): `www.tidewaterbid.com` still serves 200 rather than 301 to the apex.
- Pages preview builds lack the production Airtable token and render 0 bids / snapshot funding; production data checks must be run on production.

### Validation (local production output under `wrangler pages dev`)

- `npm run check`: 20 unit tests (4 new: origin/referer gate, vendor-pitch drop, link cap, region-scoped fallback), contrast, copy guard, Astro 0 errors.
- `DEMO_SEED=0 SITE_INDEXABLE=0 NEWSLETTER_ENABLED=0 npm run build`: 70 pages. Playwright 31/31.

Rollback: revert the PR #14 squash commit on `main` (`git revert a3f62a7`) and merge; the Pages Git integration redeploys and `/release.json` should report the revert commit.

## v3.2.0 Approved brand, Bid Desk pricing and free Opportunity Finder — 2026-10-28

**Live in production, verified 2026-10-28 ~10:25 ET.** [PR #11](https://github.com/jcs3-com/Tidewater/pull/11) squash-merged as `b52cf30129c83ad3af1bf178cee9515307261877`. The Cloudflare Pages production build deployed it; `/release.json` on `tidewaterbid.com`, `www.tidewaterbid.com` and `tidewater-6ik.pages.dev` all reported `3.2.0` / `b52cf30…`, matching the homepage `tidewater-commit` meta tag. This documentation follow-up lands in a separate commit; the live marker then reports that commit.

Production checks after deployment:
- Playwright against `https://tidewaterbid.com`: **31/31 passed** (2.6 min), including axe WCAG 2.1 A/AA light and dark on 17 routes, no horizontal overflow at 360/390/768/1440px, the $99,999 / $100,000 tier boundary, no retired prices on any rendered route, finder flows and checkout gate.
- Live data in the finder at deploy: 6 Open, officially sourced bids; 14 approved funding records, 8 open.
- Live intake: labelled QA records written by production `/api/lead` — contact `recDScntVbM5OlTxI`, finder Bid Desk path `recoU7q4LuGGKEaRq` (readiness 88), finder restaurant path `recFA9I9uAtPPHhek` plus `Restaurant Projects` Lead `recYrWXztrZU37YyM`. The runtime Airtable secret is therefore configured.
- `/api/checkout` returns 503 (disabled); `/robots.txt` disallows all; every page carries `noindex, nofollow`; sitemap lists `/opportunity-finder` on the apex.
- The PR preview environment builds without `DEMO_SEED=0` (it renders the three SAMPLE bids). Production is unaffected; align the Pages preview variables if previews are used for QA.

Source of truth: the founder's "Approved Brand + P0–P2 Deployment" package (2026-10-28), the Drive master brand board and `BID_DESK_PRICING_POLICY.md` v1.1, and the Airtable Offer Catalog.

- **Brand:** engraved-oyster lockup in header and footer (light/dark), tagline "Read the current. Find the opportunity." as the homepage and finder H1 and footer line, palette tokens from the board (shell, deep tide, estuary, mist, oyster, dark ink; marsh swatch for accents), Cormorant italic added, supplied favicon and contour texture, new apple-touch icon, default social card and recoloured per-bid cards. Reverse panels now use dark ink, matching the board's dark lockup.
- **Pricing:** Single Bid Architecture $1,250 under $100,000; Tier II $2,500 at $100,000 and above; custom quotes never below the tier. One shared module (`public/scripts/pricing.js`) drives the pricing page, tier checker, structured data (`Offer` 1250/2500), Bid Desk page, finder results, gated checkout and tests. Retired $250–$500, $1,500–$3,000 and $295 references removed; Bid Desk scope copy now matches the policy (architecture, not a full drafted proposal; drafting and submission support quoted separately). Inclusions, exclusions, revisions (one consolidated round, founder to confirm), client responsibilities and turnaround are on `/pricing`.
- **Opportunity Finder** (`/opportunity-finder`): Bid Desk path (category, services, area, capacity, registrations, insurance, bonding, contact preference) returns the shared readiness score and gaps plus Open, officially sourced bids in the same category/area, with the applicable fee tier when a value is published. Restaurant path (location incl. Charlottesville/Central Virginia, business type, owner/tenant, interests) returns approved Funding Opportunities labelled grant / rebate or incentive / tax incentive / financing / sponsor-required / unverified, with owner-only cautions for tenants. Expired deadlines and records verified more than 45 days ago are never shown as open, re-checked in the browser. Honest empty states. Submissions use the existing `/api/lead` (kinds `quiz` and new `restaurant_finder`, validated server-side) and a best-effort `Restaurant Projects` Lead row. Newsletter consent remains a separate checkbox that only renders when `NEWSLETTER_ENABLED=1`.
- **P2:** `/api/checkout` and `/engage` behind `CHECKOUT_ENABLED` (unset): 503 by default; when enabled, only an operator-signed, unexpired quote token is accepted and the amount comes from the server tier table. Privacy-friendly conversion events (`finder_start`, `finder_result`, `paid_inquiry`, `tier_check`, `checkout_start`, `lead`) fire only if Plausible is configured. Branded proposal template and email signature in `docs/collateral/`.
- **Unchanged:** Astro/Pages Functions architecture, Airtable schema, routes, retired-path 410s, honeypot/consent/CORS/Turnstile handling, `SITE_INDEXABLE=0`, `NEWSLETTER_ENABLED=0`.

### Validation (local production output under `wrangler pages dev`)

- `npm run check`: 16 unit tests (incl. $99,999 / $100,000 boundary, retired-price scan, finder status rules, restaurant intake validation, checkout gating), contrast (all text pairs ≥4.5:1, field borders ≥3:1), copy guard, Astro 0 errors/warnings.
- `DEMO_SEED=0 SITE_INDEXABLE=0 NEWSLETTER_ENABLED=0 npm run build`: 70 pages.
- Playwright: 31/31 passed, including 360/390/768/1440px no-overflow on 17 routes, axe WCAG 2.1 A/AA light and dark on 17 routes, keyboard nav, reduced motion, broken-image readability, failed-form data retention, brand/pricing/finder/checkout specs.

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

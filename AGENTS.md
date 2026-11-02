# Tidewater — rules for changing this repo

How the system works is in [README.md](README.md). This file is what must stay true.

## Authority

- GitHub `jcs3-com/Tidewater` (`main`) is the only source of code. Cloudflare Pages project `tidewater` is the only host. Airtable base `app5wO7MKQ92y16f1` is the system of record for leads and opportunities. Do not rebuild the site, fork the repo, create another Pages project, or apply Drive archives over `main`.
- Claude is the operating partner and deployment agent (owner handoff, 2026-10-28; the Codex transition was abandoned and merged nothing). Ship routine, reversible fixes and already-approved copy after checks, then verify production.
- **Owner approval before merge** for anything that changes: offer prices, contract/refund terms, indexing or public launch, payments, promotional mail, production secrets, Airtable schema, paid subscriptions, or public legal claims (including the privacy and terms pages). Never change repository visibility to connect a tool.
- Report as changed / verified / blocked / next; label claims Known, Reported or Pending Verification.

## Business rules

- **Funding-first (v4.1, owner decision 2026-11-02).** Tidewater leads with funding: grant research, eligibility review, applications and grant/project management for hospitality-adjacent organizations in DC, Maryland and Virginia (restaurants, caterers, food producers, schools, nonprofits, farms, markets and distributors). The Bid Desk is a secondary service for any firm pursuing government contracts; keep its 2026-11-01 audience wording. Tidewater advises and manages projects; it does not collect, haul, compost or dispose of waste.
- Site architecture. Primary nav, in order: Funding Finder (`/funding-directory`), Funding Services (`/funding-services`), Resources (`/resources`), About (`/about`), Bid Desk (`/bids`); header CTA Contact (`/contact`). Supporting routes: `/projects` (five illustrative scenarios), `/tools` (exactly five planned tools, all Coming soon, no working controls), `/academy`, `/fundamentals`, `/fellowship` (reserved concepts: no enrollment, pricing or applications), `/ethics`, `/careers` (`career@tidewaterbid.com`), `/opportunity-finder` (live), `/restaurant-advisory` and `/restaurant-advisory/food-waste`, plus the Bid Desk routes (`/bids`, `/pricing`, `/readiness`, `/becoming-a-contractor`, `/insights`, `/contracts/*`). `/restaurant-advisory/funding` 301s to `/funding-directory`; do not recreate a second funding directory.
- Never present illustrative projects as clients, awards or case studies. No partner or logo gallery until a permissioned first client exists. Never imply a tool, course or program is available before it is.
- Bid Desk pricing (policy v1.1, 2026-10-28) lives only in `public/scripts/pricing.js`: $1,250 under $100,000; $2,500 at $100,000 and above (exactly $100,000 is Tier II); custom quotes never below the tier. No paid Bid Desk offer under $1,250; the retired $295, $250–$500 and $1,500–$3,000 prices must never return (tests enforce this). These tiers do not apply to Restaurant Advisory.
- No contingent or success fees, award guarantees, fabricated clients, results, credentials, addresses or government affiliation. Never publish placeholders: leave unknown facts off the page and track them in Airtable Launch Execution (the copy guard fails on `[[TODO` in pages). Preserve the footer disclosures. Published business address (owner-approved): 1708 A St SE, Washington, DC 20003.
- Legal pages (`/privacy`, `/terms`) are short, plain and reachable only from the small print in the footer. Owner approved the 2026-11-02 versions; any later change to them still needs owner approval.
- Tagline, verbatim: "Funding opportunity at the source." Used as the homepage H1, footer line, structured-data slogan and social image. The retired "Read the current. Find the opportunity." must not appear in site source (copy guard enforces).

## Opportunity curation

- Quality over count. An RFP is `Open` only when the official URL resolves and the due date and closing time come from the notice or latest addendum. On the due date, close it once the cutoff passes; if the cutoff cannot be confirmed, close it.
- Geography must fit DMV operators or an explicitly supported market. Each jurisdiction in `src/lib/config.ts` carries a `region`; finder fallbacks stay in the visitor's region. Keep the Charleston, SC market (owner decision).
- Funding publishes only when Approved, with an `https` official source and Last Verified date. Label exactly: grant, rebate/incentive, tax incentive, loan/financing, sponsor-required (e.g. AFID Infrastructure applicants are localities), or unverified lead. Dedupe utility programs only after reading both official pages.
- Never invent values, deadlines, addenda or award data. SAMPLE records stay fictional and out of production (`DEMO_SEED=0`).
- Listings change only on rebuild. After a material Airtable change, trigger a deploy.

## Code rules

- Keep the same-origin Pages Function path. `/api/lead` must keep: consent, honeypot, optional Turnstile, the same-origin Origin/Referer gate, the two-link cap and the vendor-pitch drop (`isVendorPitch`), all covered by `tests/worker.test.mjs`. Never put `AIRTABLE_PAT` or any secret in a `PUBLIC_` variable, the repo or Drive.
- `score.js` and `finder-logic.js` run in both browser and server; keep them dependency-free.
- Every Opportunity Finder choice must be in the matching allow-list in `worker/src/index.js` (`RESTAURANT`), or `/api/lead` rejects it with 422. Change both together and extend `tests/worker.test.mjs`.
- `/api/checkout` stays 503 unless runtime `CHECKOUT_ENABLED=1` and Stripe are set, and then only accepts an operator-signed quote token priced from the server tier table.
- Launch flags `SITE_INDEXABLE` and `CHECKOUT_ENABLED` stay `0` until the owner approves; a code or visual deploy never flips them.

## Visual rules

- The Drive master brand board (`Tidewater-Approved-Coastal-Brand-Board.png`) is the visual authority. Tokens live in `src/styles/global.css`: deep tide `#2E4B5B`, estuary `#6B8A96`, mist `#B7C4C7`, oyster `#D8CBB8`, shell `#F7F5EF`, dark ink `#243943`, marsh `#849288` (accents only). Cormorant Garamond for display and wordmark; DM Sans for everything else; both self-hosted.
- Restrained, institutional, editorial coastal cartography, not nautical souvenir. Still aerial photography only: no photo motion, parallax or animated imagery (removed in v4.1); never the board PNG as a background. Record every image's license in `docs/asset-register.md`. Regenerate `og-default.png` with `scripts/brand/render-brand-assets.mjs` whenever the tagline or lockup changes.
- Keep accessibility: alt text, visible focus, keyboard menu, dark mode, no horizontal scroll at 360px, and axe-clean light and dark on every primary route (add new routes to the test route lists). Light surfaces (cards, panels) inside `.reverse` sections need a reverse-specific style.

## Release procedure

1. Branch from `main`; make the smallest coherent change.
2. `npm ci && npm run check && DEMO_SEED=0 npm run build`, then `npm run preview` and `BASE_URL=http://127.0.0.1:8788 DEMO_SEED=0 npm run test:e2e`. Mock form delivery in browser tests; never send unsolicited production leads.
3. Open a PR; wait for the Cloudflare Pages check. Previews lack the production Airtable token, so they show an empty board.
4. Merge (squash). Production is verified only when live `/release.json` and the homepage `tidewater-commit` equal the merged SHA. Smoke-test the gates; if a real intake check is needed, send one record labelled `QA TEST - not a lead`.
5. Add a dated entry to `docs/TIDEWATER_RELEASE_LOG.md` and a receipt in Drive 37.01. Update Airtable Launch Execution only on real evidence.

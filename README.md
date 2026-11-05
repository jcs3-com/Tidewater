# Tidewater

Website for **Tidewater**, a trade name of Tidewater Advisory LLC. Tagline: *Funding opportunity at the source.* The site leads with funding (directory, research, applications and grant management for hospitality-adjacent organizations in DC, Maryland and Virginia); the Bid Desk is a secondary service for firms pursuing government contracts. Production: https://tidewaterbid.com. Rules for anyone changing this repo: [AGENTS.md](AGENTS.md).

## Architecture

```
Airtable (RFPs, Funding Opportunities)  --build-time read-->  Astro static site  --> Cloudflare Pages
Browser forms  --POST /api/lead-->  Pages Function  --> Airtable (Prospects, Matches, Restaurant Projects)
```

- **Site:** Astro 5, static output in `dist/`. Listings are baked in at build time, so they change only when the site rebuilds.
- **Backend:** one Pages Function, `/api/lead` (`functions/api/lead.js` → `worker/src/index.js`). It validates input, blocks scripted and vendor-pitch submissions, writes the lead to Airtable and suggests matches. `/api/checkout` exists but returns 503 until `CHECKOUT_ENABLED=1` (P2, owner-gated).
- **Deploy:** the Cloudflare Pages project `tidewater` builds every push to `main` (`npm run build`, output `dist`, Node 22). There is no other deploy path.
- **Release marker:** `/release.json` and the homepage `tidewater-commit` meta tag report the deployed commit. A release is verified only when the live marker equals the merged commit.

## Key files

| Path | What it does |
| --- | --- |
| `src/pages/` | Funding: home, `/funding-directory`, `/funding-services`, `/projects`, `/resources`, `/tools`, `/academy`, `/fundamentals`, `/fellowship`, `/opportunity-finder`, `/restaurant-advisory` + `/food-waste`. Company: `/about`, `/ethics`, `/careers`, `/contact`. Bid Desk: `/bids` (process + bid board), `/pricing`, `/readiness`, `/becoming-a-contractor`, `/insights`, `/contracts/*`. Footer small print: `/privacy`, `/terms`, `/credits` |
| `src/data/funding-projects.ts` | The five illustrative project scenarios (not clients) |
| `public/funding-site.css` | v4.1 page styles layered on `src/styles/global.css` |
| `src/lib/config.ts` | Categories, jurisdictions (with market `region`), launch flags |
| `src/lib/rfps.ts`, `src/lib/funding.ts` | Airtable build reads, publication and expiry rules |
| `public/scripts/pricing.js` | The only source of Bid Desk prices: $1,250 under $100,000; $2,500 at $100,000 and above |
| `public/scripts/finder-logic.js`, `score.js` | Opportunity Finder matching and readiness scoring (shared by browser, server and tests) |
| `worker/src/index.js` | Lead intake, spam gates, matching, gated checkout |
| `functions/_middleware.js` | 410 for source paths leaked by the first v1 deploy (safe to delete after 2026-11-03) |
| `public/_redirects` | Retired routes (`/open-bids`, newsletter pages, `/restaurant-advisory/funding` → `/funding-directory`) |
| `tests/` | Node unit tests and Playwright/axe browser tests |
| `docs/` | Release log, photo asset register and licenses, brand collateral |

## Run and test

```bash
npm ci
npm run check                      # unit tests, contrast, copy guard, Astro diagnostics
DEMO_SEED=0 npm run build          # production-style build (no Airtable token = empty board)
npm run preview                    # wrangler pages dev on :8788, includes /api routes
BASE_URL=http://127.0.0.1:8788 DEMO_SEED=0 npm run test:e2e
```

Set `DEMO_SEED=1` locally to see three clearly fictional SAMPLE bids. Never run a local credential-free build as a production deploy.

## Configuration (Cloudflare Pages → Settings → Variables, Production)

| Variable | Where | Value |
| --- | --- | --- |
| `SITE_URL` | build | `https://tidewaterbid.com` |
| `AIRTABLE_BASE_ID` | build + runtime | `app5wO7MKQ92y16f1` |
| `AIRTABLE_PAT` | build + runtime (secret) | restricted token; never `PUBLIC_` |
| `DEMO_SEED` | build | `0` |
| `SITE_INDEXABLE` | build | `0` until the owner approves public launch |
| `PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET` | build + runtime | set together, or neither |
| `PUBLIC_ANALYTICS_DOMAIN` | build | Plausible domain; events are already wired |
| `CHECKOUT_ENABLED`, `STRIPE_SECRET_KEY`, `HMAC_SECRET` | runtime | P2, off |
| `STRIPE_WEBHOOK_SECRET`, `PAGES_DEPLOY_HOOK` | runtime | Listing checkout: marks bought listings Secured and rebuilds |
| `STRIPE_PRODUCT_TIER1`, `STRIPE_PRODUCT_TIER2` | runtime | Stripe product ids for the $1,250 and $2,500 bids (test and live ids differ) |

Preview deployments do not receive the production Airtable token and render an empty board; check data on production.

## Airtable (base `app5wO7MKQ92y16f1`)

Airtable is the system of record; its live schema is authoritative. The code depends on these tables and fields:

- **RFPs** (read at build): Title, Agency, Jurisdiction, Category (slugs from `config.ts`), Slug, Due Date, Est. Value, Solicitation URL, Requirements, Summary, Status (`Open`, `Closed`, `Awarded`, `Draft`, `SAMPLE`), Award Amount, Bid Tab URL, Published At. Only `Open` records with an official URL and due date are offered.
- **Funding Opportunities** (read at build): published only when Publication Status = `Approved`, with an `https` Official Source URL and Last Verified date. Open records with a past deadline, or not verified for 45 days, are shown as Closed or Unverified.
- **Prospects** (written by `/api/lead`): Name, Business, Email, Phone, Categories, Jurisdictions, Insurance Status, Registrations, Staff Size, Readiness Score, Source, Consent Timestamp, Lead Type, Bid ID, Notes, Gap List.
- **Matches** and **Restaurant Projects**: best-effort rows written after a finder submission. A match never reserves exclusivity.
- **Launch Execution**, **Offer Catalog**: internal tracking only.

To publish a bid: verify the official notice and latest addendum, fill the record, set Status `Open`, then trigger a rebuild (any merge to `main`, or a Pages deploy hook).

## Open launch items

Owner decisions (none can be marked done from a visual or QA pass):
- Entity formation, DBA and trademark clearance.
- XcelHR employment-agreement review before taking revenue.
- Written engagement terms (scope, turnaround, revisions, exclusivity, refunds); counsel review. Only then checkout.
- Funding Services and Restaurant Advisory packages and pricing (quoted per project until decided; not derived from Bid Desk tiers).
- Public launch: `SITE_INDEXABLE=1`, Search Console.
- Repository visibility: `jcs3-com/Tidewater` is public on GitHub.

Infrastructure (needs Cloudflare dashboard or zone access):
- Turnstile widget keys; analytics domain.
- Pages deploy hook, triggered by an Airtable automation, so listing changes publish without a code push.
- `www.tidewaterbid.com` → apex 301 Redirect Rule; DMARC TXT record (start `p=none`).

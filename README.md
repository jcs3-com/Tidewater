# Tidewater — bid desk + restaurant advisory

## Tidewater v2 candidate status

The v2 institutional/coastal redesign is implemented locally from `main` baseline
`c8dbde3138d2722ecf1e4fd2f1f01dcb914018e4`. Publication is blocked by HTTP 403 on
GitHub writes; it is **not deployed**. See [release log](docs/TIDEWATER_RELEASE_LOG.md),
[design system](docs/TIDEWATER_SITE_DESIGN_SYSTEM.md),
[asset/license register](docs/asset-register.md) and [Drive sync setup](docs/DRIVE_SYNC.md).
These status notes must be updated after a verified production release.

Production-oriented **Astro static site** for **Tidewater**, a trade name of Tidewater Advisory LLC. The frontend builds to Cloudflare Pages. Cloudflare Pages Functions (on the Workers runtime) accept form submissions, writes to Airtable, and handle newsletter double confirmation on the same domain. A daily GitHub Action rebuilds public bids from Airtable.

**Status:** Code and full page copy included. Airtable base and operational interface are created. Three fictional SAMPLE RFPs are in Airtable but are hidden from production builds (`DEMO_SEED=0`). **Do not launch before resolving `LAUNCH_CHECKLIST.md` and running the browser tests.**

## Quick start

Requires Node 20+ and a Cloudflare account for production.

```bash
npm install
cp .env.example .env
# for a clearly marked demo with three fictional bids:
# DEMO_SEED=1 in .env
npm run dev
```

Local website: `http://localhost:4321`. The design, demo board, filters, SEO pages and client-side readiness calculation work without external credentials. Forms do **not** write anywhere until the Pages Functions (or standalone Worker) are deployed with an Airtable token. In a second terminal:

```bash
npm run worker:dev
# => http://127.0.0.1:8787/health
```

Build static output: `npm run build` (creates `dist/`). A deliberate Airtable build error fails rather than publishing stale RFP data. No secret is shipped to the browser.

## File map

- `src/pages/` — final page copy: Home, Bids, Pricing, Restaurant Advisory, Open Bids, bid details, 40 category-by-jurisdiction pages, readiness, three insight articles, About, Contact, Privacy, Terms, newsletter results, 404
- `src/styles/global.css` — mobile-first petrol/cream/oxblood design and dark mode
- `src/lib/rfps.ts` — Airtable read, normalization, status rules and sample fallback
- `src/pages/og/bids/...png.ts` — generated PNG social cards for every bid page
- `src/pages/sitemap.xml.ts` — full static and dynamic XML sitemap; excludes SAMPLE bids
- `public/scripts/score.js` — shared readiness scoring logic, reused by the Worker
- `worker/src/index.js` — Airtable records, match suggestions, CORS and confirmed newsletter
- `functions/` — same-origin Pages Functions routes invoking the Worker logic (recommended production path)
- `seed/rfps.sample.json` — **three explicitly fictional** example records
- `.github/workflows/daily-rebuild.yml` — automatic fresh static deploy daily
- `LAUNCH_CHECKLIST.md` — remaining TODO and verification tasks

## Airtable base schema (create tables with exactly these names)

Airtable base ID starts with `app...`. Create a Personal Access Token with `data.records:read` and `data.records:write` scopes on this **specific base**, plus a restricted account. The build token needs read only; use distinct tokens for builder and Worker in production if possible.

### `Prospects`

| Field name (exact) | Airtable type | Notes |
| --- | --- | --- |
| Name | Single line text (primary) | Needed for non-newsletter requests |
| Business | Single line text | |
| Email | Email | Used for contact and newsletter |
| Phone | Phone or single line text | Optional |
| Categories | Single line text | category slug |
| Jurisdictions | Single line text | jurisdiction slug |
| Insurance Status | Long text | GL/WC answers for quiz |
| Registrations | Long text | registration/licensing answers |
| Staff Size | Single line text | quiz value |
| Readiness Score | Number (integer) | Computed again on the server |
| Source | Single line text | landing form identifier |
| Consent Timestamp | Date with time | Submitted only when explicit checkbox accepted |
| Lead Type | Single line text | contact / newsletter / bid_packet / quiz |
| Bid ID | Single line text | Airtable RFP record ID for packet requests |
| Notes | Long text | |
| Gap List | Long text | server-generated quiz gaps |
| Newsletter Status | Single select | `Pending`, `Confirmed`, `Unsubscribed` |
| Opt-in Token Hash | Single line text | SHA-256; never store raw token |
| Opt-in Expires At | Date with time | 48-hour opt-in window |

**Airtable base created:** https://airtable.com/app5wO7MKQ92y16f1. Interface: https://airtable.com/app5wO7MKQ92y16f1/pbdIvVY5uPBCfHfMK. The following schema is live, including linked Matches fields. Use Airtable permissions appropriately, set an intentional retention policy, and avoid collecting passwords, employee information or nonpublic bid documents through these forms.

### `RFPs`

| Field name (exact) | Airtable type | Notes |
| --- | --- | --- |
| Title | Single line text (primary) | Public bid title |
| Agency | Single line text | Verifiable issuing agency |
| Jurisdiction | Single line text | Use supported slug (see `src/lib/config.ts`) |
| Category | Single line text | Use supported slug |
| Slug | Single line text | URL slug, unique within jurisdiction |
| Due Date | Date (YYYY-MM-DD) | Due **day**; official posting controls exact time |
| Est. Value | Currency/number | Leave blank if not published; never guess |
| Solicitation URL | URL | **Official** solicitation URL, not a generic agency home page |
| Requirements | Long text | One item per line or JSON string array |
| Summary | Long text | Plain English, verified against official posting |
| Status | Single select | `Draft`, `Open`, `Closed`, `Awarded`, `SAMPLE` |
| Award Amount | Currency/number | Only from verifiable award record |
| Bid Tab URL | URL | Public price tabulation if available |
| Published At | Date | Determines "newest" order |

`Draft` is not published. `Open` with a past due date is rendered `Closed` at build time. `Awarded` remains indexed and shows the bid tabulation link and amount **only if present**. A SAMPLE remains a sample regardless of due date; production `DEMO_SEED=0` hides SAMPLE rows even when they are in Airtable. Every live bid should have an official URL; publication should require source review and editorial approval, even though data normalization will allow empty URLs with a visible TODO to make omissions obvious.

### `Matches`

| Field name (exact) | Airtable type | Notes |
| --- | --- | --- |
| Match (primary) | Autonumber or formula/text | Airtable requires a primary field |
| Prospect | Link to `Prospects` | API sends array of linked record IDs |
| RFP | Link to `RFPs` | API sends array of linked record IDs |
| Fit Score | Number (integer) | Preliminary heuristic, **not eligibility** |
| Status | Single select | `offered`, `accepted`, `declined`, `submitted`, `won`, `lost` |
| Exclusivity Holder | Link to `Prospects` | Filled **manually after a signed engagement**, never by an automatic match |
| Offer Expiry | Date with time | 48 hours after the match is offered |

The Worker creates up to five preliminary suggestions for a completed quiz when both category and service area match a current, real `Open` RFP. It skips RFPs with an existing exclusivity holder. It does not reserve exclusivity automatically. `Offer Expiry` marks the time limit; **[[TODO: implement expiry review/cleanup in the operator's Airtable workflow]].** Never send automated offer emails without confirming capacity and contract-specific eligibility.

### Supported slugs

Categories: `catering`, `concessions`, `janitorial`, `security`, `event-services`.

Jurisdictions: `washington-dc`, `montgomery-county-md`, `prince-georges-county-md`, `fairfax-county-va`, `arlington-county-va`, `alexandria-va`, `annapolis-md`, `charleston-sc`.

## Environment variables

**Build only** — set in Cloudflare Pages (for Git deploys), GitHub Actions secrets/variables (for scheduled deploys), or local `.env`. `AIRTABLE_PAT` and `AIRTABLE_BASE_ID` are private; do not prefix them `PUBLIC_`.

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | Final HTTPS canonical origin, no trailing path. Defaults to `https://tidewateradvisory.example` **for development only** |
| `AIRTABLE_PAT` | Read RFP records at build time |
| `AIRTABLE_BASE_ID` | Airtable base identifier |
| `DEMO_SEED` | `1` to show fictional examples when Airtable unavailable; **set `0` in production** |
| `PUBLIC_API_URL` | Leave blank for same-origin Cloudflare Pages Functions (recommended). For standalone Worker, use its public HTTPS URL |
| `PUBLIC_ANALYTICS_DOMAIN` | Optional verified Plausible hostname to enable privacy-friendly analytics; empty disables |
| `PUBLIC_TURNSTILE_SITE_KEY` | Optional **public** Cloudflare Turnstile site key for anti-spam verification |

**Pages Functions / Worker runtime** — set environment variables and secrets in Cloudflare Pages project Settings > Variables and Secrets. The standalone Worker can optionally use `worker/wrangler.toml` and `npx wrangler secret put`.

| Variable | Public? | Purpose |
| --- | --- | --- |
| `SITE_URL` | Yes | HTTPS site origin used for redirect pages |
| `ALLOWED_ORIGIN` | Yes | Same HTTPS site origin for browser CORS |
| `WORKER_URL` | Yes | Public HTTPS Worker origin used in confirmation links |
| `AIRTABLE_PAT` | Secret | Read/write Prospects, RFPs, Matches |
| `AIRTABLE_BASE_ID` | Secret | Base ID |
| `RESEND_API_KEY` | Secret | Confirmation email delivery through Resend |
| `FROM_EMAIL` | Secret | Verified sender identity at Resend. Personal Gmail is used for public replies and founder notifications; it cannot be assumed to work as an unverified Resend sender |
| `MAILING_ADDRESS` | Secret | **Real physical postal address** in outgoing email footers; no sending until filled |
| `HMAC_SECRET` | Secret | Random, high-entropy text for signed unsubscribe links |
| `TURNSTILE_SECRET` | Secret (optional, recommended) | Require Cloudflare Turnstile verification on each form; do not configure without matching public site key |

If anti-spam protection is enabled, set **both** `PUBLIC_TURNSTILE_SITE_KEY` (build) and `TURNSTILE_SECRET` (Worker). Without them, v1 has a honeypot and schema validation but no automated bot challenge. Turnstile verification does not send visitor IP information in this implementation.

The Worker requires all sending fields before creating a newsletter signup and blocks sends when the mailing address contains `TODO`. Outbound confirmation messages include sender identification, a physical address and an unsubscribe link. Newsletter subscribers remain `Pending` until a valid confirmation link is clicked within 48 hours. `Unsubscribed` records must be suppressed in all future campaigns. Use a real suppression policy before the first newsletter send.

## Deploy — GitHub + Cloudflare Pages (recommended)

**Connected Airtable is already configured at the schema level.** Base ID: `app5wO7MKQ92y16f1`. Records: 3 fictional SAMPLE RFPs plus one publicly sourced Montgomery County operator solicitation (RFP 1200454), due December 15, 2026. Confirm official addenda and closing time before client-facing outreach.

1. **[[TODO: Create `jcs3-com/tidewater` on GitHub.]]** Repository creation is not exposed by the connected GitHub actions in this chat. Upload or push this repo from the ZIP. Keep it private until you review the code, then public if desired.
2. **[[TODO: Create Cloudflare Pages project, name `tidewater`, connect the GitHub repo.]]** Set production branch `main`, build command `npm run build`, output directory `dist`, Node version 22. Cloudflare assigns a `*.pages.dev` domain; no custom domain required at launch. Git integration automatically deploys commits. Pages Functions in `functions/` deploy alongside the static site, using the Workers runtime; **no second Worker deployment** or API DNS record is needed.
3. **[[TODO: Enter production environment variables.]]** Cloudflare Pages build variables: `SITE_URL=https://[[TODO: assigned-pages-host]]`, `AIRTABLE_PAT=[[TODO: restricted PAT]]`, `AIRTABLE_BASE_ID=app5wO7MKQ92y16f1`, `DEMO_SEED=0`, `PUBLIC_API_URL=` (blank). Set optional analytics/Turnstile public keys. At runtime add secret `AIRTABLE_PAT` (read/write), `AIRTABLE_BASE_ID`, and, once available, `RESEND_API_KEY`, `FROM_EMAIL`, `HMAC_SECRET`, `MAILING_ADDRESS`. The Pages Functions automatically derive same-origin `SITE_URL`, `WORKER_URL` and allowed origin from request URL if not explicitly set.
4. **[[TODO: Set sender and physical address before activating newsletter email.]]** Public contact is temporarily `james.c.simpsoniii@gmail.com`. Airtable has a draft [lead-notification automation](https://airtable.com/app5wO7MKQ92y16f1/wflOZq1GHTG4nayoX) to send new lead notices there; you must review and turn it on in Airtable. Sending newsletters from a personal Gmail address via Resend is **not configured**; use a verified email domain and physical mailing address to comply with email requirements. Until then newsletter confirmation returns a configuration error rather than silently subscribing.
5. **[[TODO: GitHub Action for daily rebuild.]]** GitHub secrets: `AIRTABLE_PAT`, `AIRTABLE_BASE_ID`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. GitHub variables: `SITE_URL` for the assigned Pages domain and optional `PUBLIC_ANALYTICS_DOMAIN`; `PUBLIC_API_URL` can remain blank. The Action runs daily from Airtable and uses `wrangler pages deploy dist` to update the same Pages project, including its Functions.
6. **[[TODO: Test deployed form submissions.]]** Submit contact, bid packet, quiz, newsletter confirm and unsubscribe in production, then verify Airtable state. Run Playwright, axe, mobile Lighthouse and verify site canonical URLs before announcing launch.

**Security:** The ChatGPT Airtable connector authorizes actions in this chat, but does **not** provide an Airtable Personal Access Token to the Cloudflare build system. Create a separate least-privilege Airtable token for Cloudflare at `https://airtable.com/create/tokens`; do not commit it. Pages Functions need data records read/write permission; build needs read only. Avoid entering credentials or private mailing addresses into repo files. Cloudflare secrets stay server-side.

**Standalone Worker alternative:** `npm run worker:deploy` is retained for operators who later want a separate API origin. In that mode, set `PUBLIC_API_URL`, `ALLOWED_ORIGIN`, `WORKER_URL` and other Worker settings explicitly. The same-origin Pages Functions above are the default.

## A/B positioning

The home page tests two user-supplied headline lines, 50/50 on a per-session basis, via `sessionStorage`. Version A is the primary positioning line; B is the secondary. Version persists during the browser session. The form script sends a `lead` event to Plausible when enabled (with form type and headline variant as custom properties). Configure a Plausible `lead` goal to compare conversions; do not substitute headline preference for a randomized conversion experiment. Without Plausible, the variant still changes but **conversion comparison is not available**.

## SEO and build behavior

All content is statically generated with semantic elements, page-specific titles and descriptions, canonical URLs, Open Graph image URLs, Organization schema, Service + FAQPage schema where relevant, and a static XML sitemap. The programmatic routes generate **40 category × jurisdiction pages**. Bid pages generate PNG Open Graph assets with Resvg. Closed/awarded bids stay indexed, but SAMPLE pages have `noindex` and are excluded from the XML sitemap. `robots.txt` points to the sitemap. Set `SITE_URL` before publishing to avoid `.example` canonical URLs.

## Visual and accessibility requirements

Baseline responsive width is 360px, gutters 16px, no fixed wide child on mobile, interactive targets 44px or larger, reduced-motion support, accessible labels and error messages, keyboard navigation, color-theme toggle, Fraunces/Lora/IBM Plex Mono typography, no stock images. The `npm run check:contrast` script verifies the main palette, status badges, dark mode and form-feedback combinations at 4.5:1 or better. **This is not an exhaustive rendered-DOM audit**; run `npm run test:e2e`, axe and Lighthouse after deploying and check at 360px and 1440px. Lighthouse 90+ in all categories is a **target, not a measured claim**.

## How to publish a verified bid

1. Find the public agency notice and capture the official solicitation link.
2. Confirm agency, exact requirements, due date and any fee/attachment information. Put unpublished estimated value **blank**.
3. Write a plain-English summary without inventing contract amounts or qualifications.
4. Set Category + Jurisdiction to a supported slug, a unique Slug, and Status `Open` **only after source verification**.
5. Publish via Pages rebuild or the scheduled deployment. After award, update Status to `Awarded` and enter the actual award amount and bid tab URL **only if official public evidence exists**.

## Important factual corrections

- The [IRS food inventory rules](https://www.irs.gov/publications/p526) and [26 U.S.C. § 170(e)(3)(C)](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title26-section170&num=0&edition=prelim) distinguish entity types: a general 15% limit is applied to C-corporation taxable income or, for other entities, qualifying business net income. Ask a tax advisor.
- [Maryland's Comptroller](https://services.marylandcomptroller.gov/taxes/en/tax-credits-deductions-and-subtractions?id=kb_article_view&sys_kb_id=733587b61b97d290168d6424604bcb8a&sysparm_rank=2&sysparm_tsqueryId=86ebb7b01bf136146cba8593604bcbe8) says the old oyster-shell recycling credit, formerly capped at **up to $1,500 a year**, stopped accruing for tax years beginning January 1, 2023. Do **not** market it as currently active unless a new source confirms reinstatement.
- [Oyster Recovery Partnership](https://www.oysterrecovery.org/get-involved/shell-recycling) describes eligibility for ongoing shell pickup but does not explicitly guarantee no-charge service on its main current eligibility page. Confirm pricing and availability with ORP before calling pickups "free."

## Remaining launch tasks

See [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md). This implementation has automated unit tests, contrast checks, and a connected Airtable base populated through the Airtable connector, **not** a verified Cloudflare deployment, end-to-end live form submission or full mobile Lighthouse run. Keep those separate from completed code.

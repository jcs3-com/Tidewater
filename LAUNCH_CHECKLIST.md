# Tidewater — launch checklist

## Owner-gated decisions — open as of 2026-10-28

Engineering does not block on these; none may be marked done from a visual or QA pass.

- [ ] **[[TODO: Repository visibility. `jcs3-com/Tidewater` is PUBLIC on GitHub (verified 2026-10-28) although the handoff describes it as private. No secrets were found in history, but business docs and the Airtable base ID are public. Owner decides; changing visibility can break the Cloudflare Git integration and must be re-verified.]]**
- [ ] **[[TODO: Entity formation, DBA and trademark clearance for "Tidewater Advisory LLC" / "Tidewater"; business mailing address for footer and newsletter.]]**
- [ ] **[[TODO: XcelHR employment agreement review (non-compete, non-solicit, IP, outside activity) before taking revenue.]]**
- [ ] **[[TODO: Written Single Bid Architecture engagement terms: scope, turnaround, revision round, exclusivity, refund/cancellation, acceptance; counsel review.]]**
- [ ] **[[TODO: Restaurant Advisory packaging and pricing (not derived from Bid Desk tiers).]]**
- [ ] **[[TODO: Analytics account (Plausible or equivalent) and domain; then set `PUBLIC_ANALYTICS_DOMAIN`.]]**
- [ ] **[[TODO: Turnstile widget for tidewaterbid.com; set `PUBLIC_TURNSTILE_SITE_KEY` (build) and `TURNSTILE_SECRET` (runtime) together.]]**
- [ ] **[[TODO: DMARC record for tidewaterbid.com (start `p=none` with reporting) without disturbing working inbound mail.]]**

## v3.2 brand, pricing and Opportunity Finder — 2026-10-28

- [x] Approved master brand board installed: engraved oyster lockup (header/footer, light and dark), tagline, palette tokens, Cormorant roman + italic, DM Sans, favicon, apple-touch icon, default and per-bid social images, contour texture. See `docs/TIDEWATER_SITE_DESIGN_SYSTEM.md`.
- [x] Bid Desk pricing is $1,250 (under $100,000) / $2,500 ($100,000 and above) everywhere, from `public/scripts/pricing.js`; retired prices removed and guarded by unit and browser tests ($99,999 / $100,000 boundary tested).
- [x] Free Opportunity Finder at `/opportunity-finder` (Bid Desk and Restaurant Advisory paths) on the existing Pages Functions → Airtable path.
- [x] Production `/api/lead` writes to Airtable `Prospects` (verified 2026-10-28 with one labelled QA record, `recDScntVbM5OlTxI`). Runtime Airtable secret is therefore configured.
- [x] `tidewaterbid.com` and `www.tidewaterbid.com` serve production over HTTPS; canonical tags point to the apex.
- [ ] **[[TODO: Add a Cloudflare zone Redirect Rule `www.tidewaterbid.com/*` → `https://tidewaterbid.com/$1` (301). Pages `_redirects` cannot match hostnames; needs dashboard or zone-scoped API access.]]**
- [ ] **[[TODO: Add `X-Robots-Tag: noindex` or a redirect for `tidewater-6ik.pages.dev` only after the Drive release workflow stops polling it.]]**
- [ ] **[[TODO: Confirm founder default of one consolidated revision round on the pricing page and proposal template.]]**
- [ ] **[[TODO: Approve refund policy and attorney-reviewed engagement agreement; only then configure `STRIPE_SECRET_KEY` and set `CHECKOUT_ENABLED=1` (build and runtime).]]**
- [ ] **[[TODO: Enable Turnstile. Production received an unsolicited SEO-spam contact on 2026-10-28 despite noindex.]]**
- [ ] **[[TODO: Configure `PUBLIC_ANALYTICS_DOMAIN` (Plausible) and goals `lead`, `finder_start`, `finder_result`, `paid_inquiry`, `tier_check`, `checkout_start`.]]**

## v2 visual candidate — 2026-10-26

The redesign can be released visually with Airtable credentials pending. This
does not clear the indexing, newsletter, legal or operational gates below.

- [x] Locally hosted Chesapeake photographs, verified source/license register,
  self-hosted open-license fonts, original decorative contour illustration.
- [x] Responsive home and interior redesign; no pricing/API/schema changes.
- [x] Browser QA at 360/390/768/1440px; 19 Playwright tests passed on local Pages
  output; light/dark axe audits of 13 primary routes had zero A/AA violations.
- [x] Prepared release log, design system, asset register, source-archive command
  and an opt-in Drive sync workflow. See `docs/DRIVE_SYNC.md` for exact OAuth setup.
- [x] GitHub write access confirmed 2026-10-26; `feat/tidewater-v2` pushed and
  [PR #1](https://github.com/jcs3-com/Tidewater/pull/1) opened and merged to `main`.
- [x] Production Cloudflare check, live `/release.json` source SHA and live v2
  browser suite: see the production verification entry in
  `docs/TIDEWATER_RELEASE_LOG.md`.
- [ ] **[[TODO: Configure Google OAuth secrets and enable DRIVE_SYNC_ENABLED
  only after a successful verified sync. Automatic sync is not active.]]**
- [ ] **[[TODO: Complete actual production Airtable/Resend delivery checks after
  restricted credentials are configured; do not use a visual pass as proof.]]**

The generated release manifest and Drive receipt distinguish the candidate
source SHA, remote main, actual production evidence and manually archived files.

`[[TODO]]` items are deliberately not guessed. Resolve these before the site goes live.

## Launch gates (build variables, default off)

- [ ] **[[TODO: Set `SITE_INDEXABLE=1` only after every copy/legal TODO below is cleared.]]** Until then every page is `noindex, nofollow` and robots.txt disallows all.
- [ ] **[[TODO: Set `NEWSLETTER_ENABLED=1` only after Resend sender, `MAILING_ADDRESS` and `HMAC_SECRET` are configured.]]** Until then the signup form is not rendered and `/api/lead` returns 503 for newsletter requests.
- [ ] **[[TODO: Set GitHub variable `DAILY_REBUILD=1` after the Action's secrets exist.]]** Scheduled runs are skipped until then.

## Identity, offers and copy

- [x] Domain `tidewaterbid.com` registered at Cloudflare Registrar (2026-10-26). Code defaults now use it.
- [x] `tidewaterbid.com` and `www.tidewaterbid.com` attached to Pages project `tidewater`; both return HTTPS 200 with the production release marker (verified 2026-10-28).
- [ ] **[[TODO: After the domain serves HTTPS, set the Pages variable `SITE_URL=https://tidewaterbid.com` and redeploy; verify canonical, OG and sitemap URLs.]]**
- [x] Cloudflare Email Routing enabled for `tidewaterbid.com` (MX and SPF live); public contact is `hello@tidewaterbid.com` on every page. No personal address is published. **[[TODO: Add a DMARC record; send a test message to confirm forwarding.]]**
- [ ] **[[TODO: Optional: register `tidewaterbids.com` and redirect it to `tidewaterbid.com`.]]**
- [x] Public contact email is `hello@tidewaterbid.com` (forwarded by Cloudflare Email Routing).
- [ ] **[[TODO: Supply actual company postal mailing address]]** for site footer and CAN-SPAM email footer.
- [x] Founder bio drafted from known operator history. **[[TODO: Founder final copy review before public launch.]]**
- [ ] **[[TODO: Confirm final trademark/trade-name use and logo/brand approval.]]**
- [x] Pricing approved by the founder 2026-10-28 (policy v1.1).
- [ ] **[[TODO: Approve written engagement terms, including one-firm-per-solicitation exclusivity and refunds.]]**
- [ ] **[[TODO: Verify actual availability and fee terms for ORP shell pickups; only then advertise free pickups if documented.]]**
- [ ] **[[TODO: Recheck Maryland shell-credit law before any active tax-credit claim.]]** Existing site correctly says the prior up-to-$1,500 credit expired.
- [ ] **[[TODO: Approve attorney-reviewed privacy, terms, jurisdiction, retention, deletion process, legal email and effective dates.]]**

## Airtable operating setup

- [x] Published [Tidewater Operations interface](https://airtable.com/app5wO7MKQ92y16f1/pbdIvVY5uPBCfHfMK) with Lead Inbox, Bid Board, Prospect Matches.
- [x] Created [new-lead notification automation](https://airtable.com/app5wO7MKQ92y16f1/wflOZq1GHTG4nayoX) to send to personal email.
- [ ] **[[TODO: Review and turn on Airtable lead notification automation in the Airtable UI.]]**

## Data and forms

- [x] Airtable base and Prospects, RFPs, Matches tables created and verified: https://airtable.com/app5wO7MKQ92y16f1
- [ ] **[[TODO: Create restricted Airtable access tokens; configure builder read-only and Worker read/write.]]**
- [ ] **[[TODO: Email delivery: verify Resend sender/domain, mailing address and unsubscribe secret.]]** `hello@tidewaterbid.com` is receive-only forwarding, not an authenticated bulk sender.
- [ ] **[[TODO: Set production SITE_URL and deploy Pages with its same-origin Functions; configure runtime secrets in Cloudflare.]]** Separate Worker is optional, not required for the default Pages deploy.
- [ ] **[[TODO: Perform actual contact, quiz, packet and newsletter form submissions; verify all fields in Airtable.]]**
- [ ] **[[TODO: Click actual double-opt-in link, verify Pending → Confirmed; test expiry and unsubscribe → Unsubscribed.]]**
- [x] Added one verified Montgomery County public solicitation (Wheaton Arts and Cultural Center operator RFP 1200454; due December 15, 2026) to the Airtable RFPs table.
- [ ] **[[TODO: Expand the reviewed list of public bids and recheck the above RFP for addenda/status changes.]]**
- [x] Three clearly marked SAMPLE records loaded in Airtable; `DEMO_SEED=0` excludes them from public site builds. [[TODO: Verify production env setting.]]
- [ ] **[[TODO: Confirm agency due times and timezone manually (UI counts calendar days only).]]**
- [ ] **[[TODO: Create an Airtable view/review that expires 48-hour match offers and blocks exclusivity conflicts.]]**
- [ ] **[[TODO: Decide newsletter cadence/editorial workflow, suppression rules and data retention.]]**
- [ ] **[[TODO: Enable Turnstile with both public site key and Worker secret, then verify live form submission and rejected bot submissions.]]**

## Infrastructure and QA

- [x] Source pushed to `jcs3-com/Tidewater` `main` with `package-lock.json` (2026-10-26).
- [x] Existing Cloudflare Pages project `tidewater` deploys this repository with Pages Functions; both production domains serve v2. Preserve the project and verify the release marker for each new deployment.
- [ ] **[[TODO: Configure Cloudflare Pages build variables and secrets; separately configure GitHub Actions for daily RFP rebuild.]]**
- [ ] **[[TODO: Configure Plausible domain and `lead` event goal, or choose Cloudflare Web Analytics and adapt A/B conversion tracking.]]**
- [ ] **[[TODO: Verify email authentication SPF, DKIM and DMARC.]]**
- [x] `npm install`, `npm run check` (0 errors) and `npm run build` pass on Node 22. Fixed: missing `@types/node`; `build.format: 'file'` so Pages serves slashless canonicals without redirects.
- [x] Playwright suite 6/6 (dev). Production build under `wrangler pages dev`: 15 routes at 360/390/768/1440px, no horizontal overflow, real RFP renders, SAMPLE pages 404. **[[TODO: Re-run against the live *.pages.dev URL with `BASE_URL=... npx playwright test`; check focus states manually.]]**
- [ ] **[[TODO: Audit rendered routes with axe for keyboard, contrast and ARIA compliance.]]**
- [ ] **[[TODO: Run mobile Lighthouse and achieve 90+ for performance, accessibility, best practices and SEO.]]** Target is not yet measured.
- [ ] **[[TODO: Validate production sitemap, robots, canonical URLs, OG PNGs, JSON-LD and noindex on sample records.]]**
- [ ] **[[TODO: Create Google Search Console property and submit sitemap.]]**
- [ ] **[[TODO: Create current official agency source monitoring and human verification process for daily bid ingestion.]]** Build is daily; sourcing/curation is not automated in v1.
- [ ] **[[TODO: Verify mail, privacy and procurement claims with counsel and relevant agencies before publishing.]]**

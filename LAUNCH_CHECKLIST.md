# Tidewater — launch checklist

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
- [ ] **[[TODO: Attach `tidewaterbid.com` (and optionally `www.tidewaterbid.com`) as Custom domains on the Pages project `tidewater`.]]**
- [ ] **[[TODO: After the domain serves HTTPS, set the Pages variable `SITE_URL=https://tidewaterbid.com` and redeploy; verify canonical, OG and sitemap URLs.]]**
- [ ] **[[TODO: Enable Cloudflare Email Routing for `hello@tidewaterbid.com`, verify forwarding, then replace the personal Gmail on Contact, Privacy, Terms and footer.]]**
- [ ] **[[TODO: Optional: register `tidewaterbids.com` and redirect it to `tidewaterbid.com`.]]**
- [x] Public contact email temporarily set to `james.c.simpsoniii@gmail.com`. [[TODO: Replace with dedicated domain mailbox if desired.]]
- [ ] **[[TODO: Supply actual company postal mailing address]]** for site footer and CAN-SPAM email footer.
- [x] Founder bio drafted from known operator history. **[[TODO: Founder final copy review before public launch.]]**
- [ ] **[[TODO: Confirm final trademark/trade-name use and logo/brand approval.]]**
- [ ] **[[TODO: Approve pricing scope and written engagement terms, including one-firm-per-solicitation exclusivity.]]**
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
- [ ] **[[TODO: Email delivery: verify Resend sender/domain, mailing address and unsubscribe secret.]]** Personal Gmail is the public contact and internal recipient, not an authenticated bulk sender.
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
- [ ] **[[TODO: Create Cloudflare Pages project from `jcs3-com/tidewater` and deploy static site plus Pages Functions.]]** Cloudflare API action is not connected in this chat. A custom domain can be added later.
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

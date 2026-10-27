# Tidewater v3.0 — Claude deployment handoff (NOT deployed)

## What is in this ZIP
This is an **overlay**, not a full checkout. Apply it on top of the **latest** main branch of `jcs3-com/Tidewater`. The GitHub connector used to package it did not have repository access; a complete source mirror from Google Drive (dated Oct 27, 2026) was used for the changed legacy files. The mirror may not include commits added afterwards. **Review and merge source diffs** instead of blindly replacing newer changes.

Do not publish this ZIP folder alone as a Cloudflare Pages project. It is a patch to the existing Astro 5 repo and requires unchanged files from that repo (components, data, scripts, licensed images, fonts, Functions, Worker, package-lock, tests, etc.).

## Change set
- `src/pages/index.astro`: dual-practice homepage and visual practice panels, preserves bid preview, readiness and newsletter.
- `src/layouts/Base.astro`: navigation, footer and disclosures; original site retained.
- `src/styles/global.css`: additive v3 responsive styling and search UI.
- `src/pages/restaurant-advisory.astro`: new broad Restaurant Advisory hub.
- `src/pages/restaurant-advisory/food-waste.astro`: original food-waste page, moved almost unchanged from old Restaurant Advisory route.
- `src/pages/restaurant-advisory/funding.astro`: grant directory, search/filter UI, status/date disclosures.
- `src/lib/funding.ts`: reads APPROVED Airtable records securely **at build time**; fails a configured but unavailable Airtable build rather than publish stale information.
- `src/data/funding-snapshot.ts`: four editorially sourced entries (verified October 27, 2026), used only when no Airtable PAT is configured. Snapshot warning is visible.
- `src/pages/sitemap.xml.ts`: includes restaurant subroutes.

## Airtable work completed
Existing base: https://airtable.com/app5wO7MKQ92y16f1
- Existing `Prospects`, `RFPs`, `Matches` unchanged.
- Created `Funding Opportunities` table (ID `tbl1BmsvnvHtCDGKT`), 5 research records: 4 Approved, 1 Draft. `Publication Status=Approved` is the publication gate.
- Created `Restaurant Projects` table (ID `tbls68v5R88GgZaz3`) as private implementation tracker.

Build variables: `AIRTABLE_PAT` (server-side data.records:read scope), `AIRTABLE_BASE_ID=app5wO7MKQ92y16f1` (existing). Never use `PUBLIC_AIRTABLE_PAT`. Existing Pages Functions and Worker remain untouched. The funding directory is a static build snapshot; new Airtable records require a production rebuild.

## Deployment instructions to Claude
1. Check out latest `main` from **existing** `jcs3-com/Tidewater` repository. Make a new feature branch `feature/tidewater-3-restaurant-advisory`. No changes to production until approved.
2. Extract ZIP and overlay changed source files; compare against latest main before replacing. Preserve existing pricing, bidding logic, credentials, Cloudflare config, forms, Worker, tests, assets and domain.
3. Review internal Astro imports and routes; run `npm ci --no-audit --no-fund`, `npm run check`, and `DEMO_SEED=0 SITE_INDEXABLE=0 NEWSLETTER_ENABLED=0 npm run build` with appropriate server-side credentials. Preview on mobile (360px) and desktop. Confirm `/bids`, `/open-bids`, `/restaurant-advisory`, `/restaurant-advisory/food-waste`, `/restaurant-advisory/funding`, `/readiness` and all form endpoints.
4. Replace the **temporary remote Pexels image** with a self-hosted, optimized licensed source asset *before production*. The desired photo: water visibly moving over smooth stones in a streambed. Candidate source: https://www.pexels.com/photo/close-up-of-a-stream-flowing-between-rocks-17154853/ (photographer Pew Nguyen, Pexels License). Verify photographer/license, download under license, produce webp widths and update `docs/asset-register.md` and `src/pages/credits.astro`. For now image URL has an accessible Swan Island fallback.
5. Keep the existing licensed Chesapeake panoramic imagery from `/public/assets/chesapeake-marsh*`. Preserve image credits and all previous image provenance, maps and typography.
6. Verify that the fallback editorial snapshot cannot be mistaken for continuously updated real-time Airtable listings. Every source record must have official link and last-verified date. Check current fall AFID deadline; do not present as Open after Oct 30.
7. No automatic merge or deploy from this package. Open PR, run preview / regression tests, and merge only after user authorizes deployment. Existing Cloudflare Pages project and canonical `tidewaterbid.com` must remain unchanged until deployment is approved.

## Sources verified for four initial funding records (as of October 27, 2026)
- Virginia AFID: https://www.vdacs.virginia.gov/agriculture-afid-infrastructure-grants.shtml
- Maryland MEA FY27: https://energy.maryland.gov/Pages/Commercial%26CommunityBuildingsGrantProgram.aspx
- DC Food Waste Innovation (historical): https://dslbd.dc.gov/foodwastegrant
- Maryland food service rebates (utility directory): https://energy.maryland.gov/residential/Pages/Food-Service.aspx
- Charlottesville research record (DRAFT, NOT published): https://www.charlottesville.gov/1941/Grants

No unsupported amounts, claimed approvals, grants awarded or fabricated clients are included.

## Other release constraints
Follow original `AGENTS.md`, design system and release log. Keep indexability (`SITE_INDEXABLE=0`) and newsletter sending (`NEWSLETTER_ENABLED=0`) disabled until launch gates resolved. Do not turn on Airtable automations without review. No production deploy requested in this task.

# Tidewater 2.0 candidate QA — 2026-10-26

## Blue-gray photography follow-up

Both photographs now use a shared blue-gray monochrome CSS treatment. Production build and five focused browser checks passed: local posters/motion plus four-width screenshots. Desktop and mobile previews were visually reviewed. The full-suite and Lighthouse measurements below describe the original candidate `ebdb9b153af5afb66f1251ff0dfcfe8960796115`; no new Lighthouse measurement is claimed for this cosmetic update.

Candidate branch `feat/tidewater-v2`, based on `main` commit `c8dbde3138d2722ecf1e4fd2f1f01dcb914018e4`. The immutable source SHA is in the companion release manifest. These are **local candidate** results, not a live v2 certification.

| Check | Result |
| --- | --- |
| Locked dependency installation | Passed, `npm ci` |
| Worker / readiness / CORS / consent / Airtable writes and opt-in mocks | 9/9 passed; synthetic records only |
| Marketing/compliance copy guard | Passed |
| Enumerated light/dark text contrast | 27/27 AA pairs passed, minimum 5.47:1 |
| Astro diagnostics | 0 errors, 0 warnings, 0 hints |
| Static production build | Passed, 59 pages; no SAMPLE detail routes with `DEMO_SEED=0` |
| Production-like browser suite | 19/19 passed against local `wrangler pages dev` |
| Responsive widths | 360, 390, 768, 1440px; no horizontal overflow on primary routes |
| axe WCAG 2 A/AA + 2.1 A/AA | 13 routes × light desktop / dark mobile; zero violations |
| Keyboard / navigation | Skip link, Enter/escape disclosure, focus restoration, pricing navigation passed |
| Media | Local responsive images loaded; pause/resume, reduced motion and failed-image readability passed |
| Readiness | Client scoring and result/lead-capture disclosure passed |
| Failed form delivery | Entries retained; visible error and direct email fallback passed |
| Local Pages Functions without production credentials | `/health` 200; synthetic contact POST 503; newsletter POST 503; no fake success |
| Launch gates | noindex/nofollow, disallow-all robots and newsletter signups closed verified |
| Mobile Lighthouse 13, local production home | Performance 97; accessibility 100; best practices 100; SEO 69 |
| Lighthouse metrics | FCP 0.9s, LCP 2.1s, CLS 0, TBT 180ms; total measured transfer 189 KiB |
| Live v2 deployment | Published through PR #1; see "Production verification" in `TIDEWATER_RELEASE_LOG.md` for the Cloudflare check, live SHA and live browser results |
| Continuous Drive sync | **Not active: workflow installed in the repository but gated off (`DRIVE_SYNC_ENABLED` unset); OAuth secrets not configured** |

The Lighthouse SEO score reflects the intentional noindex launch gate. Do not remove the gate to improve that score. Local metrics are laboratory measurements, not field data or proof of live performance.

Audited routes: `/`, `/bids`, `/open-bids`, `/pricing`, `/restaurant-advisory`, `/readiness`, `/about`, `/insights`, `/contact`, `/privacy`, `/terms`, `/contracts/catering/montgomery-county-md`, `/credits`. Four-width smoke tests cover the primary product routes; screenshots additionally capture home/pricing/open-bids/readiness at all four widths. Demo mode retains clearly labeled fictional samples; production mode excludes them and returns 404 for their detail URLs.

Evidence archive contains the machine-readable Playwright report, screenshots, mobile Lighthouse JSON/HTML, baseline public homepage capture and final production status inspection. Production v2 checks, real customer/operational Airtable writes, actual email delivery and physical-device/manual screen-reader checks remain outside the completed local verification.

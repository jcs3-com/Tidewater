# Tidewater website design system — 3.2

Updated 2026-10-28. **Visual authority:** the founder-approved master brand board (`Tidewater-Approved-Coastal-Brand-Board.png`, Drive project folder). Where a value below differs from the board as rendered, the board wins. Earlier exploratory logos, the simplistic oyster vectors and the confluence logo are retired.

## Identity

- **Mark:** engraved oyster. Full-tone engraving (`brand/oyster-engraving-252|503.webp`) for editorial accents and social images; one-colour vector trace (`brand/oyster-mark-ink.svg`, `brand/oyster-mark-shell.svg`) for lockups and print; 2× rasters (`brand/oyster-mark-{ink,shell}-header.webp`, 120×85) for the header and footer so the 160 KB vector is not on the critical path. The supplied simplified oyster (`favicon.svg`) is used only at favicon sizes; `brand/apple-touch-icon.png` uses the traced engraving.
- **Lockup:** mark left, `Tidewater` in Cormorant Garamond 500, `ADVISORY` in DM Sans with 0.42em tracking, centred under the wordmark. Coded in HTML, never an image of text. Light mark on light surfaces, shell mark in dark mode (switches with the theme toggle and `prefers-color-scheme`).
- **Tagline (verbatim):** *Read the current. Find the opportunity.* Homepage H1, footer (Cormorant italic), Opportunity Finder H1, social card.
- **Texture:** `estuary-contours.svg` (supplied), only in quiet bands: interior title areas, the finder band, closing CTA, food-waste cards. Opacity 0.06–0.24. Decorative, not a chart.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| `--shell` / page | `#F7F5EF` | Page background (board measured `#F1EEE6`–`#F7F5EF`) |
| `--ink` / text | `#243943` | Text, wordmark, dark panels (board swatch `#233A44`) |
| `--deep-tide` / action | `#2E4B5B` | Primary buttons, checkbox accent, featured price card |
| `--estuary` | `#6B8A96` | Contours, field borders (`--field-line`, 3.4:1 on shell), dark-panel rules (board swatch `#6C838A`) |
| `--mist` | `#B7C4C7` | Channel tones; decorative rules use `--line #B3BFC2` |
| `--oyster` | `#D8CBB8` | Warm accent, dark-mode primary button (board swatch `#D3CBBD`) |
| `--marsh` | `#849288` | Board's sage swatch; accents only, never text |
| surface / subtle | `#FCFBF7` / `#EEEAE1` | Cards / quiet bands |
| muted text | `#4B626D` | Secondary text (≥5:1 on every light surface) |

Dark mode: page `#1A2C35`, surface `#213640`, subtle `#283F4A`, text shell, muted `#C3CFD2`, primary button oyster on `#1A2C35`. Reverse sections use dark ink with shell text, matching the board's dark lockup panel. `npm run check:contrast` enforces every enumerated text pair at 4.5:1 and field borders at 3:1.

## Typography

Cormorant Garamond roman + italic (display, wordmark, tagline) and DM Sans (body, navigation, forms, controls), self-hosted WOFF2 under OFL 1.1. System monospace only for bid data micro-labels.

## Components added in 3.2

Price cards (`.price-card`, featured Tier II), tier checker, scope grid, Opportunity Finder path selector, step panels, results with labelled matches (`.finder-label` grant / rebate / sponsor-required / unverified), readiness meter, gated checkout panel. All honour 44px targets, visible focus, reduced motion and both themes.

## Layout and motion (carried from 2.0)

- Display: locally hosted Cormorant Garamond variable, weight 500; Georgia fallback. Body/navigation: locally hosted DM Sans variable; Arial fallback. System monospace is reserved for bid data and micro-labels. Both font licenses are in `docs/licenses/`.
- Maximum content width 1248px; 48px desktop gutters, 24px tablet and 20px mobile. Major section spacing scales from 56–112px. Breakpoints 1200, 970 and 600px.
- Panoramic photographic home hero, opaque oyster-shell headline banner, one primary contact CTA and a secondary opportunity-browsing link. Editorial three-column section headings and two practice summaries; quiet rules replace excessive boxes. Forms and bid records remain clearly delineated.
- Interior first sections and closing calls to action share the original decorative estuary contour study. The drawing is expressly non-geographic and not suitable for navigation.
- Shared header, footer, forms, cards, pricing table, FAQs, quizzes, error pages, legal and content routes use the same tokens. Public image credits are at `/credits`.

## Media and motion

Responsive local WebP photographs with JPEG fallback, fixed dimensions and useful alt text. Hero has high fetch priority; secondary imagery loads lazily. The mobile hero source is about 67 KiB and desktop source about 223 KiB. Fonts total about 74 KiB. No background video or external media dependency.

All photographs use a muted blue-gray monochrome treatment: remove the original hues with grayscale, then apply a restrained cool tint. The same CSS treatment applies to the hero and secondary aerial in both themes. Licensed source files remain unchanged, with no additional image downloads.

A 24-second alternating transform provides gentle cinematic movement of a still image. The visible pause/resume button is keyboard accessible; motion and the button disappear with reduced-motion preference. Without JavaScript the image remains static. An opaque banner preserves readability when images fail. See the verified asset register for source revisions and checksums.

## Interaction and accessibility

48px primary controls, visible focus rings, semantic headings/landmarks, skip link, named navigation and current-page indication. The mobile disclosure menu supports Enter, Escape with focus restoration, outside-click dismissal, link dismissal and desktop resize. Without JavaScript navigation remains available. Light and dark modes preserve readable body, form, status and panel colors. Never put meaningful text solely inside a background image.

## Product and launch boundaries

Pricing, flat-fee model, bid sourcing/filtering, readiness scoring, Cloudflare Pages Functions, Worker handlers and Airtable schema/interfaces remain intact. A form delivery failure leaves entries available and exposes a direct mailto fallback. No fabricated award results, client claims, address or registrations. No automatic headline variant promising a winning bid.

`SITE_INDEXABLE` and `NEWSLETTER_ENABLED` remain off. Airtable/Resend production submission verification remains a separate pending operational task. Do not clear legal TODOs or turn on gates as a consequence of the visual release.

## Bid-desk focus update

The homepage now presents government bidding only: introduction, audience/scope, engagement process, current opportunities and contact. The regional photograph is on About; newsletter signup remains gated on Insights. The food-waste project has a quiet footer link to its existing subpage and a dedicated enquiry form. Readiness is an optional tool reached through Becoming a contractor. These hierarchy changes preserve the palette, typography, aerial assets and decorative estuary contours. Tidewater Food Waste remains a working label, not a newly approved division name.

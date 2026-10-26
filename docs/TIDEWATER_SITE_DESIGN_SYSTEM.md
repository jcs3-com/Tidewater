# Tidewater website design system — 2.0

Prepared 2026-10-26. Implementation is a tested, unpublished candidate until the production commit marker confirms otherwise. GitHub `jcs3-com/Tidewater` is the code source of truth; Drive is documentation and archive storage.

## Direction

Institutional restraint, generous space and an operator's point of view. Carlyle and Verlaine Capital inform hierarchy and pacing only. No proprietary imagery, marks or site code were copied. The supplied Drive v2 ZIP and full handoff were read; unreliable external image references were replaced.

## Palette

| Role | Light | Dark |
| --- | --- | --- |
| Oyster shell / page | `#F5F5F0` | `#182C35` |
| Slate / text | `#243943` | `#F5F5F0` |
| Mist / secondary surface | `#E8EEED` | `#28434E` |
| Surface | `#FFFFFF` | `#213B46` |
| Muted text | `#4B626D` | `#C6D5D9` |
| Marine action | `#294B5A` with white | `#D6E5E7` with `#182C35` |
| Rules | `#A8B5B8` | `#78919C` |

The home headline panel retains oyster shell and slate in both themes. Blue panels use white headings and `#DCE7E8` secondary text. Status chips retain explicit SAMPLE/Open/Closed/Awarded labels rather than relying on color. Enumerated text pairs pass AA at 4.5:1 or better; rendered pages are additionally checked with axe.

## Typography and layout

- Display: locally hosted Cormorant Garamond variable, weight 500; Georgia fallback. Body/navigation: locally hosted DM Sans variable; Arial fallback. System monospace is reserved for bid data and micro-labels. Both font licenses are in `docs/licenses/`.
- Maximum content width 1248px; 48px desktop gutters, 24px tablet and 20px mobile. Major section spacing scales from 56–112px. Breakpoints 1200, 970 and 600px.
- Panoramic photographic home hero, opaque oyster-shell headline banner, one primary readiness CTA. Editorial three-column section headings and two practice summaries; quiet rules replace excessive boxes. Forms and bid records remain clearly delineated.
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

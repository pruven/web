# Company positioning

Pruven is an experimental software company that builds its own products and takes on freelance software projects for clients. The hero, studio, services, process, contact, footer, metadata, and Open Graph image reflect both sides of the company. Zeke remains its only current product.

# Current product update

Pruven currently has one product, [Zeke](https://zeke.pruven.top/). The product section now presents Zeke’s documented Git-worktree functionality and Bun installation commands in a native HTML terminal. The fictional projects, client strip, numeric proof, and testimonial have been removed, along with the template’s founding date, legal company suffix, address, phone number, and delivery-time promises. Navigation labels the work anchor “Products”. Typography, colors, section styling, canvas artwork, and responsive behavior are preserved.

The reference measurements below describe the earlier template recreation and are historical; they are not similarity claims for the updated, shorter product page. Current screenshots are stored under `local/`. The updated production build and all eight Playwright tests pass, including the product URL, installation clipboard contents, responsive layout, and JavaScript-disabled terminal presentation.

---

# Pruven recreation — visual and technical review

Reference: https://onda-template.modulify.website/

The original brief requested a faithful reproduction. Subsequent instructions change the visible name, wordmark, metadata, contact email, and package name to **Pruven**, and remove the circular symbol beside the header/footer wordmark. All other layout and content decisions follow the reference.

## Inspection

The shared browser was used to inspect the live page, computed typography and colors, section structure, mobile navigation, image hover behavior, and contact fields. The reference was then independently inspected and captured with Playwright at 1440×900, 768×1024, and 390×844. Each width has section screenshots, a full-page capture, and a JSON measurement record in `reference/`. Matching production captures are in `local/`.

The layout has a 1440px maximum container, 48px desktop gutters, 32px tablet gutters, and 20px mobile gutters. Reference breakpoints are 640, 768, 1024, and 1280px. Fonts are Host Grotesk (variable, 300–800) and DM Mono (400). Primary colors are white, #0a0b0d, #e4e7ec, #f4f6f9, and #7c3aed. Section padding is 144px on tablet/desktop and 96px on mobile.

Reference behaviors reproduced: word reveals, count-up statistics, scrolling client strip, service hover color, generated dot artwork, staggered desktop projects, dot-to-photo hover, process timeline progress, underlining navigation, native anchor scrolling, budget selection, form validation, and mobile menu opening/closing. The recreation adds keyboard/tap photo reveal, focus trapping, Escape dismissal, honest form delivery states, and image fallbacks without JavaScript or Canvas support.

## Screenshot iteration

Three passes corrected typography, heading wraps, card grids, line heights, button dimensions, contact spacing, and mobile artwork scale. The matching OFL font subsets resolved small word-width differences that changed mobile line wrapping.

Measured section-height differences, Pruven minus reference, in CSS pixels:

| Section | 1440px | 768px | 390px |
| --- | ---: | ---: | ---: |
| Hero | 0 | 0 | 0 |
| Clients | 0 | 0 | 0 |
| Studio | 0 | 0 | 0 |
| Services | 0 | 0 | −1 |
| Work | 0 | +4 | +2 |
| Testimonial | 0 | 0 | 0 |
| Process | 0 | 0 | 0 |
| Contact | 0 | 0 | 0 |
| Footer | −11 | −10 | −7 |

The small footer differences accompany the longer Pruven wordmark and replacement wordmark rendering. These dimensions describe layout alignment, not a claimed pixel-similarity percentage. The rebrand, replacement photographs, and independently implemented animated artwork necessarily differ. The third-party editor badge is deliberately omitted. The interactive `comparison.html` overlays reference and local hero screenshots and switches among all three widths.

## Verification of the original recreation

- `bun install --frozen-lockfile` succeeds.
- `bun run build` succeeds: zero errors, warnings, or hints from Astro/TypeScript; static home/contact pages, sitemap, robots, and 20 responsive image variants generated.
- All seven Playwright tests pass, covering three responsive widths, local asset independence, image focus/tap, mobile menu/keyboard/Escape/anchors, form validation, mocked endpoint failure and success, reduced motion, and JavaScript-disabled rendering.
- Production screenshot captures report zero browser errors and no horizontal overflow at all three widths.
- The design-taste-frontend performance audit passes at 1440px and 390px with **zero failures and zero warnings**. Initial desktop long tasks were corrected by removing per-dot color-string parsing, retaining cached masks, and correcting portrait image sizing.
- Final performance audit: approximately 470 KiB desktop / 186 KiB mobile total transfer across the audited page, 71 KiB gzip JavaScript, 6 KiB gzip CSS, 29 KiB fonts, and zero broken requests. Synthetic local CPU timings are not field Core Web Vitals. Raw results are in `performance.json`.

The design skill's generic section-height, caption, and palette prescriptions were superseded by the explicit instruction to follow the Onda reference. Its performance checker was used; its unrelated generated-layout prescriptions were not applied.

## Assets and deployment boundaries

All runtime assets are local. The original reference's photographs were not reused because their licenses could not be established. Five Unsplash replacements have recorded download URLs and license information under `public/licenses/`. The font subsets are OFL-licensed, with license copies and provenance included. Canvas effects and dotted Pruven lettering are original code. No Modulify package, API, script, or hosting is used by the built site.

Set `SITE_URL` before deployment. A real submission endpoint is optional via `PUBLIC_CONTACT_ENDPOINT`; absent that setting, the contact form opens an email draft and explicitly asks the visitor to send it in their email app. Live email delivery was not tested or configured. The reference business details and illustrative client claims should be replaced with authorized production content before real business publication.

No physical-device or live-backend testing is claimed. Responsive and interaction verification used Chromium/Playwright.

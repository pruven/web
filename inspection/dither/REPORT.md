# Dither redesign

Pruven is a software company with its own experimental products and freelance client work. This change redesigns the existing dither visuals; company content, Zeke, navigation, and the reference-derived page structure remain in place.

## Design

- Graphite point forms and one blue accent replace the pale violet field. Existing accent tokens and terminal highlights use the same blue.
- The hero is an open, folded 3D ribbon. It rotates visibly, changes its folds, and responds to a fine pointer. Its composition stays above the copy and inside the viewport.
- Four service visuals have recognizable geometry and 3.2-second cycles: morphing design frames; scanning code glyphs; layered cloud planes with travelling packets; and an animated data surface. Pointer entry or keyboard focus restarts each loop.
- The footer wordmark remains readable while a wave and blue edge travel through its points on a 6.4-second cycle.
- Every moving scene has a keyboard-accessible pause/resume button. Frames and cards do not move or resize.

`Dither.astro` is the reusable scene component. Geometry is shared between build-time SVG posters and the Canvas renderer. The visibility/pause/reduced-motion lifecycle is taken from the design-taste-frontend skill's `assets/effects/fx.js`; only that lifecycle implementation is vendored, unchanged, without the unused shader/loader code. No skill source files were modified.

Canvas rendering is batched by color and opacity, capped at 30fps and DPR 1.5, and stopped off screen or in a hidden tab. Reduced motion draws a still frame. If JavaScript or Canvas is unavailable, an SVG poster remains visible.

## Validation

- `bun run build`: successful; no Astro/TypeScript errors, warnings, or hints.
- `bun run format:check`: passes. The copied lifecycle implementation is excluded from formatting to preserve its source.
- All **11 Playwright tests pass**. Six scenes are tested at both 1440px and 390px: more than 1.5% of thumbnail pixels must change in one second, every pause button must freeze its canvas, and every scene must resume. Existing responsive, menu, form, clipboard, reduced-motion, and JavaScript-disabled checks pass. A separate test confirms all six posters remain available without Canvas.
- The skill's performance audit passes at 1440px and 390px with **zero failures and zero warnings**. There are no WebGL contexts or broken requests. See `performance.json`; its local synthetic CPU timings are not field Core Web Vitals.
- Raw Chromium screenshots were reviewed at 1440px, 768px, and 390px. They are in `raw/`. The skill layout checker also produced captures at 1024px and 820px in `layout/`.
- `motion.mp4` and `motion.webm` record the hero, pointer response, service loops, and footer.

## Scope and checker limitations

The skill layout checker reports existing reference-layout differences: variable section heights, neighboring sections in its one-screen framing, and inset terminal/right-column form content classified as `edge-left`. Its exact one/two-screen page recipe is not the layout requested for this component-only redesign. The intentional inset terminal and grid columns are not horizontal overflow; the responsive tests verify there is none. Changing those sections would be a separate page redesign.

The skill's `shoot.mjs` exporter produced corrupted green-striped stitched images. Those unusable images were removed; no skill code was changed. Direct Chromium PNGs and the layout checker's raw captures were used for visual review instead.

The full consistency audit was interrupted with exit 130 before producing a report. It is not reported as passing. The build, component motion tests, raw screenshot review, layout audit, and performance audit are the completed checks.

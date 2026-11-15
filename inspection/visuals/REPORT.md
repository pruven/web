# Pruven visual update

Pruven is a software company building experimental products and taking freelance client work. This update keeps the existing Onda-derived layout, Host Grotesk / DM Mono typography, white ground and blue accent.

## Current hero

The user-supplied React Bits GradientASCII source replaces the ribbon illustration. The shader passes, glyph atlas, horizon shape, blue palette, cursor scrambling and click waves are retained in a native Astro adapter; React is not installed. The canvas spans the entire hero, behind its content. A vertical mask and existing white foreground fade remove visible frame edges and keep the text readable at 1440, 768 and 390 px.

The reusable component exposes typed options. Rendering is capped at 30 fps and 1 DPR. The shared motion control pauses the renderer, offscreen and hidden scenes stop, and reduced motion renders a still frame. A static, server-rendered ASCII fallback covers disabled JavaScript, unavailable WebGL2 and context loss. The pause control is hidden when no live animation is available.

The four service illustrations remain animated native SVG with individual pause controls. The footer remains a solid typographic wordmark.

## Visual review

Native Playwright screenshots in this folder cover the hero, services and footer at 1440×900, 768×1024 and 390×844. The hero images were reviewed for blending, text contrast, navigation clearance and mobile overflow. The reference website does not include this user-requested shader treatment, so these images are not pixel-similarity claims.

The earlier full-page skill audit under `../dither/` is historical. Its inherited page-height and layout findings have not been presented as passing or changed as part of this component update. Native Chromium captures are used because the skill's stitched screenshot exporter produced corrupt strips on this host.

## Validation

- `bun run build`: passes, with zero Astro/TypeScript errors, warnings or hints; both static pages generated.
- Prettier check of the changed components, renderer, scripts, styles and tests: passes.
- Native Playwright covers hero/background size equality at 1440, 768 and 390 px, independent local assets, Zeke links and clipboard, keyboard navigation, form states, reduced motion, motion/pause at desktop and mobile, unavailable WebGL, pointer/click shader uniforms, and context-loss fallback.
- Final `TEST_URL=http://localhost:4323 bun run test`: **12 passed**. The desktop animation test permits 90 seconds because repeated full-hero screenshots use software-rendered WebGL in headless Chromium; its final run took 33.2 seconds. This is a test capture allowance, not a claim about real-device frame rate.
- Final skill performance audit at 1440 and 390 px: **0 failures, 0 warnings**. About 128 KiB transferred, two local fonts, one live WebGL context, zero broken requests, and measured layout shift 0.000. This was a single-run local audit. Its fallback timing is a proxy; the report separately records CPU-emulated WebGL cost and does not measure real-GPU frame rate. See `performance.json`.

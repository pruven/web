# Current Pruven visuals

Pruven is a software company building experimental products and taking freelance client work. The existing Onda-derived white layout, Host Grotesk / DM Mono typography, blue accent, service copy and solid footer wordmark remain.

## Hero

The user-supplied GradientASCII shader is mounted natively in Astro as a full-section background, with vertical fades into the white page. It retains cursor scrambling and click waves. The hero releases its context when offscreen and remounts without replaying its intro on return, keeping graphics memory available for the service cards.

## Actual React Bits service effects

The former SVG approximations are replaced by the actual React Bits shader implementations:

| Service | Effect | Source |
| --- | --- | --- |
| Product design | Micro Slats (interpreting “micro stats”) | https://reactbits.dev/backgrounds/micro-slats |
| Web and mobile engineering | Pattern Waves | https://reactbits.dev/backgrounds/pattern-waves |
| Cloud and platforms | Ghost Fibers | https://reactbits.dev/backgrounds/ghost-fibers |
| Data and AI | CRT Warp | https://reactbits.dev/backgrounds/crt-warp |

JavaScript/CSS source was retrieved from the corresponding `https://reactbits.dev/r/{Component}-JS-CSS.json` registry entries. The original shader math is retained. React lifecycle hooks are replaced by native mount functions; no React dependency is installed. Micro Slats and Pattern Waves use OGL 1.0.11. Colors and density are tuned for Pruven's small blue service frames.

Renderers mount on viewport entry and release resources on exit. A shared scheduler caps them at 30 fps, pauses immediately through their controls, suspends hidden tabs and allows an actual completed still frame under reduced motion. Live preference changes remount the appropriate still or animated renderer. Static SVG fallback artwork remains visible without JavaScript or WebGL; unavailable animations hide their controls. The React Bits MIT + Commons Clause license and attribution are stored at `public/licenses/react-bits.txt`; these ports are integrated within Pruven's website.

## Visual review

Captures named `services-{1440,768,390}-{effect}.png` show the actual renderers. Desktop captures were reviewed for the slat field, halftone folds, layered glowing fibers, and CRT plasma/scanlines. The hero, services and footer viewport captures are retained in this directory. These user-requested visuals intentionally differ from the original Onda template; no pixel-identity claim is made.

Earlier whole-page skill checker findings under `../dither/` are historical, including inherited section-height and layout findings. This component update does not present those checks as passing. Native Playwright captures are used because the skill's stitched screenshot exporter produced corrupt strips on this host.

## Validation

The final checks cover responsive layout, local assets, navigation and keyboard behavior, form states, Zeke links and clipboard, no-JavaScript content, hero animation, all four service renderers at three widths, exact paused screenshots, reduced-motion stills and unavailable-WebGL fallbacks. Service animation tests isolate each renderer to avoid concurrent software-shader load distorting screenshot timing; production allows the visible cards to animate together.

Final validation:

- `bun run build`: passes with zero Astro/TypeScript errors, warnings or hints.
- `TEST_URL=http://localhost:4323 bun run test`: **16 passed**. All four service effects render, change over time, freeze when paused and support live reduced-motion changes at 1440, 768 and 390 px. Unavailable WebGL retains visible fallbacks with no browser errors. Existing hero, navigation, product, form and responsive checks also pass.
- Prettier check of all changed application code and tests: passes.
- `git diff --check`: passes.
- Final skill performance audit at 1440 and 390 px: **0 failures, 0 warnings**. About 187 KiB transferred, zero broken requests, layout shift 0.000, at most four live WebGL contexts on desktop (three on mobile), and zero retained contexts at the bottom. `performance.json` contains this run. This single-run local audit separates fallback timing from CPU-emulated WebGL cost and does not measure real-GPU frame rate.

## rtboard product addition

rtboard is now the second product alongside Zeke. Its description and feature list were checked against `https://github.com/pruven/rtboard`; the live app is `https://rtboard.pruven.top/`. The native canvas illustration is a feature preview, not a screenshot or a functioning editor. Product links, studio count, hero copy, contact copy, footer and SEO description now include both products.

Production build passes with zero diagnostics. Five targeted Playwright checks pass: layouts and local assets at 1440, 768 and 390 px, product presentation without JavaScript, and Zeke installation clipboard behavior. The responsive checks assert the rtboard app and repository links. Captures are `rtboard-1440.png`, `rtboard-768.png`, and `rtboard-390.png`; desktop and mobile were visually reviewed.

# Pruven Studio — Astro recreation

Pruven is an experimental software company that builds its own products and takes on freelance software projects for clients. Zeke is its only current product.

This website is a standalone recreation of [the Onda reference](https://onda-template.modulify.website/), built with Astro, TypeScript, Tailwind CSS v4, GSAP ScrollTrigger, Motion, and Lucide. Native Astro components render all page content. No React, hydration islands, Modulify dependencies, remote runtime assets, or hosted APIs are required.

## Run with Bun

```sh
bun install --frozen-lockfile
bun run dev
```

Open `http://localhost:4321`.

```sh
bun run check   # Astro and TypeScript diagnostics
bun run build   # Checks, static pages, and optimized images → dist/
bun run preview # Serve the production build
bunx playwright install chromium
bun run test
```

The project uses Astro's supported Node runtime (Node 22.12+; Node 24+ recommended), with Bun as the package manager and task runner. Versions are pinned by `bun.lock`.

## Production configuration

Copy `.env.example` to `.env` and set `SITE_URL` to the deployment's public origin before building. This controls canonical URLs, Open Graph URLs, robots.txt, and sitemap.xml. Deploy `dist/` to any static host. Both `/` and `/contact/` are generated.

`PUBLIC_CONTACT_ENDPOINT` optionally connects the form to an HTTP endpoint accepting a JSON POST with `name`, `email`, `company`, `budget`, and `message`. Return an HTTP 2xx response only after accepting the message. The UI handles pending, success, validation, and failure states. The endpoint must implement its own validation and rate limiting; never put secrets in a `PUBLIC_` variable.

Without an endpoint, submitting the validated form opens an email draft in the visitor's mail app. The status explicitly explains that the visitor must send the draft; the site never reports delivery without an endpoint response. This makes the static site usable locally without pretending that a backend exists.

Pruven currently has one product: [Zeke](https://zeke.pruven.top/), a Git hook that copies missing, ignored environment files into new worktrees. The template’s fictional clients, projects, statistics, testimonial, founding date, address, and phone number have been removed. The product section shows a native HTML terminal with documented Bun installation commands and a copy button. Confirm the contact email before publishing.

## Structure

- `src/components/`: individual sections, navigation, buttons, typography, tags, and SVG illustrations.
- `src/data/studio.ts`: typed service and process content.
- `src/styles/global.css`: reference-derived dimensions, typography, colors, responsive grids, and interaction styles.
- `src/components/HeroVisual.astro`: the supplied GradientASCII effect as a full-bleed hero background with soft vertical fades.
- `src/components/ServiceVisual.astro`: Micro Slats, Pattern Waves, Ghost Fibers and CRT Warp effect slots with static SVG fallbacks.
- `src/components/VisualFrame.astro`: shared accessible motion controls.
- `src/components/GradientASCII.astro`: reusable shader container with a static ASCII fallback.
- `src/vendor/gradient-ascii.js`: native DOM adaptation of the user-supplied React Bits shader, with no React dependency.
- `src/scripts/gradient-ascii.ts`: mounts and disposes the hero renderer.
- `src/scripts/service-effects.ts`: lazily loads the four service renderers, cleans up GPU resources and remounts stills when reduced motion changes.
- `src/vendor/scene-scheduler.ts`: shared renderer scheduling, pause control and frame-rate cap.
- `src/scripts/visuals.ts`: visibility, pause/resume, and reduced-motion handling for native CSS animations.
- `src/scripts/site.ts`: GSAP reveals and counts, Motion mobile navigation, accessible menu state, and form behavior.
- `src/data/product.ts`: the current product, documentation URL, description, and copyable installation commands.
- `public/fonts/`: self-hosted, Latin-subset WOFF2 fonts.
- `public/licenses/`: font licenses and provenance.
- `tests/`: Playwright checks for breakpoints, navigation, Zeke links and clipboard behavior, form states, asset independence, and reduced motion.
- `inspection/`: reference and local screenshots, measurements, and visual review notes.

## Visual verification

With the local site running:

```sh
bun run test:visual
bun run test:visual --reference
```

The second command inspects the live reference using Playwright and captures both versions. Screenshots cover 1440×900, 768×1024, and 390×844, with individual sections, full pages, section dimensions, font state, and browser errors. To capture another local port, set `CAPTURE_URL=http://localhost:4322`.

Motion respects `prefers-reduced-motion` and pauses off-screen scenes and hidden tabs. Every animated scene has a keyboard-accessible pause button. The hero uses one WebGL2 canvas with pointer scrambling and click waves, capped at 30 fps and 1 DPR. Its static ASCII fallback stays visible without JavaScript or WebGL; service cards use the actual React Bits WebGL renderers with static SVG fallbacks. Renderers mount on viewport entry and release their contexts on exit; the hero also releases its offscreen context. Reduced motion renders a single still frame. The footer is a solid typographic wordmark. Native anchor scrolling matches the reference without adding Lenis. The product terminal stays readable without JavaScript.

## Assets and fidelity

Host Grotesk and DM Mono are licensed under SIL OFL 1.1. The matching Latin subsets are stored locally; license files are included. Lucide icons use the ISC license. No stock photography is used in the current product presentation. No reference photographs or proprietary animation implementations are redistributed.

React Bits components are used within this website under the MIT + Commons Clause license; attribution and the full terms are in `public/licenses/react-bits.txt`. Their shader source is adapted to native DOM mounts, with OGL used for Micro Slats and Pattern Waves. No React runtime is installed.

The layout follows the reference, with the user-supplied GradientASCII hero, Micro Slats, Pattern Waves, Ghost Fibers and CRT Warp service cards, and a solid footer wordmark. Every animated scene has a pause button, and the service renderers are capped at 30 fps and native pixel density. The single-product content and replacement artwork intentionally differ; animated frames cannot have an exact pixel identity. The reference's third-party editor badge is omitted. See `inspection/REPORT.md` for the measured comparison and validation results.

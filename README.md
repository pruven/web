# Pruven Studio — Astro recreation

Pruven is a standalone recreation of [the Onda reference](https://onda-template.modulify.website/), built with Astro, TypeScript, Tailwind CSS v4, GSAP ScrollTrigger, Motion, and Lucide. Native Astro components render all page content. No React, hydration islands, Modulify dependencies, remote runtime assets, or hosted APIs are required.

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

The studio details, client names, results, and testimonial reproduce illustrative reference content. Replace these with authorized business details and claims before publishing a real studio website. The portrait is a replacement stock image, not a verified image of the named speaker.

## Structure

- `src/components/`: individual sections, navigation, buttons, typography, tags, and halftone image component.
- `src/data/studio.ts`: typed service and process content.
- `src/styles/global.css`: reference-derived dimensions, typography, colors, responsive grids, and interaction styles.
- `src/scripts/art.ts`: original Canvas 2D cloth, service diagrams, image halftones, and dotted wordmark.
- `src/scripts/site.ts`: GSAP reveals and counts, Motion mobile navigation, accessible menu state, and form behavior.
- `src/assets/`: local source photographs; Astro generates responsive WebP variants.
- `public/fonts/`: self-hosted, Latin-subset WOFF2 fonts.
- `public/licenses/`: font licenses and image provenance.
- `tests/`: Playwright checks for breakpoints, navigation, keyboard/touch image reveal, form states, asset independence, and reduced motion.
- `inspection/`: reference and local screenshots, measurements, and visual review notes.

## Visual verification

With the local site running:

```sh
bun run test:visual
bun run test:visual --reference
```

The second command inspects the live reference using Playwright and captures both versions. Screenshots cover 1440×900, 768×1024, and 390×844, with individual sections, full pages, section dimensions, font state, and browser errors. To capture another local port, set `CAPTURE_URL=http://localhost:4322`.

Motion respects `prefers-reduced-motion`, pauses off-screen canvas rendering, caps rendering at 20 fps and device pixel ratio at 1.5, and keeps static content readable without JavaScript. Native anchor scrolling matches the reference without adding Lenis. Keyboard focus and touch taps reveal project photos as well as mouse hover.

## Assets and fidelity

Host Grotesk and DM Mono are licensed under SIL OFL 1.1. The matching Latin subsets are stored locally; license files are included. Lucide icons use the ISC license. Replacement photographs are downloaded from Unsplash under the [Unsplash License](https://unsplash.com/license); exact download URLs are recorded in `public/licenses/images.json`. No reference photographs or proprietary animation implementations are redistributed.

The layout, content, and motion timing follow the reference. Photographs and the original procedural artwork intentionally differ; animated frames cannot have an exact pixel identity. The reference's third-party editor badge is omitted. See `inspection/REPORT.md` for the measured comparison and validation results.

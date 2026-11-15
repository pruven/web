import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

// Explicit Playwright reference inspection and repeatable screenshot comparison.
const browser = await chromium.launch({ headless: true });
const includeReference = process.argv.includes('--reference');
const targets = includeReference
  ? [
      ['reference', 'https://onda-template.modulify.website/'],
      ['local', process.env.CAPTURE_URL || 'http://localhost:4321/'],
    ]
  : [['local', process.env.CAPTURE_URL || 'http://localhost:4321/']];
try {
  for (const [name, url] of targets) {
    await mkdir(`inspection/${name}`, { recursive: true });
    for (const [width, height] of [
      [1440, 900],
      [768, 1024],
      [390, 844],
    ]) {
      const page = await browser.newPage({
        viewport: { width, height },
        deviceScaleFactor: 1,
      });
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1800);
      await page.screenshot({ path: `inspection/${name}/${width}-hero.png` });
      for (const id of [
        'studio',
        'services',
        'work',
        'testimonial',
        'process',
        'contact',
      ]) {
        await page.locator(`#${id}`).evaluate((el) =>
          window.scrollTo({
            top: el.getBoundingClientRect().top + scrollY,
            behavior: 'instant',
          }),
        );
        await page.waitForTimeout(1800);
        await page.screenshot({
          path: `inspection/${name}/${width}-${id}.png`,
        });
      }
      // Trigger all reveals before taking the full-page image.
      for (
        let y = 0;
        y < (await page.locator('body').evaluate((el) => el.scrollHeight));
        y += height * 0.7
      ) {
        await page.evaluate(
          (y) => window.scrollTo({ top: y, behavior: 'instant' }),
          y,
        );
        await page.waitForTimeout(80);
      }
      await page.waitForTimeout(2000);
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: 'instant' }),
      );
      await page.screenshot({
        path: `inspection/${name}/${width}-full.png`,
        fullPage: true,
      });
      const measurements = await page.evaluate(() => ({
        width: innerWidth,
        height: innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        sections: [...document.querySelectorAll('main>section,footer')].map(
          (el) => ({
            id: el.id || el.tagName.toLowerCase(),
            y: el.offsetTop,
            height: el.offsetHeight,
          }),
        ),
        fonts: [...document.fonts].map((f) => ({
          family: f.family,
          status: f.status,
        })),
      }));
      await writeFile(
        `inspection/${name}/${width}-metrics.json`,
        JSON.stringify({ ...measurements, errors }, null, 2),
      );
      console.log(
        `${name}: ${width} captured; ${errors.length} browser errors`,
      );
      await page.close();
    }
  }
} finally {
  await browser.close();
}

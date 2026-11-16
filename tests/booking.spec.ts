import { test, expect } from '@playwright/test';
const embed = 'https://app.cal.com/embed/embed.js';
const booking = 'https://cal.com/lossstheaven/15min';
for (const width of [1440, 390]) {
  test(`project buttons request the Cal popup at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    let scripts = 0;
    await page.route(embed, (route) => {
      scripts++;
      return route.fulfill({
        contentType: 'application/javascript',
        body: `window.calCalls = [...window.Cal.q]; window.Cal.q.push = (...calls) => { window.calCalls.push(...calls); return window.calCalls.length; };`,
      });
    });
    await page.goto('/');
    expect(scripts).toBe(0);
    if (width === 390) {
      await page.locator('.menu-toggle').click();
      await page.locator('#mobile-menu [data-booking-trigger=true]').click();
      await expect(page.locator('#mobile-menu')).toBeHidden();
      await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    } else await page.locator('.header-cta').click();
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as Window & { calCalls?: unknown[] }).calCalls,
        ),
      )
      .toEqual([
        ['init', { origin: 'https://cal.com' }],
        [
          'ui',
          {
            theme: 'light',
            cssVarsPerTheme: { light: { 'cal-brand': '#315efb' } },
          },
        ],
        [
          'modal',
          {
            calLink: 'lossstheaven/15min',
            config: { layout: 'month_view', theme: 'light' },
          },
        ],
      ]);
    await page.locator('.hero [data-booking-trigger]').click();
    expect(scripts).toBe(1);
    await page.locator('footer [data-booking-trigger=hello]').click();
    await expect
      .poll(() =>
        page.evaluate(() =>
          (window as Window & { calCalls?: unknown[][] }).calCalls?.at(-1),
        ),
      )
      .toEqual([
        'modal',
        {
          calLink: 'lossstheaven/hello',
          config: { layout: 'month_view', theme: 'light' },
        },
      ]);
    expect(scripts).toBe(1);
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    await expect(page).toHaveURL('/');
    for (const trigger of await page
      .locator('[data-booking-trigger]:not([data-booking-trigger=hello])')
      .all()) {
      await expect(trigger).toHaveAttribute('href', booking);
      await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    }
  });
}
test('project booking falls back to its URL if the embed cannot load', async ({
  page,
}) => {
  await page.route(embed, (route) => route.abort());
  await page.route(booking, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<h1>Booking fallback</h1>',
    }),
  );
  await page.goto('/');
  await page.locator('.header-cta').click();
  await expect(page).toHaveURL(booking);
});

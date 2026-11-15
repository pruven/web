import { test, expect } from '@playwright/test';

for (const width of [1440, 768, 390]) {
  test(`responsive layout and local assets at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1024 });
    const errors: string[] = [];
    const external: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('request', (r) => {
      if (
        !r.url().startsWith(process.env.TEST_URL || 'http://localhost:4321') &&
        !r.url().startsWith('data:')
      )
        external.push(r.url());
    });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      'Software in motion.',
    );
    for (const id of ['studio', 'services', 'work', 'process', 'contact'])
      await expect(page.locator(`#${id}`)).toBeAttached();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.locator('#work').scrollIntoViewIfNeeded();
    await expect(page.locator('.zeke-product')).toHaveCount(1);
    await expect(
      page.getByRole('heading', { name: 'Zeke', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'View Zeke', exact: true }),
    ).toHaveAttribute('href', 'https://zeke.pruven.top/');
    await expect(page.locator('#testimonial, #clients')).toHaveCount(0);
    await page.evaluate(() =>
      document.querySelector('footer')?.scrollIntoView(),
    );
    await page.waitForTimeout(400);
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
  });
}

test('mobile navigation supports keyboard, escape, and anchor close', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.locator('.menu-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page
    .getByRole('navigation', { name: 'Mobile', exact: true })
    .getByRole('link', { name: 'Services' })
    .click();
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await expect(page).toHaveURL(/#services$/);
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('form validates and supports real endpoint success and failure', async ({
  page,
}) => {
  await page.goto('/contact');
  const form = page.locator('#contact-form');
  await form.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('#contact-name')).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await expect(page.locator('#contact-name')).toBeFocused();
  await page.getByLabel('Your name').fill('Alex Example');
  await page.getByLabel('Work email').fill('alex@example.com');
  await page
    .getByLabel('About your project')
    .fill('An accessible booking application.');
  await page.getByLabel('€25k to €75k', { exact: true }).check();
  await page.route('**/test-contact', (route) =>
    route.fulfill({ status: 500, body: '{}' }),
  );
  await form.evaluate((el) =>
    el.setAttribute('data-endpoint', '/test-contact'),
  );
  await form.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('status')).toContainText('could not be sent');
  await page.unroute('**/test-contact');
  let payload: Record<string, string> = {};
  await page.route('**/test-contact', async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({ status: 200, body: '{}' });
  });
  await form.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('status')).toContainText('has been sent');
  expect(payload.budget).toBe('€25k to €75k');
  expect(payload.email).toBe('alex@example.com');
});

test('reduced motion keeps all content visible and freezes canvas', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const canvas = page.locator('.hero-art');
  const before = await canvas.evaluate((el: HTMLCanvasElement) =>
    el.toDataURL(),
  );
  await page.waitForTimeout(300);
  expect(await canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL())).toBe(
    before,
  );
  for (const el of await page.locator('.word,.reveal').all())
    await expect(el).toHaveCSS('opacity', '1');
});

test('product details remain visible without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(process.env.TEST_URL || 'http://localhost:4321');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.terminal-content')).toContainText(
    'bun add --dev @pruven/zeke',
  );
  await expect(page.locator('[data-count="1"]')).toHaveText('1');
  await context.close();
});

test('copies the documented Bun installation commands', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (text: string) => {
          (window as Window & { copied?: string }).copied = text;
        },
      },
    });
  });
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Copy Zeke installation commands' })
    .click();
  await expect(page.locator('[data-copy-status]')).toContainText(
    'commands copied',
  );
  expect(
    await page.evaluate(() => (window as Window & { copied?: string }).copied),
  ).toBe('bun add --dev @pruven/zeke\nbun --bun zeke install');
});

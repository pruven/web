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
    const heroBounds = await page.locator('.hero').boundingBox();
    const visualBounds = await page.locator('.hero-visual').boundingBox();
    expect(visualBounds?.width).toBe(heroBounds?.width);
    expect(visualBounds?.height).toBe(heroBounds?.height);
    expect(visualBounds?.x).toBe(heroBounds?.x);
    expect(visualBounds?.y).toBe(heroBounds?.y);
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

test('reduced motion keeps all content visible and freezes visuals', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('[data-gradient-ascii]')).toHaveAttribute(
    'data-ascii-status',
    'ready',
  );
  await page.waitForTimeout(300);
  const visual = page.locator('.hero-visual');
  const before = await visual.screenshot();
  await page.waitForTimeout(300);
  expect((await visual.screenshot()).equals(before)).toBe(true);
  for (const scene of await page.locator('[data-visual-motion]').all()) {
    await expect(scene).toHaveAttribute('data-motion-state', 'still');
    await expect(scene.getByRole('button')).toBeHidden();
  }
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

for (const width of [1440, 390]) {
  test(`hero animates and pauses at ${width}px`, async ({ page }) => {
    test.setTimeout(90_000); // Full-hero WebGL screenshots use Chromium's CPU renderer in CI.
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('[data-gradient-ascii]')).toHaveAttribute(
      'data-ascii-status',
      'ready',
    );
    const scenes = page.locator('[data-visual-motion=hero]');
    await expect(scenes).toHaveCount(1);
    for (const scene of await scenes.all()) {
      await scene.evaluate((el) =>
        window.scrollTo({
          top: el.getBoundingClientRect().top + scrollY - 100,
          behavior: 'instant',
        }),
      );
      await expect(scene).toHaveAttribute('data-motion-state', 'playing');
      if (await scene.locator('[data-service-effect]').count())
        await expect(scene.locator('[data-service-effect]')).toHaveAttribute(
          'data-effect-status',
          'ready',
          { timeout: 20_000 },
        );
      const before = await scene.screenshot({ animations: 'allow' });
      await page.waitForTimeout(800);
      expect(
        (await scene.screenshot({ animations: 'allow' })).equals(before),
      ).toBe(false);
      const button = scene.getByRole('button');
      await button.click();
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      await page.waitForTimeout(180);
      const frozen = await scene.screenshot({ animations: 'allow' });
      await page.waitForTimeout(200);
      expect(
        (await scene.screenshot({ animations: 'allow' })).equals(frozen),
      ).toBe(true);
      await button.click();
      await expect(button).toHaveAttribute('aria-pressed', 'false');
    }
  });
}

test('ASCII hero has a static fallback when WebGL is unavailable', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: () => null,
    }),
  );
  await page.goto('/');
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.locator('[data-gradient-ascii]')).toHaveAttribute(
    'data-ascii-status',
    'fallback',
  );
  await expect(page.locator('.gradient-ascii-fallback')).toBeVisible();
  await expect(page.locator('[data-dither]')).toHaveCount(0);
  await expect(page.locator('.service-effect>svg')).toHaveCount(4);
  await expect(page.locator('.footer-wordmark text')).toHaveText('pruven');
});

test('ASCII responds to pointer input and recovers from context loss', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const names = new WeakMap<WebGLUniformLocation, string>();
    const prototype = WebGL2RenderingContext.prototype;
    const getLocation = prototype.getUniformLocation;
    const setVector = prototype.uniform4fv;
    prototype.getUniformLocation = function (program, name) {
      const location = getLocation.call(this, program, name);
      if (location) names.set(location, name);
      return location;
    };
    prototype.uniform4fv = function (location, values, ...rest) {
      const name = location ? names.get(location) : '';
      const vector = Array.from(values);
      const state = window as Window & {
        asciiPointer?: boolean;
        asciiClick?: boolean;
      };
      if (name === 'uTrail' && Number(vector[2]) > 0) state.asciiPointer = true;
      if (name === 'uClicks' && Number(vector[3]) > 0) state.asciiClick = true;
      return setVector.call(this, location, values, ...rest);
    };
  });
  await page.goto('/');
  const effect = page.locator('[data-gradient-ascii]');
  await expect(effect).toHaveAttribute('data-ascii-status', 'ready');
  const bounds = await effect.boundingBox();
  if (!bounds) throw new Error('ASCII hero has no dimensions');
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.move(
    bounds.x + bounds.width / 2 + 30,
    bounds.y + bounds.height / 2,
    { steps: 5 },
  );
  await page.mouse.click(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = window as Window & {
          asciiPointer?: boolean;
          asciiClick?: boolean;
        };
        return !!state.asciiPointer && !!state.asciiClick;
      }),
    )
    .toBe(true);
  await effect.locator('canvas').evaluate((canvas) => {
    (canvas as HTMLCanvasElement)
      .getContext('webgl2')
      ?.getExtension('WEBGL_lose_context')
      ?.loseContext();
  });
  await expect(effect).toHaveAttribute('data-ascii-status', 'fallback');
  await expect(effect.locator('.gradient-ascii-fallback')).toBeVisible();
  await expect(page.locator('#hero-visual button')).toBeHidden();
});

for (const width of [1440, 768, 390]) {
  test(`service effects render, move, and pause at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1024 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    const kinds = ['micro-slats', 'pattern-waves', 'ghost-fibers', 'crt-warp'];
    const scenes = page.locator('.service-illustration');
    await expect(scenes).toHaveCount(4);
    // Isolate each animation so concurrent software shaders do not distort screenshot timing.
    await scenes.evaluateAll((elements) =>
      elements.forEach((element) =>
        element.querySelector<HTMLButtonElement>('button')?.click(),
      ),
    );
    for (const [i, kind] of kinds.entries()) {
      const scene = scenes.nth(i);
      await expect(scene.locator('[data-service-effect]')).toHaveAttribute(
        'data-service-effect',
        kind,
      );
      await scene.scrollIntoViewIfNeeded();
      await scene.getByRole('button').click();
      await expect(scene).toHaveAttribute('data-motion-state', 'playing');
      if (await scene.locator('[data-service-effect]').count())
        await expect(scene.locator('[data-service-effect]')).toHaveAttribute(
          'data-effect-status',
          'ready',
          { timeout: 20_000 },
        );
      await expect(scene.locator('canvas')).toBeVisible();
      await expect(scene.locator('.service-effect>svg')).toBeHidden();
      await page.mouse.move(0, 0);
      const clip = await scene.boundingBox();
      if (!clip) throw new Error('Missing service visual bounds');
      const capture = (path?: string) =>
        page.screenshot({ clip, animations: 'allow', path });
      const before = await capture();
      await page.waitForTimeout(450);
      expect((await capture()).equals(before)).toBe(false);
      const pause = scene.getByRole('button');
      await pause.click();
      await expect(pause).toHaveAttribute('aria-pressed', 'true');
      await page.mouse.move(0, 0);
      await page.waitForTimeout(180);
      const frozen = await capture(
        `inspection/visuals/services-${width}-${kind}.png`,
      );
      await page.waitForTimeout(220);
      expect((await capture()).equals(frozen)).toBe(true);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const scene of await scenes.all()) {
      await expect(scene).toHaveAttribute('data-motion-state', 'still');
      await expect(scene.getByRole('button')).toBeHidden();
    }
    const last = scenes.last();
    await expect(last.locator('[data-service-effect]')).toHaveAttribute(
      'data-effect-status',
      'ready',
    );
    const lastClip = await last.boundingBox();
    if (!lastClip) throw new Error('Missing final service visual bounds');
    const still = await page.screenshot({ clip: lastClip });
    await page.waitForTimeout(250);
    expect((await page.screenshot({ clip: lastClip })).equals(still)).toBe(
      true,
    );
  });
}

test('service renderers retain their fallback without WebGL', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: () => null,
    }),
  );
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/');
  for (const scene of await page.locator('.service-illustration').all()) {
    await scene.scrollIntoViewIfNeeded();
    await expect(scene.locator('[data-service-effect]')).toHaveAttribute(
      'data-effect-status',
      'unavailable',
    );
    await expect(scene.locator('.service-effect>svg')).toBeVisible();
    await expect(scene.getByRole('button')).toBeHidden();
  }
  expect(errors).toEqual([]);
});

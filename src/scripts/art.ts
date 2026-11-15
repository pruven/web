/** Original Canvas 2D artwork. No reference scripts, shaders or APIs are used. */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
type Art = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  visible: boolean;
  type: string;
  draw: (time: number) => void;
  mask?: { pixels: Uint8ClampedArray; width: number; height: number };
};
const artworks: Art[] = [];
const clamp = (n: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));

function setup(canvas: HTMLCanvasElement): Art | undefined {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const art: Art = {
    canvas,
    ctx,
    width: 0,
    height: 0,
    visible: false,
    type: canvas.dataset.art || 'photo',
    draw: () => {},
  };
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    art.width = Math.round(width);
    art.height = Math.round(height);
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    art.draw(reduced.matches ? 0 : performance.now() / 1000);
  };
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(
    (entries) => {
      art.visible = entries[0].isIntersecting;
      if (art.visible) art.draw(reduced.matches ? 0 : performance.now() / 1000);
    },
    { rootMargin: '120px' },
  ).observe(canvas);
  artworks.push(art);
  return art;
}

function dot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  strength: number,
) {
  ctx.globalAlpha = clamp(strength);
  ctx.fillRect(x - size / 2, y - size / 2, size, size);
}

function procedural(art: Art, time: number) {
  const { ctx, width: w, height: h, type } = art;
  if (!w || !h) return;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#7c3aed';
  ctx.globalAlpha = 1;
  const step =
    type === 'silk' ? (w < 640 ? 5 : 8) : type === 'wordmark' ? 6 : 5;
  const t = time * 0.18;
  if (type === 'wordmark') {
    if (!art.mask || art.mask.width !== w || art.mask.height !== h) {
      const mask = document.createElement('canvas');
      mask.width = w;
      mask.height = h;
      const m = mask.getContext('2d', { willReadFrequently: true });
      if (!m) return;
      m.fillStyle = '#000';
      m.font = `500 ${h * 1.13}px "Host Grotesk Variable"`;
      m.textBaseline = 'alphabetic';
      m.fillText('pruven', w * 0.015, h * 0.8, w * 0.97);
      art.mask = {
        pixels: m.getImageData(0, 0, w, h).data,
        width: w,
        height: h,
      };
    }
    const pixels = art.mask.pixels;
    for (let y = 3; y < h; y += step)
      for (let x = 3; x < w; x += step) {
        const alpha = pixels[(Math.floor(y) * w + Math.floor(x)) * 4 + 3] / 255;
        const ripple = 0.65 + 0.35 * Math.sin((x / w) * 8 - (y / h) * 4 + t);
        if (alpha > 0.1) dot(ctx, x, y, step * 0.83, alpha * ripple);
      }
    return;
  }
  for (let y = step / 2; y < h; y += step)
    for (let x = step / 2; x < w; x += step) {
      const nx = x / w,
        ny = y / (type === 'silk' ? Math.min(h, w * 1.35) : h);
      let value = 0;
      if (type === 'silk') {
        const center = 0.96 - 1.05 * nx + 0.055 * Math.sin(nx * 8 + t);
        const breadth = 0.075 + 0.105 * Math.pow(Math.sin(nx * Math.PI), 2);
        const d = (ny - center) / breadth;
        const envelope = Math.exp(-Math.pow(d / 1.3, 4));
        const ridge = Math.exp(
          -Math.pow((d + 0.5 + 0.3 * Math.sin(nx * 9 + t)) / 0.3, 2),
        );
        const fold = Math.exp(-Math.pow((d - 0.28) / 0.55, 2));
        value = envelope * (0.16 + 0.7 * ridge + 0.32 * fold);
        const secondCenter =
          0.68 - 0.32 * nx + 0.12 * Math.sin(nx * 6 + t * 0.7);
        const secondary =
          Math.exp(-Math.pow((ny - secondCenter) / 0.07, 2)) *
          Math.exp(-Math.pow((nx - 0.67) / 0.32, 2));
        value = Math.max(value, secondary * 0.65);
        const bottomFade = clamp((1 - ny) / 0.28);
        value *=
          bottomFade *
          (w < 640 ? clamp((nx + 0.15) / 0.25) : clamp((nx - 0.14) / 0.18));
        const s = 0.55 + Math.pow(clamp(value), 0.65) * (step - 1.9);
        dot(ctx, x, y, s, 0.13 + value * 0.87);
        continue;
      }
      if (type === 'orbit') {
        const px = (x - w / 2) / Math.min(w, h),
          py = (y - h / 2) / Math.min(w, h);
        const r = Math.hypot(px, py),
          angle = Math.atan2(py, px);
        const radius = 0.33 + 0.025 * Math.sin(angle * 3 + t * 2);
        value =
          Math.exp(-Math.pow((r - radius) / 0.025, 2)) *
          (0.5 + 0.5 * Math.sin(angle * 2 + t));
        value = Math.max(
          value,
          0.22 * Math.exp(-Math.pow((r - 0.16) / 0.022, 2)),
        );
      } else if (type === 'code') {
        const row = Math.floor(y / 18),
          col = Math.floor(x / 5);
        const shift = Math.floor(Math.sin(row * 91.37) * 1000);
        value =
          Math.sin((col + shift) * 0.8 + Math.floor(t)) > 0.4 &&
          Math.sin(row * 37.4 + col * 0.045) > 0.1 &&
          y % 18 < 5
            ? 0.3 + 0.6 * Math.abs(Math.sin(row * 3.1))
            : 0;
      } else if (type === 'cloud') {
        const dx = (nx - 0.5) * 1.1,
          dy = ny - 0.5;
        const r = Math.hypot(dx, dy);
        const rings = Math.pow(Math.max(0, Math.cos(r * 55 - t * 2)), 14);
        value =
          r < 0.38
            ? rings *
              (0.4 + 0.6 * Math.abs(Math.sin(nx * 8 + t))) *
              clamp((0.4 - r) * 8)
            : 0;
      } else if (type === 'data') {
        const dx = nx - 0.5,
          dy = ny - 0.5;
        const wave =
          0.5 + 0.14 * Math.sin(nx * 15 + t * 3) + 0.06 * Math.sin(nx * 31 - t);
        value = Math.exp(-Math.pow((ny - wave) / 0.045, 2)) * 0.8;
        for (let k = 0; k < 5; k++) {
          const px = 0.16 + k * 0.17,
            py =
              0.5 +
              0.14 * Math.sin(px * 15 + t * 3) +
              0.06 * Math.sin(px * 31 - t);
          value = Math.max(
            value,
            Math.exp(-((nx - px) ** 2 + (ny - py) ** 2) / 0.002),
          );
        }
        value = Math.max(value, 0.1 * Math.exp(-(dx * dx + dy * dy) * 5));
      }
      dot(ctx, x, y, 0.4 + Math.sqrt(value) * 3.9, 0.12 + value * 0.88);
    }
}

function initPhoto(canvas: HTMLCanvasElement) {
  const art = setup(canvas);
  if (!art) return;
  const img = canvas.parentElement?.querySelector('img');
  if (!img) return;
  let mask: HTMLCanvasElement | undefined;
  let cachedWidth = 0,
    cachedHeight = 0;
  art.draw = () => {
    const { width: w, height: h, ctx } = art;
    ctx.fillStyle = '#7c3aed';
    ctx.globalAlpha = 1;
    if (!img.complete || !img.naturalWidth || !w || !h) return;
    if (mask && cachedWidth === w && cachedHeight === h) {
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(mask, 0, 0, w, h);
      return;
    }
    const source = document.createElement('canvas');
    source.width = w;
    source.height = h;
    const s = source.getContext('2d', { willReadFrequently: true });
    if (!s) return;
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const iw = img.naturalWidth * scale,
      ih = img.naturalHeight * scale;
    const position = getComputedStyle(img)
      .objectPosition.split(' ')
      .map((v) => parseFloat(v) / 100);
    s.drawImage(
      img,
      (w - iw) * (position[0] || 0.5),
      (h - ih) * (position[1] || 0.5),
      iw,
      ih,
    );
    const pixels = s.getImageData(0, 0, w, h).data;
    ctx.clearRect(0, 0, w, h);
    const step = w > 700 ? 6 : 5;
    for (let y = step / 2; y < h; y += step)
      for (let x = step / 2; x < w; x += step) {
        const idx = (Math.floor(y) * w + Math.floor(x)) * 4;
        const luminance =
          (pixels[idx] * 0.2126 +
            pixels[idx + 1] * 0.7152 +
            pixels[idx + 2] * 0.0722) /
          255;
        const strength = Math.pow(1 - luminance, 1.35);
        const size = 0.45 + strength * (step - 0.9);
        dot(ctx, x, y, size, 0.2 + strength * 0.8);
      }
    ctx.globalAlpha = 1;
    mask = document.createElement('canvas');
    mask.width = canvas.width;
    mask.height = canvas.height;
    mask.getContext('2d')?.drawImage(canvas, 0, 0);
    cachedWidth = w;
    cachedHeight = h;
    canvas.parentElement?.classList.add('is-ready');
  };
  img.addEventListener('load', () => art.draw(0));
  img
    .decode()
    .then(() => art.draw(0))
    .catch(() => {});
  const parent = canvas.parentElement;
  const togglePhoto = () => {
    if (!parent) return;
    const revealed = parent.classList.toggle('is-revealed');
    parent.setAttribute('aria-pressed', String(revealed));
  };
  parent?.addEventListener('click', togglePhoto);
  parent?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      togglePhoto();
    }
  });
}

export function initArt() {
  document
    .querySelectorAll<HTMLCanvasElement>('canvas[data-art]')
    .forEach((canvas) => {
      const art = setup(canvas);
      if (art) art.draw = (time) => procedural(art, time);
    });
  document
    .querySelectorAll<HTMLCanvasElement>('canvas[data-halftone]')
    .forEach(initPhoto);
  document.fonts.ready.then(() =>
    artworks.forEach((a) => {
      if (a.type === 'wordmark') delete a.mask;
      a.draw(0);
    }),
  );
  let last = 0;
  const frame = (now: number) => {
    requestAnimationFrame(frame);
    if (reduced.matches || document.hidden || now - last < 50) return;
    last = now;
    for (const art of artworks)
      if (art.visible && art.type !== 'photo') art.draw(now / 1000);
  };
  requestAnimationFrame(frame);
  reduced.addEventListener('change', () => artworks.forEach((a) => a.draw(0)));
}

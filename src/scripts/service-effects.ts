const renderers = {
  'micro-slats': () =>
    import('../vendor/micro-slats.js').then((m) => m.mountMicroSlats),
  'pattern-waves': () =>
    import('../vendor/pattern-waves.js').then((m) => m.mountPatternWaves),
  'ghost-fibers': () =>
    import('../vendor/ghost-fibers.js').then((m) => m.mountGhostFibers),
  'crt-warp': () => import('../vendor/crt-warp.js').then((m) => m.mountCRTWarp),
};
type Effect = keyof typeof renderers;
const options: Record<Effect, Record<string, unknown>> = {
  'micro-slats': {
    color: '#315efb',
    glintColor: '#b9e9ff',
    backgroundColor: '#edf3ff',
    slatWidth: 5,
    slatHeight: 14,
    gap: 3,
    speed: 0.55,
    perspective: 0.65,
    intro: false,
    cursorStrength: 0.65,
  },
  'pattern-waves': {
    color: '#315efb',
    backgroundColor: '#edf3ff',
    spacing: 8,
    markSize: 0.9,
    contrast: 0.9,
    speed: 0.45,
    intro: false,
  },
  'ghost-fibers': {
    glowColor: '#75baff',
    lineColor: '#c1e5ff',
    secondaryColor: '#315efb',
    threads: 32,
    density: 0.65,
    particles: 0.15,
    layers: 2,
    glow: 0.55,
    grain: 0.025,
    intro: false,
    dpr: 1,
  },
  'crt-warp': {
    color: '#7cbaff',
    backgroundColor: '#101e32',
    columns: 48,
    scanlineFrequency: 160,
    bloom: 0.8,
    flicker: 0.05,
    noise: 0.035,
    intro: false,
    dpr: 1,
    fps: 30,
  },
};
export function initServiceEffects() {
  document
    .querySelectorAll<HTMLElement>('[data-service-effect]')
    .forEach((host) => {
      const kind = host.dataset.serviceEffect as Effect;
      if (!(kind in renderers)) return;
      const reduced = matchMedia('(prefers-reduced-motion: reduce)');
      let visible = false;
      let generation = 0;
      let dispose: (() => void) | undefined;
      const stop = () => {
        generation++;
        dispose?.();
        dispose = undefined;
        host.dataset.effectStatus = 'fallback';
      };
      const start = async () => {
        stop();
        if (!visible) return;
        const version = generation;
        try {
          const mount = await renderers[kind]();
          if (generation !== version || !visible) return;
          if (kind === 'ghost-fibers') {
            const canvas = document.createElement('canvas');
            canvas.setAttribute('aria-hidden', 'true');
            host.append(canvas);
          }
          const cleanup = mount(host, {
            ...options[kind],
            paused: reduced.matches,
          });
          const canvases = [...host.querySelectorAll('canvas')];
          const lost = () => {
            dispose?.();
            dispose = undefined;
            host.dataset.effectStatus = 'unavailable';
          };
          canvases.forEach((canvas) =>
            canvas.addEventListener('webglcontextlost', lost),
          );
          dispose = () => {
            canvases.forEach((canvas) =>
              canvas.removeEventListener('webglcontextlost', lost),
            );
            cleanup?.();
            canvases.forEach((canvas) => {
              canvas
                .getContext('webgl2')
                ?.getExtension('WEBGL_lose_context')
                ?.loseContext();
              canvas.remove();
            });
          };
          if (!canvases.some((canvas) => !!canvas.getContext('webgl2'))) {
            dispose();
            dispose = undefined;
            host.dataset.effectStatus = 'unavailable';
          }
        } catch {
          host.dataset.effectStatus = 'unavailable';
          host.querySelectorAll('canvas').forEach((canvas) => canvas.remove());
        }
      };
      // Mount on entry and release on exit, keeping GPU memory bounded on long pages.
      const observer = new IntersectionObserver((entries) => {
        const next = entries.at(-1)?.isIntersecting || false;
        if (next === visible) return;
        visible = next;
        if (visible) void start();
        else stop();
      });
      host.querySelectorAll('canvas').forEach((canvas) => canvas.remove());
      observer.observe(host);
      const onMotion = () => {
        if (visible) void start();
      };
      reduced.addEventListener('change', onMotion);
      window.addEventListener(
        'pagehide',
        () => {
          observer.disconnect();
          reduced.removeEventListener('change', onMotion);
          stop();
        },
        { once: true },
      );
    });
}

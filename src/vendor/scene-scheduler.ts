/** Pauses the source renderers without changing their shader or pointer math. */
export function createSceneScheduler(container: HTMLElement) {
  const scene = container.closest<HTMLElement>('[data-visual-motion]');
  let next: FrameRequestCallback | undefined;
  let raf = 0;
  let last = 0;
  let stillDrawn = false;
  let disposed = false;
  const blocked = () =>
    document.hidden ||
    ['idle', 'paused'].includes(scene?.dataset.motionState || '') ||
    (scene?.dataset.motionState === 'still' && stillDrawn);
  const request = (callback: FrameRequestCallback): number => {
    next = callback;
    if (disposed || blocked() || raf) return raf;
    raf = window.requestAnimationFrame(function tick(now) {
      if (disposed || blocked()) {
        raf = 0;
        return;
      }
      if (last && now - last < 1000 / 30) {
        raf = window.requestAnimationFrame(tick);
        return;
      }
      raf = 0;
      last = now;
      const callback = next;
      callback?.(now);
    });
    return raf;
  };
  const cancel = () => {
    window.cancelAnimationFrame(raf);
    raf = 0;
  };
  const sync = () => {
    cancel();
    last = 0;
    if (next && !blocked()) request(next);
  };
  const observer = new MutationObserver(sync);
  if (scene)
    observer.observe(scene, {
      attributes: true,
      attributeFilter: ['data-motion-state'],
    });
  document.addEventListener('visibilitychange', sync);
  return {
    request,
    cancel,
    didDraw() {
      container.dataset.effectStatus = 'ready';
      if (scene?.dataset.motionState === 'still') {
        stillDrawn = true;
        cancel();
      }
    },
    dispose() {
      disposed = true;
      cancel();
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    },
  };
}

/** Shared visibility, pause, and reduced-motion state for SVG and shader scenes. */
export function initVisuals() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document
    .querySelectorAll<HTMLElement>('[data-visual-motion]')
    .forEach((scene) => {
      const button = scene.querySelector<HTMLButtonElement>(
        '[data-visual-pause]',
      );
      const label =
        button?.getAttribute('aria-label')?.replace(/^Pause /, '') ||
        'animation';
      let visible = false,
        paused = false;
      const sync = () => {
        scene.dataset.motionState = reduced.matches
          ? 'still'
          : paused
            ? 'paused'
            : visible && !document.hidden
              ? 'playing'
              : 'idle';
        if (button) {
          button.hidden = reduced.matches;
          button.setAttribute('aria-pressed', String(paused));
          button.setAttribute(
            'aria-label',
            `${paused ? 'Play' : 'Pause'} ${label}`,
          );
        }
      };
      const observer = new IntersectionObserver(
        (entries) => {
          visible = entries.at(-1)?.isIntersecting || false;
          sync();
        },
        { rootMargin: '0px' },
      );
      observer.observe(scene);
      button?.addEventListener('click', () => {
        paused = !paused;
        sync();
      });
      const restart = () => {
        if (
          !paused &&
          !reduced.matches &&
          scene.dataset.visualMotion !== 'hero'
        )
          scene
            .getAnimations({ subtree: true })
            .forEach((animation) => (animation.currentTime = 0));
      };
      scene.addEventListener('pointerenter', restart);
      scene.addEventListener('focusin', restart);
      document.addEventListener('visibilitychange', sync);
      reduced.addEventListener('change', sync);
      sync();
      window.addEventListener(
        'pagehide',
        () => {
          observer.disconnect();
          document.removeEventListener('visibilitychange', sync);
          reduced.removeEventListener('change', sync);
        },
        { once: true },
      );
    });
}

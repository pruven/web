import {
  mountGradientASCII,
  type GradientASCIIOptions,
} from '../vendor/gradient-ascii.js';
export function initGradientASCII() {
  document
    .querySelectorAll<HTMLElement>('[data-gradient-ascii]')
    .forEach((element) => {
      const options = JSON.parse(
        element.dataset.options || '{}',
      ) as GradientASCIIOptions;
      let cleanup: (() => void) | undefined;
      let entered = false;
      const stop = () => {
        if (!cleanup) return;
        // Detached canvases are fully released by the native renderer's cleanup.
        element.querySelector('canvas')?.remove();
        cleanup();
        cleanup = undefined;
        const canvas = document.createElement('canvas');
        canvas.className = 'gradient-ascii-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        element.append(canvas);
        delete element.dataset.asciiStatus;
      };
      const observer = new IntersectionObserver((entries) => {
        if (entries.at(-1)?.isIntersecting) {
          if (!cleanup) {
            cleanup = mountGradientASCII(element, {
              ...options,
              intro: entered ? false : options.intro,
            });
            entered = true;
          }
        } else stop();
      });
      observer.observe(element);
      window.addEventListener(
        'pagehide',
        () => {
          observer.disconnect();
          stop();
        },
        { once: true },
      );
    });
}

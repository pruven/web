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
      const cleanup = mountGradientASCII(element, options);
      window.addEventListener('pagehide', cleanup, { once: true });
    });
}

import { initBooking } from './booking';
import { initServiceEffects } from './service-effects';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate } from 'motion';
import { initVisuals } from './visuals';
import { initGradientASCII } from './gradient-ascii';
import { product } from '../data/product';

document
  .querySelector<HTMLButtonElement>('[data-copy-install]')
  ?.addEventListener('click', async () => {
    const status = document.querySelector<HTMLElement>('[data-copy-status]');
    try {
      await navigator.clipboard.writeText(product.install);
      if (status) status.textContent = 'Installation commands copied.';
    } catch {
      if (status)
        status.textContent =
          'Could not copy. Select the commands above to copy them manually.';
    }
  });

gsap.registerPlugin(ScrollTrigger);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const header = document.querySelector<HTMLElement>('.site-header');
const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const menu = document.querySelector<HTMLElement>('#mobile-menu');
let previousFocus: HTMLElement | null = null;
function closeMenu(restore = false) {
  if (!menu || !toggle) return;
  menu.hidden = true;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
  header?.classList.remove('menu-open');
  document.body.style.overflow = '';
  if (restore) previousFocus?.focus();
}
toggle?.addEventListener('click', () => {
  if (!menu) return;
  if (!menu.hidden) {
    closeMenu();
    return;
  }
  previousFocus = document.activeElement as HTMLElement;
  menu.hidden = false;
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('aria-label', 'Close menu');
  header?.classList.add('menu-open');
  document.body.style.overflow = 'hidden';
  if (!reduced.matches)
    animate(
      menu.querySelectorAll('nav a'),
      { opacity: [0, 1], y: [12, 0] },
      { duration: 0.35, delay: (i) => i * 0.045 },
    );
});
menu
  ?.querySelectorAll('a')
  .forEach((a) => a.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', (event) => {
  if (menu?.hidden !== false) return;
  if (event.key === 'Escape') closeMenu(true);
  if (event.key === 'Tab') {
    const focusable = [
      toggle,
      ...menu.querySelectorAll<HTMLElement>('a,button'),
    ].filter(Boolean) as HTMLElement[];
    const first = focusable[0],
      last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
});
window.matchMedia('(min-width:768px)').addEventListener('change', (e) => {
  if (e.matches) closeMenu();
});
const updateHeader = () => header?.classList.toggle('scrolled', scrollY > 24);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  document
    .querySelectorAll<HTMLElement>('.split-heading')
    .forEach((heading) => {
      gsap.from(heading.querySelectorAll('.word'), {
        yPercent: 115,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.06,
        delay: heading.classList.contains('hero-heading') ? 0.2 : 0,
        scrollTrigger: { trigger: heading, start: 'top 94%', once: true },
      });
    });
  document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
    gsap.from(el, {
      y: 24,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 94%', once: true },
    });
  });
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count),
      count = { value: 0 };
    gsap.to(count, {
      value: end,
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 95%', once: true },
      onUpdate: () => {
        el.textContent = String(Math.round(count.value));
      },
    });
  });
});
document.querySelectorAll<HTMLElement>('.process-grid').forEach((grid) => {
  grid
    .querySelectorAll<HTMLElement>('li')
    .forEach((li, i) => li.style.setProperty('--step', String(i)));
  ScrollTrigger.create({
    trigger: grid,
    start: 'top 85%',
    once: true,
    onEnter: () => grid.classList.add('active'),
  });
});

initVisuals();
initGradientASCII();

initServiceEffects();

initBooking();

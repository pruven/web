type CalAPI = ((...args: unknown[]) => void) & {
  q: unknown[][];
  ns: Record<string, CalAPI>;
  loaded?: boolean;
};
declare global {
  interface Window {
    Cal?: CalAPI;
  }
}
let loading: Promise<CalAPI> | undefined;
function loadCal(): Promise<CalAPI> {
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    // Cal's official queue bootstrap lets instructions wait for embed.js.
    const cal: CalAPI =
      window.Cal ||
      Object.assign(
        (...args: unknown[]) => {
          cal.q.push(args);
        },
        { q: [] as unknown[][], ns: {} as Record<string, CalAPI> },
      );
    window.Cal = cal;
    cal('init', { origin: 'https://cal.com' });
    cal('ui', {
      theme: 'light',
      cssVarsPerTheme: { light: { 'cal-brand': '#315efb' } },
    });
    const script = document.createElement('script');
    script.src = 'https://app.cal.com/embed/embed.js';
    script.async = true;
    cal.loaded = true;
    const timeout = window.setTimeout(
      () => reject(new Error('Calendar load timed out')),
      12000,
    );
    script.onload = () => {
      clearTimeout(timeout);
      resolve(cal);
    };
    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Calendar unavailable'));
    };
    document.head.append(script);
  });
  return loading;
}
export function initBooking() {
  let opening = false;
  document
    .querySelectorAll<HTMLAnchorElement>('[data-booking-trigger]')
    .forEach((trigger) => {
      trigger.addEventListener('click', async (event) => {
        if (
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        )
          return;
        event.preventDefault();
        if (opening) return;
        opening = true;
        trigger.setAttribute('aria-busy', 'true');
        try {
          const cal = await loadCal();
          cal('modal', {
            calLink: new URL(trigger.href).pathname.slice(1),
            config: { layout: 'month_view', theme: 'light' },
          });
        } catch {
          window.location.assign(trigger.href);
        } finally {
          opening = false;
          trigger.removeAttribute('aria-busy');
        }
      });
    });
}

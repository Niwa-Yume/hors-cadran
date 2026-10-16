import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';
import { reduced } from './env';

/** Smooth scroll (Lenis, lerp .1) driven by the GSAP ticker so ScrollTrigger stays in sync. */
export const lenis: Lenis | null = reduced ? null : new Lenis({ lerp: 0.1, autoRaf: false });

if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

let locks = 0;
/** Ref-counted scroll lock for dialogs, menu and preloader. */
export function lockScroll(lock: boolean) {
  locks = Math.max(0, locks + (lock ? 1 : -1));
  if (locks > 0) {
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
  } else {
    lenis?.start();
    document.documentElement.style.overflow = '';
  }
}

const NAV_OFFSET = -86;

export function scrollToTarget(target: string | HTMLElement | number, offset = NAV_OFFSET) {
  const el = typeof target === 'string' ? (document.querySelector(target) as HTMLElement | null) : target;
  if (el === null) return;
  if (lenis) {
    lenis.scrollTo(el, { offset: typeof el === 'number' ? 0 : offset, duration: 1.4 });
  } else if (typeof el === 'number') {
    window.scrollTo({ top: el });
  } else {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset });
  }
}

/* In-page anchors go through Lenis. */
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
  if (!a) return;
  const hash = a.getAttribute('href') ?? '';
  if (hash === '#' || hash.length < 2) return;
  const target = hash === '#top' ? 0 : document.querySelector<HTMLElement>(hash);
  if (target === null) return;
  e.preventDefault();
  scrollToTarget(target, hash === '#drops' || hash === '#top' ? 0 : NAV_OFFSET);
  if (typeof target !== 'number') {
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
});

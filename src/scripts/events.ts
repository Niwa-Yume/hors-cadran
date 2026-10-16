/* Tiny event bus over window CustomEvents. */
import type { CategoryId } from '../data/products';

export interface HCEvents {
  'hc:preloaded': undefined;
  'hc:drop': { index: number; accent: string };
  'hc:filter': { category: CategoryId | 'all' | 'new'; scroll?: boolean };
  'hc:quickview': { id: string };
  'hc:cart-open': undefined;
  'hc:toast': { message: string };
}

export function emit<K extends keyof HCEvents>(name: K, detail?: HCEvents[K]) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function on<K extends keyof HCEvents>(name: K, cb: (detail: HCEvents[K]) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<HCEvents[K]>).detail);
  window.addEventListener(name, handler);
  return () => window.removeEventListener(name, handler);
}

declare global {
  interface Window {
    __hcPreloaded?: boolean;
  }
}

/** Calls cb once the preloader is gone (immediately if it already is). */
export function onPreloaded(cb: () => void) {
  if (window.__hcPreloaded) cb();
  else window.addEventListener('hc:preloaded', () => cb(), { once: true });
}

/** Environment flags shared by every module. */
export const reduced =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const finePointer =
  typeof matchMedia !== 'undefined' && matchMedia('(hover: hover) and (pointer: fine)').matches;

export const isDesktop = () => typeof innerWidth !== 'undefined' && innerWidth >= 768;

export const pad2 = (n: number) => String(n).padStart(2, '0');

export const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Last pointer type seen anywhere: lets click handlers tell taps from clicks. */
export let lastPointer: string = 'mouse';
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', (e) => (lastPointer = e.pointerType), { capture: true, passive: true });
  document.documentElement.classList.toggle('reduced', reduced);
}

/** Global mouse position (viewport px), updated once per event. */
export const mouse = { x: -1, y: -1, moved: false };
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.moved = true;
    },
    { passive: true },
  );
}

export function whenIdle(cb: () => void, timeout = 1500) {
  const ric = (window as Window & { requestIdleCallback?: typeof requestIdleCallback }).requestIdleCallback;
  if (ric) ric(cb, { timeout });
  else setTimeout(cb, 200);
}

export function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Runs cb while el is on screen; returns a getter for the visibility flag. */
export function watchVisibility(el: Element, cb?: (visible: boolean) => void, rootMargin = '0px') {
  const state = { visible: false };
  const io = new IntersectionObserver(
    ([entry]) => {
      state.visible = entry.isIntersecting;
      cb?.(state.visible);
    },
    { rootMargin },
  );
  io.observe(el);
  return state;
}

import { finePointer, reduced } from './env';

/**
 * Custom cursor: 10px dot (difference blend) that lerps toward the pointer.
 * Elements with data-cursor="view|stop|drag" grow it into an 84px labelled disc.
 * data-cursor-theme="light" flips the disc to paper for dark sections.
 */
const root = document.querySelector<HTMLElement>('[data-cursor-root]');

if (root && finePointer && !reduced) {
  const label = root.querySelector<HTMLElement>('[data-cursor-label]')!;
  document.documentElement.classList.add('has-cursor');

  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const target = { x: pos.x, y: pos.y };
  let visible = false;
  let current: string | null = null;

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        pos.x = target.x;
        pos.y = target.y;
        root.classList.add('is-visible');
      }
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => {
    visible = false;
    root.classList.remove('is-visible');
  });

  const setState = (el: HTMLElement | null) => {
    const kind = el?.dataset.cursor ?? null;
    if (kind === current) return;
    current = kind;
    root.classList.toggle('is-label', !!kind);
    root.classList.toggle('is-light', el?.dataset.cursorTheme === 'light');
    label.textContent = kind ? kind.toUpperCase() : '';
  };

  document.addEventListener('pointerover', (e) => {
    setState((e.target as HTMLElement).closest<HTMLElement>('[data-cursor]'));
  });
  document.addEventListener('pointerdown', () => root.classList.add('is-down'));
  document.addEventListener('pointerup', () => root.classList.remove('is-down'));

  const loop = () => {
    pos.x += (target.x - pos.x) * 0.18;
    pos.y += (target.y - pos.y) * 0.18;
    root.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

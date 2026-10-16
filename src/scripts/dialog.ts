import { gsap } from './gsap';
import { lockScroll } from './lenis';
import { reduced } from './env';

interface DialogAnim {
  from: gsap.TweenVars;
  duration?: number;
}

/**
 * Native <dialog> (showModal = focus trap + inert page + Escape) with GSAP
 * enter/leave. Clicking the backdrop (the dialog box itself) closes it.
 */
export function makeDialog(dialog: HTMLDialogElement, panel: HTMLElement, anim: DialogAnim) {
  let closing = false;
  const duration = reduced ? 0 : (anim.duration ?? 0.6);

  const open = () => {
    if (dialog.open) return;
    closing = false;
    dialog.showModal();
    lockScroll(true);
    dialog.classList.add('is-open');
    gsap.fromTo(panel, anim.from, { x: 0, y: 0, scale: 1, opacity: 1, duration, ease: 'hc-expo', overwrite: true });
  };

  const close = () => {
    if (!dialog.open || closing) return;
    closing = true;
    dialog.classList.remove('is-open');
    gsap.to(panel, {
      ...anim.from,
      duration: duration * 0.6,
      ease: 'hc-cubic',
      overwrite: true,
      onComplete: () => {
        dialog.close();
        lockScroll(false);
        closing = false;
      },
    });
  };

  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close();
  });
  dialog.querySelectorAll('[data-dialog-close]').forEach((b) => b.addEventListener('click', close));

  return { open, close };
}

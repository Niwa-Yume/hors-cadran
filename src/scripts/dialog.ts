import { gsap } from './gsap';
import { lockScroll } from './lenis';
import { reduced } from './env';

interface DialogAnim {
  from: gsap.TweenVars;
  duration?: number;
}

type State = 'closed' | 'open' | 'closing';

/**
 * Native <dialog> (showModal = focus trap + inert page + Escape) with GSAP
 * enter/leave. Clicking the backdrop (the dialog box itself) closes it.
 *
 * Cleanup lives in the native `close` event so the page never stays locked,
 * whichever way the dialog ends up closed (animated close, or the browser
 * closing it directly when it refuses to let `cancel` be prevented).
 */
export function makeDialog(dialog: HTMLDialogElement, panel: HTMLElement, anim: DialogAnim) {
  const html = document.documentElement;
  const duration = reduced ? 0 : (anim.duration ?? 0.6);
  let state: State = 'closed';
  let locked = false;

  const setLocked = (on: boolean) => {
    if (on !== locked) {
      locked = on;
      lockScroll(on);
    }
    // Native cursor while any modal is open: the custom one can't sit above the top layer.
    html.classList.toggle('has-modal', !!document.querySelector('dialog[open]'));
  };

  const open = () => {
    if (state === 'open') return;
    const wasClosing = state === 'closing';
    if (!dialog.open) dialog.showModal();
    state = 'open';
    setLocked(true);
    dialog.classList.add('is-open');
    const to = { x: 0, y: 0, scale: 1, opacity: 1, duration, ease: 'hc-expo', overwrite: true };
    // Re-opened mid-close (e.g. a second product clicked fast): continue from where it is.
    if (wasClosing) gsap.to(panel, to);
    else gsap.fromTo(panel, anim.from, to);
  };

  const close = () => {
    if (state !== 'open') return;
    state = 'closing';
    dialog.classList.remove('is-open');
    const finish = () => {
      if (state === 'closing') dialog.close();
    };
    gsap.to(panel, { ...anim.from, duration: duration * 0.6, ease: 'hc-cubic', overwrite: true, onComplete: finish });
    // Don't let a throttled animation frame (background tab, busy main thread) keep it open.
    window.setTimeout(finish, duration * 600 + 250);
  };

  dialog.addEventListener('close', () => {
    state = 'closed';
    gsap.killTweensOf(panel);
    dialog.classList.remove('is-open');
    setLocked(false);
  });

  dialog.addEventListener('cancel', (e) => {
    // Browsers may refuse to cancel repeated Escapes; then they close natively and `close` cleans up.
    if (!e.cancelable) return;
    e.preventDefault();
    close();
  });

  // Only a press that starts AND ends on the backdrop closes: selecting text inside
  // the panel and releasing outside must not dismiss it.
  let downOnBackdrop = false;
  dialog.addEventListener('pointerdown', (e) => (downOnBackdrop = e.target === dialog));
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog && downOnBackdrop) close();
    downOnBackdrop = false;
  });

  dialog.querySelectorAll('[data-dialog-close]').forEach((b) => b.addEventListener('click', close));

  return { open, close, isOpen: () => state === 'open' };
}

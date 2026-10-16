import { gsap, ScrollTrigger, SplitText } from './gsap';
import { reduced } from './env';
import { onPreloaded } from './events';

/**
 * [data-split]  headings: chars rise from translateY(150%) inside line masks, 20ms stagger.
 * [data-scrub]  paragraphs: words go from 15% to 100% opacity, scrubbed with scroll.
 */
function initSplits() {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    if (reduced) {
      el.classList.add('is-split');
      return;
    }
    SplitText.create(el, {
      type: 'lines,chars',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        el.classList.add('is-split');
        return gsap.from(self.chars, {
          yPercent: 150,
          duration: 0.35,
          ease: 'hc-char',
          stagger: 0.02,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  });

  if (reduced) return;
  document.querySelectorAll<HTMLElement>('[data-scrub]').forEach((el) => {
    SplitText.create(el, {
      type: 'words',
      autoSplit: true,
      onSplit(self) {
        return gsap.fromTo(
          self.words,
          { opacity: 0.15 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.1,
            scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 55%', scrub: true },
          },
        );
      },
    });
  });
}

document.fonts.ready.then(() => {
  onPreloaded(() => {
    initSplits();
    ScrollTrigger.refresh();
  });
});

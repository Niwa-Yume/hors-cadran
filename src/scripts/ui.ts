/** Client-side twin of PillButton.astro for markup rendered from JS. */
export function pillHTML(label: string, attrs: string, variant = '', extraClass = '') {
  const cls = ['pill', variant && `pill--${variant}`, extraClass].filter(Boolean).join(' ');
  return `<button type="button" class="${cls}" ${attrs}><span>${label}</span><span class="pill__dot" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6"/></svg></span></button>`;
}

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

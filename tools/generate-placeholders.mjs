#!/usr/bin/env node
/**
 * Generates neutral placeholder images (SVG) into /public/images:
 *   products/<id>.svg  — object cut-out, transparent background (tiles add the paper)
 *   drops/drop-0N.svg  — full-bleed studio scene for the hero
 *   macro/cap-macro.svg — tight crop for the spec sheet
 *
 * No logos, no trademarks: just shapes. Swap the files for real photography
 * whenever you have it (same paths, or update src/data/products.ts).
 *
 *   node tools/generate-placeholders.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');

/* ---------- helpers ---------- */
const shadow = (id, cx = 500, cy = 820, rx = 320, ry = 36) => `
  <defs><radialGradient id="${id}-sh"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id}-sh)"/>`;

const sheen = (id, angle = 0) => `
  <linearGradient id="${id}-sheen" gradientTransform="rotate(${angle} .5 .5)">
    <stop offset="0" stop-color="#fff" stop-opacity=".22"/>
    <stop offset=".45" stop-color="#fff" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity=".18"/>
  </linearGradient>`;

const stitch = (d, color = '#E7D9B8', w = 3) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="9 8" stroke-linecap="round" opacity=".8"/>`;

const ticks = (cx, cy, r, len, n = 12, color = '#E9DFC6', w = 3) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const x1 = cx + Math.sin(a) * r;
    const y1 = cy - Math.cos(a) * r;
    const x2 = cx + Math.sin(a) * (r - len);
    const y2 = cy - Math.cos(a) * (r - len);
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
  }).join('');

/* ---------- objects (1000 × 1000 space) ---------- */
const objects = {
  'hc-0101': (id) => {
    const deck = (x, y, rot, fill, side) => `
      <g transform="rotate(${rot} ${x + 130} ${y + 190})">
        <rect x="${x + 260}" y="${y + 10}" width="24" height="372" rx="6" fill="${side}"/>
        <rect x="${x}" y="${y}" width="270" height="380" rx="18" fill="${fill}"/>
        <rect x="${x}" y="${y}" width="270" height="380" rx="18" fill="url(#${id}-sheen)"/>
        <rect x="${x + 18}" y="${y + 18}" width="234" height="344" rx="10" fill="none" stroke="#E9DFC6" stroke-width="3"/>
        <rect x="${x + 28}" y="${y + 28}" width="214" height="324" rx="6" fill="none" stroke="#E9DFC6" stroke-width="1.2" opacity=".6"/>
        <circle cx="${x + 135}" cy="${y + 190}" r="52" fill="none" stroke="#E9DFC6" stroke-width="3"/>
        ${ticks(x + 135, y + 190, 46, 9)}
        <circle cx="${x + 135}" cy="${y + 190}" r="5" fill="#E9DFC6"/>
      </g>`;
    return `${shadow(id, 500, 800, 340, 34)}<defs>${sheen(id, 25)}</defs>
      ${deck(215, 320, -7, '#1E2A44', '#131B2E')}
      ${deck(470, 330, 6, '#A8322A', '#76211B')}`;
  },

  'hc-0117': (id) => `${shadow(id, 470, 760, 360, 34)}
    <defs>${sheen(id, 0)}
      <linearGradient id="${id}-brim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2C4A3E"/><stop offset="1" stop-color="#15261F"/></linearGradient>
    </defs>
    <path d="M300 660 C300 430 420 300 565 300 C705 300 800 410 800 575 L800 660 Z" fill="#22382F"/>
    <path d="M300 660 C300 430 420 300 565 300 C705 300 800 410 800 575 L800 660 Z" fill="url(#${id}-sheen)"/>
    <path d="M565 302 C520 390 485 510 476 650" fill="none" stroke="#162720" stroke-width="4"/>
    <path d="M565 302 C625 395 662 515 668 650" fill="none" stroke="#162720" stroke-width="4"/>
    <path d="M565 302 C430 330 340 450 318 600" fill="none" stroke="#2E4A3F" stroke-width="2" opacity=".7"/>
    <rect x="300" y="636" width="500" height="26" rx="4" fill="#15261F"/>
    <ellipse cx="565" cy="300" rx="28" ry="11" fill="#162720"/>
    <path d="M330 640 C250 646 160 668 112 706 C98 718 118 730 152 728 C270 718 380 696 455 660 Z" fill="url(#${id}-brim)"/>
    <path d="M150 716 C260 708 360 690 440 662" fill="none" stroke="#3A5C4F" stroke-width="2" stroke-dasharray="7 7"/>
    <rect x="372" y="462" width="136" height="70" rx="10" fill="#D4E87A"/>
    <rect x="382" y="472" width="116" height="50" rx="6" fill="none" stroke="#22382F" stroke-width="2" stroke-dasharray="6 5"/>
    <text x="440" y="508" font-family="ui-monospace, monospace" font-size="26" font-weight="700" fill="#22382F" text-anchor="middle">24</text>
    <rect x="772" y="590" width="34" height="56" rx="6" fill="#2E4A3F"/>`,

  'hc-0124': (id) => `${shadow(id, 500, 760, 300, 30)}
    <defs>${sheen(id, 30)}</defs>
    <g transform="rotate(-5 500 500)">
      <rect x="300" y="300" width="400" height="120" rx="14" fill="#D9DCDF"/>
      <rect x="320" y="300" width="360" height="22" rx="4" fill="#C4C8CC"/>
      <rect x="270" y="330" width="460" height="340" rx="28" fill="#223049"/>
      <rect x="270" y="330" width="460" height="340" rx="28" fill="url(#${id}-sheen)"/>
      <path d="M290 410 Q500 448 710 410" fill="none" stroke="#151E30" stroke-width="5"/>
      <path d="M290 480 Q500 518 710 480" fill="none" stroke="#151E30" stroke-width="5"/>
      ${stitch('M298 352 H702 Q710 352 710 362 V640 Q710 650 700 650 H300 Q290 650 290 640 V362 Q290 352 298 352 Z', '#C9B48A')}
      <rect x="470" y="600" width="60" height="6" rx="3" fill="#C9B48A" opacity=".7"/>
    </g>`,

  'hc-0132': (id) => `${shadow(id, 500, 760, 380, 30)}
    <defs>${sheen(id, 90)}</defs>
    <polygon points="160,640 840,640 840,688 160,688" fill="#6C4327"/>
    <polygon points="230,430 770,430 840,640 160,640" fill="#8B5A35"/>
    <polygon points="285,468 715,468 772,606 228,606" fill="#A5714A"/>
    <polygon points="285,468 715,468 772,606 228,606" fill="url(#${id}-sheen)"/>
    <polygon points="230,430 285,468 228,606 160,640" fill="#7A4D2D"/>
    <polygon points="770,430 840,640 772,606 715,468" fill="#7A4D2D"/>
    ${stitch('M240 442 H760 L826 632 H174 Z', '#E2C79F')}
    <circle cx="232" cy="432" r="11" fill="#C7CBCF"/><circle cx="768" cy="432" r="11" fill="#C7CBCF"/>
    <circle cx="162" cy="640" r="12" fill="#C7CBCF"/><circle cx="838" cy="640" r="12" fill="#C7CBCF"/>`,

  'hc-0140': (id) => `${shadow(id, 520, 760, 320, 32)}
    <polygon points="300,420 420,348 760,348 640,420" fill="#B12A33"/>
    <rect x="300" y="420" width="340" height="300" fill="#8E1A22"/>
    <polygon points="640,420 760,348 760,648 640,720" fill="#6B1219"/>
    <line x1="300" y1="500" x2="640" y2="500" stroke="#D6B36A" stroke-width="4"/>
    <line x1="640" y1="500" x2="760" y2="428" stroke="#D6B36A" stroke-width="4"/>
    <line x1="300" y1="420" x2="640" y2="420" stroke="#D6B36A" stroke-width="2" opacity=".6"/>
    <rect x="452" y="488" width="36" height="26" rx="4" fill="#D6B36A"/>
    <rect x="300" y="420" width="340" height="300" fill="url(#${id}-g)" opacity=".5"/>
    <defs><linearGradient id="${id}-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient></defs>`,

  'hc-0146': (id) => `${shadow(id, 500, 800, 300, 30)}
    <defs>${sheen(id, 20)}</defs>
    <rect x="300" y="290" width="380" height="480" rx="10" fill="#C9CDD1"/>
    <rect x="300" y="290" width="380" height="480" rx="10" fill="url(#${id}-sheen)"/>
    <rect x="300" y="560" width="380" height="210" rx="10" fill="#B6BBC0"/>
    <rect x="340" y="340" width="190" height="14" rx="3" fill="#111" opacity=".75"/>
    <rect x="340" y="370" width="260" height="8" rx="3" fill="#111" opacity=".3"/>
    <rect x="340" y="390" width="230" height="8" rx="3" fill="#111" opacity=".3"/>
    <path d="M395 150 C300 340 430 520 520 580" fill="none" stroke="#111" stroke-width="22" stroke-linecap="round"/>
    <path d="M645 150 C740 340 610 520 520 580" fill="none" stroke="#1D1D1D" stroke-width="22" stroke-linecap="round"/>
    <rect x="506" y="566" width="28" height="34" rx="6" fill="#9DA2A7"/>
    <rect x="440" y="596" width="160" height="210" rx="12" fill="#FFFFFF"/>
    <rect x="440" y="596" width="160" height="46" rx="12" fill="#CB4C3A"/>
    <text x="520" y="628" font-family="ui-monospace, monospace" font-size="22" font-weight="700" fill="#fff" text-anchor="middle">PRESS</text>
    <rect x="462" y="664" width="116" height="10" rx="3" fill="#111" opacity=".5"/>
    <rect x="462" y="684" width="80" height="10" rx="3" fill="#111" opacity=".3"/>`,

  'hc-0153': (id) => `${shadow(id, 500, 830, 280, 30)}
    <defs>${sheen(id, 10)}</defs>
    <path d="M378 430 C378 250 470 250 470 430" fill="none" stroke="#4A5A3C" stroke-width="24" stroke-linecap="round"/>
    <path d="M530 430 C530 250 622 250 622 430" fill="none" stroke="#4A5A3C" stroke-width="24" stroke-linecap="round"/>
    <path d="M300 420 H700 L716 800 H284 Z" fill="#D8CBB0"/>
    <path d="M300 420 H700 L716 800 H284 Z" fill="url(#${id}-sheen)"/>
    <rect x="300" y="420" width="400" height="44" fill="#CDBF9F"/>
    ${stitch('M306 470 H694', '#A89878')}
    <rect x="366" y="420" width="24" height="110" fill="#4A5A3C"/><rect x="458" y="420" width="24" height="110" fill="#4A5A3C"/>
    <rect x="518" y="420" width="24" height="110" fill="#4A5A3C"/><rect x="610" y="420" width="24" height="110" fill="#4A5A3C"/>`,

  'hc-0161': (id) => {
    const die = (x, y, s, pips) => {
      const h = s * 0.5;
      const top = `${x},${y} ${x + s},${y - h} ${x + 2 * s},${y} ${x + s},${y + h}`;
      const left = `${x},${y} ${x + s},${y + h} ${x + s},${y + h + s} ${x},${y + s}`;
      const right = `${x + s},${y + h} ${x + 2 * s},${y} ${x + 2 * s},${y + s} ${x + s},${y + h + s}`;
      const pipEls = pips
        .map(([u, v, c]) => {
          const px = x + s + (u - v) * s * 0.5;
          const py = y + (u + v) * s * 0.25 - 0;
          return `<ellipse cx="${px}" cy="${py}" rx="${s * 0.09}" ry="${s * 0.05}" fill="${c}"/>`;
        })
        .join('');
      return `<polygon points="${top}" fill="#F4EEE2"/><polygon points="${left}" fill="#E1D7C4"/><polygon points="${right}" fill="#CFC3AC"/>${pipEls}
        <circle cx="${x + s * 0.5}" cy="${y + s * 0.75}" r="${s * 0.08}" fill="#111"/>
        <circle cx="${x + s * 1.5}" cy="${y + s * 0.5}" r="${s * 0.08}" fill="#CB4C3A"/><circle cx="${x + s * 1.5}" cy="${y + s * 0.95}" r="${s * 0.08}" fill="#CB4C3A"/>`;
    };
    return `${shadow(id, 500, 780, 360, 34)}
      <path d="M180 760 C180 690 820 690 820 760 C820 800 180 800 180 760 Z" fill="#2B2B2B"/>
      ${stitch('M210 752 C300 712 700 712 790 752', '#8A8A8A')}
      ${die(220, 560, 120, [[0, 0, '#CB4C3A']])}
      ${die(430, 520, 130, [[-0.3, -0.3, '#111'], [0.3, 0.3, '#111']])}
      ${die(560, 600, 115, [[0, 0, '#111']])}`;
  },

  'hc-0168': (id) => `${shadow(id, 500, 800, 220, 28)}
    <defs>${sheen(id, 35)}</defs>
    <circle cx="430" cy="320" r="92" fill="none" stroke="#9EA3A8" stroke-width="18"/>
    <circle cx="430" cy="320" r="92" fill="none" stroke="#E7EAEC" stroke-width="5" stroke-dasharray="60 520" stroke-dashoffset="-40"/>
    <rect x="486" y="388" width="22" height="58" rx="8" fill="#9EA3A8" transform="rotate(-25 497 417)"/>
    <g transform="rotate(18 520 600)">
      <rect x="430" y="430" width="180" height="340" rx="44" fill="#5A3A24"/>
      <rect x="430" y="430" width="180" height="340" rx="44" fill="url(#${id}-sheen)"/>
      ${stitch('M452 480 Q452 452 480 452 H560 Q588 452 588 480 V722 Q588 748 560 748 H480 Q452 748 452 722 Z', '#C9A57E')}
      <circle cx="520" cy="486" r="16" fill="#C7CBCF"/><circle cx="520" cy="486" r="7" fill="#5A3A24"/>
    </g>`,

  'hc-0175': (id) => `${shadow(id, 500, 740, 380, 30)}
    <defs>
      <linearGradient id="${id}-cyl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5B4031"/><stop offset=".35" stop-color="#3E2A1E"/><stop offset="1" stop-color="#22160F"/></linearGradient>
    </defs>
    <rect x="220" y="430" width="560" height="230" fill="url(#${id}-cyl)"/>
    <ellipse cx="220" cy="545" rx="52" ry="115" fill="#2A1C13"/>
    <ellipse cx="780" cy="545" rx="52" ry="115" fill="#4A3324"/>
    <ellipse cx="780" cy="545" rx="34" ry="88" fill="none" stroke="#2A1C13" stroke-width="4"/>
    <ellipse cx="780" cy="545" rx="16" ry="44" fill="none" stroke="#2A1C13" stroke-width="3"/>
    ${stitch('M232 452 H770', '#B89272')}${stitch('M232 640 H770', '#B89272')}
    <rect x="540" y="424" width="70" height="244" fill="#C69C6D"/>
    <rect x="540" y="424" width="70" height="244" fill="url(#${id}-cyl)" opacity=".35"/>
    <circle cx="575" cy="600" r="14" fill="#D9DCDF"/>`,

  'hc-0182': (id) => `${shadow(id, 500, 800, 300, 30)}
    <defs>${sheen(id, 25)}</defs>
    <rect x="318" y="296" width="372" height="476" rx="14" fill="#EDE6D6"/>
    <rect x="300" y="280" width="372" height="480" rx="14" fill="#1C1C1C"/>
    <rect x="300" y="280" width="372" height="480" rx="14" fill="url(#${id}-sheen)"/>
    <rect x="620" y="280" width="14" height="480" fill="#555"/>
    <rect x="300" y="280" width="34" height="480" rx="10" fill="#141414"/>
    <g transform="rotate(-42 500 520)">
      <rect x="220" y="506" width="560" height="28" rx="14" fill="#2A2A2A"/>
      <rect x="220" y="506" width="140" height="28" rx="14" fill="#BFC3C7"/>
      <rect x="640" y="498" width="110" height="8" rx="4" fill="#BFC3C7"/>
      <polygon points="220,506 186,520 220,534" fill="#BFC3C7"/>
    </g>`,

  'hc-0190': (id) => `${shadow(id, 500, 800, 300, 30)}
    <defs>${sheen(id, 20)}</defs>
    <polygon points="700,300 726,316 726,776 700,760" fill="#FBFAF6"/>
    ${Array.from({ length: 10 }, (_, i) => `<line x1="704" y1="${330 + i * 44}" x2="722" y2="${342 + i * 44}" stroke="#DDD8CC" stroke-width="2"/>`).join('')}
    <polygon points="320,760 700,760 726,776 346,776" fill="#F1EEE6"/>
    <rect x="320" y="300" width="380" height="460" fill="#E7E1D3"/>
    <rect x="320" y="300" width="380" height="460" fill="url(#${id}-sheen)"/>
    <rect x="290" y="306" width="34" height="462" rx="6" fill="#CFC7B4"/>
    <rect x="352" y="332" width="316" height="396" fill="none" stroke="#111" stroke-width="2" opacity=".55"/>
    <rect x="390" y="600" width="240" height="14" rx="3" fill="#111" opacity=".7"/>
    <rect x="430" y="626" width="160" height="8" rx="3" fill="#111" opacity=".35"/>
    <circle cx="510" cy="470" r="64" fill="none" stroke="#111" stroke-width="2" opacity=".55"/>
    ${ticks(510, 470, 60, 10, 12, '#111', 2)}`,
};

/* ---------- writers ---------- */
const write = (rel, svg) => {
  const file = join(root, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, svg.replace(/\n\s+/g, '\n').trim() + '\n');
  console.log('wrote', rel);
};

for (const [id, draw] of Object.entries(objects)) {
  write(
    `products/${id}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">${draw(id)}</svg>`,
  );
}

const drops = [
  { n: '01', obj: 'hc-0117', top: '#2A3424', bottom: '#0D100B', glow: '#D4E87A' },
  { n: '02', obj: 'hc-0101', top: '#3A1C18', bottom: '#110908', glow: '#CB4C3A' },
  { n: '03', obj: 'hc-0124', top: '#33271C', bottom: '#100C09', glow: '#C69C6D' },
  { n: '04', obj: 'hc-0132', top: '#1C2733', bottom: '#0A0E13', glow: '#87ADD3' },
];

for (const d of drops) {
  const id = `drop${d.n}`;
  write(
    `drops/drop-${d.n}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="1600" height="1000" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="${id}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${d.top}"/><stop offset="1" stop-color="${d.bottom}"/></linearGradient>
        <radialGradient id="${id}-spot" cx=".52" cy=".38" r=".55"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <radialGradient id="${id}-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${d.glow}" stop-opacity=".22"/><stop offset="1" stop-color="${d.glow}" stop-opacity="0"/></radialGradient>
        <linearGradient id="${id}-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#${id}-bg)"/>
      <ellipse cx="820" cy="560" rx="620" ry="360" fill="url(#${id}-glow)"/>
      <rect width="1600" height="1000" fill="url(#${id}-spot)"/>
      <rect y="720" width="1600" height="280" fill="url(#${id}-floor)"/>
      <g transform="translate(330 60) scale(.92)">${objects[d.obj](id + 'o')}</g>
    </svg>`,
  );
}

write(
  'macro/cap-macro.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1400" width="1000" height="1400" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="m-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDEDED"/><stop offset="1" stop-color="#D6D6D6"/></linearGradient>
      <pattern id="m-twill" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="14" stroke="#000" stroke-width="5" opacity=".22"/></pattern>
    </defs>
    <rect width="1000" height="1400" fill="url(#m-bg)"/>
    <g transform="translate(-644 -560) scale(2.6)">${objects['hc-0117']('macro')}</g>
    <rect width="1000" height="1400" fill="url(#m-twill)" opacity=".35"/>
  </svg>`,
);

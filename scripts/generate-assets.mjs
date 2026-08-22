/**
 * MoveDeal brand assets
 * Mark geometry is traced from the live 100×100 product PNG
 * (movedeal.app/images/movedeal-logo.png). Production files are fill-based
 * (expanded round-cap strokes + outlined Inter Bold). No live <text>.
 *
 * Run: node scripts/generate-assets.mjs
 */
import { mkdir, writeFile, copyFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SVG = join(ROOT, 'svg');
const PNG = join(ROOT, 'png');

const OCEAN = '#0077B6';
const SIGNAL = '#F77F00';
const INK = '#1B2430';
const PAPER = '#F8F9FA';
const NIGHT = '#0B1218';
const WHITE = '#FFFFFF';

const r = (n) => {
  const v = Math.round(n * 10) / 10;
  return Object.is(v, -0) ? 0 : v;
};

function roundedRectPath(x, y, w, h, rad) {
  const radius = Math.max(0, Math.min(rad, w / 2, h / 2));
  if (radius < 0.05) {
    return `M${r(x)} ${r(y)}H${r(x + w)}V${r(y + h)}H${r(x)}Z`;
  }
  const k = r(radius);
  return [
    `M${r(x + radius)} ${r(y)}`,
    `H${r(x + w - radius)}`,
    `A${k} ${k} 0 0 1 ${r(x + w)} ${r(y + radius)}`,
    `V${r(y + h - radius)}`,
    `A${k} ${k} 0 0 1 ${r(x + w - radius)} ${r(y + h)}`,
    `H${r(x + radius)}`,
    `A${k} ${k} 0 0 1 ${r(x)} ${r(y + h - radius)}`,
    `V${r(y + radius)}`,
    `A${k} ${k} 0 0 1 ${r(x + radius)} ${r(y)}`,
    'Z',
  ].join('');
}

function circlePair(cx, cy, radius) {
  const a = r(radius);
  return `M${r(cx - radius)} ${r(cy)}A${a} ${a} 0 1 1 ${r(cx + radius)} ${r(cy)}A${a} ${a} 0 1 1 ${r(cx - radius)} ${r(cy)}Z`;
}

function circleRing(cx, cy, radius, sw) {
  const outer = radius + sw / 2;
  const inner = Math.max(0.2, radius - sw / 2);
  return circlePair(cx, cy, outer) + circlePair(cx, cy, inner);
}

function roundedRectRing(x, y, w, h, rad, sw) {
  const outer = roundedRectPath(x - sw / 2, y - sw / 2, w + sw, h + sw, rad + sw / 2);
  const innerR = Math.max(0, rad - sw / 2);
  const inner = roundedRectPath(x + sw / 2, y + sw / 2, w - sw, h - sw, innerR);
  return outer + inner;
}

function capsule(x1, y1, x2, y2, sw, startCap = 'round', endCap = 'round') {
  const radius = sw / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 0.001;
  const nx = dx / len;
  const ny = dy / len;
  const px = -ny * radius;
  const py = nx * radius;
  const a = r(radius);
  const cap = (cx, cy, fromX, fromY, toX, toY, kind) => {
    if (kind === 'round') return `A${a} ${a} 0 0 1 ${r(toX)} ${r(toY)}`;
    return `L${r(toX)} ${r(toY)}`;
  };
  return [
    `M${r(x1 + px)} ${r(y1 + py)}`,
    `L${r(x2 + px)} ${r(y2 + py)}`,
    cap(x2, y2, x2 + px, y2 + py, x2 - px, y2 - py, endCap),
    `L${r(x1 - px)} ${r(y1 - py)}`,
    cap(x1, y1, x1 - px, y1 - py, x1 + px, y1 + py, startCap),
    'Z',
  ].join('');
}

/** Inter Bold 24px “MoveDeal” outlines (TTF advances). Baseline y=0, cap −17.46, width 117.83. */
const WORDMARK_24 =
  'M1.58 0V-17.46H7.07L9.9 -9.45Q10.08 -8.88 10.31 -7.99Q10.54 -7.1 10.77 -6.07Q11 -5.04 11.21 -4.07Q11.41 -3.09 11.54 -2.38H10.85Q10.98 -3.08 11.19 -4.05Q11.39 -5.02 11.62 -6.05Q11.86 -7.08 12.09 -7.98Q12.32 -8.88 12.49 -9.45L15.28 -17.46H20.79V0H17.19V-8.24Q17.19 -8.8 17.21 -9.66Q17.24 -10.51 17.26 -11.5Q17.29 -12.49 17.31 -13.49Q17.33 -14.5 17.34 -15.39H17.57Q17.34 -14.41 17.07 -13.38Q16.8 -12.34 16.53 -11.37Q16.25 -10.39 16.01 -9.58Q15.76 -8.77 15.59 -8.24L12.69 0H9.68L6.74 -8.24Q6.56 -8.77 6.32 -9.57Q6.07 -10.37 5.79 -11.34Q5.52 -12.32 5.24 -13.35Q4.96 -14.39 4.7 -15.39H4.98Q4.99 -14.54 5.02 -13.55Q5.04 -12.55 5.07 -11.55Q5.1 -10.55 5.12 -9.69Q5.13 -8.82 5.13 -8.24V0ZM29.72 0.26Q27.75 0.26 26.31 -0.59Q24.87 -1.44 24.09 -2.96Q23.31 -4.48 23.31 -6.49Q23.31 -8.53 24.09 -10.05Q24.87 -11.57 26.31 -12.42Q27.75 -13.27 29.72 -13.27Q31.7 -13.27 33.13 -12.42Q34.57 -11.57 35.35 -10.05Q36.13 -8.53 36.13 -6.49Q36.13 -4.48 35.35 -2.96Q34.57 -1.44 33.13 -0.59Q31.7 0.26 29.72 0.26ZM29.72 -2.51Q30.66 -2.51 31.29 -3.03Q31.92 -3.55 32.24 -4.46Q32.55 -5.37 32.55 -6.5Q32.55 -7.66 32.24 -8.57Q31.92 -9.47 31.29 -9.98Q30.66 -10.5 29.72 -10.5Q28.78 -10.5 28.15 -9.98Q27.53 -9.47 27.21 -8.57Q26.89 -7.66 26.89 -6.5Q26.89 -5.37 27.21 -4.46Q27.53 -3.55 28.15 -3.03Q28.78 -2.51 29.72 -2.51ZM42.27 0 37.44 -13.1H41.18L43.38 -6.3Q43.78 -5.03 44.08 -3.73Q44.38 -2.43 44.7 -1.03H43.95Q44.25 -2.43 44.54 -3.73Q44.84 -5.03 45.23 -6.3L47.41 -13.1H51.11L46.27 0ZM58.89 0.26Q56.88 0.26 55.43 -0.56Q53.98 -1.38 53.2 -2.89Q52.42 -4.41 52.42 -6.48Q52.42 -8.51 53.19 -10.03Q53.96 -11.55 55.38 -12.41Q56.8 -13.27 58.71 -13.27Q60 -13.27 61.11 -12.86Q62.23 -12.45 63.07 -11.62Q63.91 -10.79 64.39 -9.55Q64.86 -8.31 64.86 -6.62V-5.64H53.86V-7.84H63.14L61.5 -7.25Q61.5 -8.27 61.19 -9.03Q60.88 -9.79 60.26 -10.2Q59.65 -10.62 58.73 -10.62Q57.83 -10.62 57.19 -10.2Q56.55 -9.77 56.23 -9.05Q55.9 -8.33 55.9 -7.41V-5.85Q55.9 -4.71 56.28 -3.94Q56.66 -3.16 57.35 -2.78Q58.03 -2.39 58.95 -2.39Q59.57 -2.39 60.07 -2.57Q60.57 -2.74 60.93 -3.09Q61.29 -3.43 61.48 -3.94L64.66 -3.34Q64.35 -2.26 63.56 -1.45Q62.78 -0.63 61.6 -0.19Q60.42 0.26 58.89 0.26ZM73.48 0H68.96V-3.08H73.31Q75 -3.08 76.14 -3.68Q77.29 -4.28 77.86 -5.53Q78.43 -6.79 78.43 -8.74Q78.43 -10.69 77.85 -11.94Q77.27 -13.18 76.14 -13.78Q75.01 -14.38 73.34 -14.38H68.88V-17.46H73.55Q76.17 -17.46 78.06 -16.41Q79.96 -15.36 80.98 -13.41Q82 -11.46 82 -8.74Q82 -6.01 80.98 -4.05Q79.96 -2.1 78.05 -1.05Q76.14 0 73.48 0ZM70.92 -17.46V0H67.35V-17.46ZM90.52 0.26Q88.51 0.26 87.06 -0.56Q85.61 -1.38 84.83 -2.89Q84.05 -4.41 84.05 -6.48Q84.05 -8.51 84.82 -10.03Q85.59 -11.55 87.01 -12.41Q88.43 -13.27 90.34 -13.27Q91.63 -13.27 92.74 -12.86Q93.86 -12.45 94.7 -11.62Q95.54 -10.79 96.02 -9.55Q96.49 -8.31 96.49 -6.62V-5.64H85.49V-7.84H94.77L93.13 -7.25Q93.13 -8.27 92.82 -9.03Q92.51 -9.79 91.89 -10.2Q91.28 -10.62 90.36 -10.62Q89.46 -10.62 88.82 -10.2Q88.18 -9.77 87.86 -9.05Q87.53 -8.33 87.53 -7.41V-5.85Q87.53 -4.71 87.91 -3.94Q88.29 -3.16 88.97 -2.78Q89.66 -2.39 90.57 -2.39Q91.2 -2.39 91.7 -2.57Q92.2 -2.74 92.56 -3.09Q92.92 -3.43 93.11 -3.94L96.29 -3.34Q95.98 -2.26 95.19 -1.45Q94.41 -0.63 93.23 -0.19Q92.05 0.26 90.52 0.26ZM102.55 0.26Q101.31 0.26 100.32 -0.18Q99.33 -0.62 98.76 -1.49Q98.19 -2.37 98.19 -3.67Q98.19 -4.76 98.6 -5.5Q99 -6.23 99.7 -6.68Q100.39 -7.12 101.28 -7.36Q102.16 -7.59 103.14 -7.69Q104.27 -7.8 104.97 -7.9Q105.67 -8 105.99 -8.22Q106.31 -8.44 106.31 -8.86V-8.92Q106.31 -9.48 106.08 -9.87Q105.84 -10.25 105.39 -10.46Q104.93 -10.66 104.26 -10.66Q103.58 -10.66 103.08 -10.46Q102.57 -10.25 102.26 -9.91Q101.94 -9.57 101.79 -9.15L98.57 -9.69Q98.91 -10.83 99.69 -11.62Q100.48 -12.42 101.64 -12.84Q102.81 -13.27 104.26 -13.27Q105.33 -13.27 106.32 -13.01Q107.32 -12.76 108.11 -12.23Q108.9 -11.71 109.37 -10.86Q109.83 -10.02 109.83 -8.82V0H106.5V-1.82H106.38Q106.07 -1.21 105.54 -0.74Q105.01 -0.28 104.27 -0.01Q103.52 0.26 102.55 0.26ZM103.55 -2.21Q104.38 -2.21 105.01 -2.54Q105.63 -2.87 105.98 -3.43Q106.34 -4 106.34 -4.69V-6.11Q106.18 -5.99 105.87 -5.89Q105.55 -5.8 105.16 -5.73Q104.78 -5.66 104.4 -5.6Q104.03 -5.54 103.73 -5.51Q103.09 -5.41 102.6 -5.2Q102.11 -4.99 101.84 -4.65Q101.57 -4.3 101.57 -3.76Q101.57 -3.26 101.82 -2.91Q102.08 -2.57 102.52 -2.39Q102.96 -2.21 103.55 -2.21ZM116.34 -17.46V0H112.83V-17.46Z';

const WORDMARK_WIDTH = 117.83;
const WORDMARK_CAP = 17.46;

function wordmarkPath(fill, x, y, scale = 1) {
  const s = scale === 1 ? '' : ` transform="translate(${r(x)} ${r(y)}) scale(${r(scale)})"`;
  const t = scale === 1 ? ` transform="translate(${r(x)} ${r(y)})"` : s;
  return `<path fill="${fill}" d="${WORDMARK_24}"${t}/>`;
}

/**
 * Official mark on a 100×100 canvas matching the product PNG framing.
 * Cab on the left (truck faces left). Cargo holds AI chip + leaf.
 */
function path(fill, d, evenodd = false) {
  const rule = evenodd ? ' fill-rule="evenodd"' : '';
  return `<path fill="${fill}"${rule} d="${d}"/>`;
}

function markFills(fill, { simple = false } = {}) {
  const sw = 4;
  const chipSw = 3;
  const out = [];

  out.push(path(fill, roundedRectRing(31, 24, 62, 40.5, 4, sw), true));
  out.push(`<g fill="none" stroke="${fill}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M31 33.1H16.2L4.6 47.3V64.6H16.5"/>
    <path d="M7 47.3H23.2"/>
  </g>`);
  out.push(path(fill, capsule(8, 75, 88, 75, sw)));
  out.push(path(fill, circleRing(19.5, 66.7, 6.6, sw), true));
  out.push(path(fill, circleRing(75.5, 66.7, 6.6, sw), true));

  if (!simple) {
    out.push(path(fill, roundedRectRing(40, 34, 23, 21.5, 1.5, chipSw), true));
    const pins = [
      [44, 33.6, 44, 29.2],
      [49, 33.6, 49, 29.2],
      [54, 33.6, 54, 29.2],
      [44, 55.7, 44, 60.2],
      [49, 55.7, 49, 60.2],
      [54, 55.7, 54, 60.2],
      [40, 38.2, 35.2, 38.2],
      [40, 44.8, 35.2, 44.8],
      [40, 51.4, 35.2, 51.4],
      [63, 38.2, 67.2, 38.2],
      [63, 44.8, 67.2, 44.8],
      [63, 51.4, 67.2, 51.4],
    ];
    for (const [x1, y1, x2, y2] of pins) out.push(path(fill, capsule(x1, y1, x2, y2, chipSw, 'butt', 'round')));

    const leafOuter =
      'M73.6 53.8C70 46.2 73.2 34.4 81.2 32C88.4 31 90.2 38.4 87.4 46.4C84.8 53.4 78.2 56.8 73.6 53.8Z';
    const leafInner =
      'M75.8 51C73.4 45.6 75.2 37.4 81 35.4C85.6 34.8 86.8 40.2 84.6 46C82.4 51 78.4 53.2 75.8 51Z';
    out.push(path(fill, leafOuter + leafInner, true));
    out.push(path(fill, capsule(75.6, 50.4, 85, 35.6, 2.7)));

    out.push(
      path(
        fill,
        'M49.5 38.6L54.7 51H51.6L50.7 47.4H48.1L47.1 51H44.1L49.5 38.6ZM49.5 42L51.1 45.8H47.7Z',
        true,
      ),
    );
    out.push(path(fill, 'M57.1 39H59.6V51H57.1Z'));
  }

  return `
  <g>${out.join('\n  ')}</g>`;
}

function svgDoc(viewBox, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img">
  <title>${title}</title>${body}
</svg>
`;
}

function markDoc(title, fill, opts) {
  return svgDoc('0 0 100 100', title, `
  ${markFills(fill, opts)}`);
}

async function writeSvg(name, content) {
  await writeFile(join(SVG, `${name}.svg`), content, 'utf8');
}

function rasterize(svgString, size) {
  const resvg = new Resvg(svgString, {
    fitTo: { mode: 'width', value: size },
    font: { loadSystemFonts: false },
    background: 'rgba(0,0,0,0)',
  });
  return resvg.render().asPng();
}

async function writePng(name, svgString, size) {
  await writeFile(join(PNG, `${name}-${size}.png`), rasterize(svgString, size));
}

function horizontalLockup(markFill, wordFill) {
  const gap = 8;
  const icon = 32;
  const baseline = 24.2;
  const width = Math.ceil(icon + gap + WORDMARK_WIDTH);
  return svgDoc(
    `0 0 ${width} 32`,
    'MoveDeal lockup horizontal',
    `
  <g transform="scale(0.32)">${markFills(markFill)}</g>
  ${wordmarkPath(wordFill, icon + gap, baseline)}`,
  );
}

function stackedLockup(markFill, wordFill) {
  const icon = 64;
  const gap = 10;
  const wmScale = 1;
  const wmW = WORDMARK_WIDTH * wmScale;
  const width = Math.ceil(Math.max(icon, wmW) + 16);
  const markX = (width - icon) / 2;
  const wordX = (width - wmW) / 2;
  const wordY = icon + gap + WORDMARK_CAP;
  const height = Math.ceil(wordY + 4);
  return svgDoc(
    `0 0 ${width} ${height}`,
    'MoveDeal lockup stacked',
    `
  <g transform="translate(${r(markX)} 0) scale(0.64)">${markFills(markFill)}</g>
  ${wordmarkPath(wordFill, wordX, wordY)}`,
  );
}

function wordmarkOnly(fill) {
  const pad = 1;
  return svgDoc(
    `${-pad} ${-WORDMARK_CAP - pad} ${r(WORDMARK_WIDTH + pad * 2)} ${r(WORDMARK_CAP + 6 + pad)}`,
    'MoveDeal wordmark',
    `
  ${wordmarkPath(fill, 0, 0)}`,
  );
}

async function main() {
  await mkdir(SVG, { recursive: true });
  await mkdir(PNG, { recursive: true });

  const symbols = [
    ['movedeal-mark-color', OCEAN],
    ['movedeal-mark-mono', 'currentColor'],
    ['movedeal-mark-reversed', PAPER],
    ['movedeal-mark-on-ocean', WHITE],
    ['movedeal-mark-black', '#000000'],
    ['movedeal-mark-white', WHITE],
  ];

  for (const [name, fill] of symbols) {
    let svg;
    if (name === 'movedeal-mark-on-ocean') {
      svg = svgDoc(
        '0 0 100 100',
        `MoveDeal mark — ${name}`,
        `
  <rect width="100" height="100" rx="18" fill="${OCEAN}"/>
  <g transform="translate(6 4) scale(0.88)">${markFills(WHITE)}</g>`,
      );
    } else if (name === 'movedeal-mark-mono') {
      svg = markDoc(`MoveDeal mark — ${name}`, 'currentColor');
    } else {
      svg = markDoc(`MoveDeal mark — ${name}`, fill);
    }
    await writeSvg(name, svg);
    if (fill !== 'currentColor') {
      await writePng(name, svg, 512);
      await writePng(name, svg, 1024);
    } else {
      const raster = markDoc('MoveDeal mark — mono', INK);
      await writePng(name, raster, 512);
      await writePng(name, raster, 1024);
    }
  }

  const favicon = markDoc('MoveDeal favicon', OCEAN, { simple: true });
  await writeSvg('movedeal-favicon', favicon);
  await writePng('movedeal-favicon', favicon, 32);
  await writePng('movedeal-favicon', favicon, 64);

  const appIcon = svgDoc(
    '0 0 100 100',
    'MoveDeal app icon',
    `
  <rect width="100" height="100" rx="22" fill="${OCEAN}"/>
  <g transform="translate(8 6) scale(0.84)">${markFills(WHITE)}</g>`,
  );
  await writeSvg('movedeal-app-icon', appIcon);
  await writePng('movedeal-app-icon', appIcon, 512);
  await writePng('movedeal-app-icon', appIcon, 1024);
  await writePng('movedeal-icon', appIcon, 192);
  await writePng('movedeal-icon', appIcon, 512);

  const profiles = [
    ['movedeal-profile-light', PAPER, OCEAN],
    ['movedeal-profile-dark', NIGHT, PAPER],
    ['movedeal-profile-ocean', OCEAN, WHITE],
    ['movedeal-profile-signal', SIGNAL, WHITE],
  ];
  for (const [name, bg, fill] of profiles) {
    const svg = svgDoc(
      '0 0 100 100',
      name,
      `
  <rect width="100" height="100" fill="${bg}"/>
  <g transform="translate(12 10) scale(0.76)">${markFills(fill)}</g>`,
    );
    await writeSvg(name, svg);
    await writePng(name, svg, 512);
    await writePng(name, svg, 1024);
  }

  const horizLight = horizontalLockup(OCEAN, OCEAN);
  const horizDark = horizontalLockup(PAPER, PAPER);
  await writeSvg('movedeal-lockup-horizontal-light', horizLight);
  await writeSvg('movedeal-lockup-horizontal-dark', horizDark);
  for (const size of [256, 512]) {
    await writePng('movedeal-lockup-horizontal-light', horizLight, size);
    await writePng('movedeal-lockup-horizontal-dark', horizDark, size);
    await writePng('movedeal-lockup-horizontal-transparent', horizLight, size);
  }

  const stackedLight = stackedLockup(OCEAN, OCEAN);
  const stackedDark = stackedLockup(PAPER, PAPER);
  await writeSvg('movedeal-lockup-stacked-light', stackedLight);
  await writeSvg('movedeal-lockup-stacked-dark', stackedDark);
  for (const size of [512, 1024]) {
    await writePng('movedeal-lockup-stacked-light', stackedLight, size);
    await writePng('movedeal-lockup-stacked-dark', stackedDark, size);
    await writePng('movedeal-lockup-stacked-transparent', stackedLight, size);
  }

  const wmColor = wordmarkOnly(OCEAN);
  const wmWhite = wordmarkOnly(WHITE);
  const wmInk = wordmarkOnly(INK);
  await writeSvg('movedeal-wordmark-color', wmColor);
  await writeSvg('movedeal-wordmark-white', wmWhite);
  await writeSvg('movedeal-wordmark-ink', wmInk);
  await writePng('movedeal-wordmark-color', wmColor, 512);

  const symbol = markDoc('MoveDeal symbol', OCEAN);
  for (const size of [512, 1024]) {
    await writePng('movedeal-lockup-symbol-light', symbol, size);
    await writePng(
      'movedeal-lockup-symbol-dark',
      markDoc('symbol dark', PAPER),
      size,
    );
    await writePng('movedeal-lockup-symbol-transparent', symbol, size);
  }

  const srcLogo = join(ROOT, 'assets-src', 'movedeal-logo-source.png');
  try {
    await access(srcLogo);
    await copyFile(srcLogo, join(PNG, 'movedeal-product-logo-original.png'));
  } catch {
    /* optional */
  }

  console.log('MoveDeal brand assets generated from live product mark.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

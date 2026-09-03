/**
 * MoveDeal brand assets — MD monogram traced from the brand-sheet PNG.
 * Filled geometric M + open D + house-roof arrow + cyan notch. Wordmark: Inter Bold “MoveDeal”.
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

/** Brand sheet tokens */
const BRAND = '#5B4BFF';
const CYAN = '#19D3FF';
const INK = '#0A0F14';
const WHITE = '#FFFFFF';
const PAPER = '#F8F9FA';

const r = (n) => {
  const v = Math.round(n * 10) / 10;
  return Object.is(v, -0) ? 0 : v;
};

/** Inter Bold 24px “MoveDeal” outlines. Baseline y=0, cap −17.46, width 117.83. */
const WORDMARK_24 =
  'M1.58 0V-17.46H7.07L9.9 -9.45Q10.08 -8.88 10.31 -7.99Q10.54 -7.1 10.77 -6.07Q11 -5.04 11.21 -4.07Q11.41 -3.09 11.54 -2.38H10.85Q10.98 -3.08 11.19 -4.05Q11.39 -5.02 11.62 -6.05Q11.86 -7.08 12.09 -7.98Q12.32 -8.88 12.49 -9.45L15.28 -17.46H20.79V0H17.19V-8.24Q17.19 -8.8 17.21 -9.66Q17.24 -10.51 17.26 -11.5Q17.29 -12.49 17.31 -13.49Q17.33 -14.5 17.34 -15.39H17.57Q17.34 -14.41 17.07 -13.38Q16.8 -12.34 16.53 -11.37Q16.25 -10.39 16.01 -9.58Q15.76 -8.77 15.59 -8.24L12.69 0H9.68L6.74 -8.24Q6.56 -8.77 6.32 -9.57Q6.07 -10.37 5.79 -11.34Q5.52 -12.32 5.24 -13.35Q4.96 -14.39 4.7 -15.39H4.98Q4.99 -14.54 5.02 -13.55Q5.04 -12.55 5.07 -11.55Q5.1 -10.55 5.12 -9.69Q5.13 -8.82 5.13 -8.24V0ZM29.72 0.26Q27.75 0.26 26.31 -0.59Q24.87 -1.44 24.09 -2.96Q23.31 -4.48 23.31 -6.49Q23.31 -8.53 24.09 -10.05Q24.87 -11.57 26.31 -12.42Q27.75 -13.27 29.72 -13.27Q31.7 -13.27 33.13 -12.42Q34.57 -11.57 35.35 -10.05Q36.13 -8.53 36.13 -6.49Q36.13 -4.48 35.35 -2.96Q34.57 -1.44 33.13 -0.59Q31.7 0.26 29.72 0.26ZM29.72 -2.51Q30.66 -2.51 31.29 -3.03Q31.92 -3.55 32.24 -4.46Q32.55 -5.37 32.55 -6.5Q32.55 -7.66 32.24 -8.57Q31.92 -9.47 31.29 -9.98Q30.66 -10.5 29.72 -10.5Q28.78 -10.5 28.15 -9.98Q27.53 -9.47 27.21 -8.57Q26.89 -7.66 26.89 -6.5Q26.89 -5.37 27.21 -4.46Q27.53 -3.55 28.15 -3.03Q28.78 -2.51 29.72 -2.51ZM42.27 0 37.44 -13.1H41.18L43.38 -6.3Q43.78 -5.03 44.08 -3.73Q44.38 -2.43 44.7 -1.03H43.95Q44.25 -2.43 44.54 -3.73Q44.84 -5.03 45.23 -6.3L47.41 -13.1H51.11L46.27 0ZM58.89 0.26Q56.88 0.26 55.43 -0.56Q53.98 -1.38 53.2 -2.89Q52.42 -4.41 52.42 -6.48Q52.42 -8.51 53.19 -10.03Q53.96 -11.55 55.38 -12.41Q56.8 -13.27 58.71 -13.27Q60 -13.27 61.11 -12.86Q62.23 -12.45 63.07 -11.62Q63.91 -10.79 64.39 -9.55Q64.86 -8.31 64.86 -6.62V-5.64H53.86V-7.84H63.14L61.5 -7.25Q61.5 -8.27 61.19 -9.03Q60.88 -9.79 60.26 -10.2Q59.65 -10.62 58.73 -10.62Q57.83 -10.62 57.19 -10.2Q56.55 -9.77 56.23 -9.05Q55.9 -8.33 55.9 -7.41V-5.85Q55.9 -4.71 56.28 -3.94Q56.66 -3.16 57.35 -2.78Q58.03 -2.39 58.95 -2.39Q59.57 -2.39 60.07 -2.57Q60.57 -2.74 60.93 -3.09Q61.29 -3.43 61.48 -3.94L64.66 -3.34Q64.35 -2.26 63.56 -1.45Q62.78 -0.63 61.6 -0.19Q60.42 0.26 58.89 0.26ZM73.48 0H68.96V-3.08H73.31Q75 -3.08 76.14 -3.68Q77.29 -4.28 77.86 -5.53Q78.43 -6.79 78.43 -8.74Q78.43 -10.69 77.85 -11.94Q77.27 -13.18 76.14 -13.78Q75.01 -14.38 73.34 -14.38H68.88V-17.46H73.55Q76.17 -17.46 78.06 -16.41Q79.96 -15.36 80.98 -13.41Q82 -11.46 82 -8.74Q82 -6.01 80.98 -4.05Q79.96 -2.1 78.05 -1.05Q76.14 0 73.48 0ZM70.92 -17.46V0H67.35V-17.46ZM90.52 0.26Q88.51 0.26 87.06 -0.56Q85.61 -1.38 84.83 -2.89Q84.05 -4.41 84.05 -6.48Q84.05 -8.51 84.82 -10.03Q85.59 -11.55 87.01 -12.41Q88.43 -13.27 90.34 -13.27Q91.63 -13.27 92.74 -12.86Q93.86 -12.45 94.7 -11.62Q95.54 -10.79 96.02 -9.55Q96.49 -8.31 96.49 -6.62V-5.64H85.49V-7.84H94.77L93.13 -7.25Q93.13 -8.27 92.82 -9.03Q92.51 -9.79 91.89 -10.2Q91.28 -10.62 90.36 -10.62Q89.46 -10.62 88.82 -10.2Q88.18 -9.77 87.86 -9.05Q87.53 -8.33 87.53 -7.41V-5.85Q87.53 -4.71 87.91 -3.94Q88.29 -3.16 88.97 -2.78Q89.66 -2.39 90.57 -2.39Q91.2 -2.39 91.7 -2.57Q92.2 -2.74 92.56 -3.09Q92.92 -3.43 93.11 -3.94L96.29 -3.34Q95.98 -2.26 95.19 -1.45Q94.41 -0.63 93.23 -0.19Q92.05 0.26 90.52 0.26ZM102.55 0.26Q101.31 0.26 100.32 -0.18Q99.33 -0.62 98.76 -1.49Q98.19 -2.37 98.19 -3.67Q98.19 -4.76 98.6 -5.5Q99 -6.23 99.7 -6.68Q100.39 -7.12 101.28 -7.36Q102.16 -7.59 103.14 -7.69Q104.27 -7.8 104.97 -7.9Q105.67 -8 105.99 -8.22Q106.31 -8.44 106.31 -8.86V-8.92Q106.31 -9.48 106.08 -9.87Q105.84 -10.25 105.39 -10.46Q104.93 -10.66 104.26 -10.66Q103.58 -10.66 103.08 -10.46Q102.57 -10.25 102.26 -9.91Q101.94 -9.57 101.79 -9.15L98.57 -9.69Q98.91 -10.83 99.69 -11.62Q100.48 -12.42 101.64 -12.84Q102.81 -13.27 104.26 -13.27Q105.33 -13.27 106.32 -13.01Q107.32 -12.76 108.11 -12.23Q108.9 -11.71 109.37 -10.86Q109.83 -10.02 109.83 -8.82V0H106.5V-1.82H106.38Q106.07 -1.21 105.54 -0.74Q105.01 -0.28 104.27 -0.01Q103.52 0.26 102.55 0.26ZM103.55 -2.21Q104.38 -2.21 105.01 -2.54Q105.63 -2.87 105.98 -3.43Q106.34 -4 106.34 -4.69V-6.11Q106.18 -5.99 105.87 -5.89Q105.55 -5.8 105.16 -5.73Q104.78 -5.66 104.4 -5.6Q104.03 -5.54 103.73 -5.51Q103.09 -5.41 102.6 -5.2Q102.11 -4.99 101.84 -4.65Q101.57 -4.3 101.57 -3.76Q101.57 -3.26 101.82 -2.91Q102.08 -2.57 102.52 -2.39Q102.96 -2.21 103.55 -2.21ZM116.34 -17.46V0H112.83V-17.46Z';

const WORDMARK_WIDTH = 117.83;
const WORDMARK_CAP = 17.46;

function wordmarkPath(fill, x, y, scale = 1) {
  const s = scale === 1 ? '' : ` transform="translate(${r(x)} ${r(y)}) scale(${r(scale)})"`;
  const t = scale === 1 ? ` transform="translate(${r(x)} ${r(y)})"` : s;
  return `<path fill="${fill}" d="${WORDMARK_24}"${t}/>`;
}

function svgDoc(viewBox, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img">
  <title>${title}</title>${body}
</svg>
`;
}

/**
 * Source design space of the brand-sheet mark (pixels from the reference PNG).
 * Logo lives at (36,36) size 267×153 inside a 327×233 frame.
 */
const MARK_SRC = { x: 36, y: 36, w: 267, h: 153 };

/** Filled MD body — geometric M, open D, cyan notch. Image-space coords. */
const MARK_BODY =
  'M36 36 L36 166 A22 22 0 0 0 58 188 L107 188 A29.5 29.5 0 0 1 104 163 L61 163 L59 70 L120 128 L186 61 L236 61 A52.36 52.36 0 0 1 237 163 L179 163 L179 188 L233 188 L243 187 A77.81 77.81 0 0 0 252 39 L239 36 L175 36 L119 91 L64 36 Z';

/** NE house-roof arrow with SW cut toward the cyan. */
const MARK_ARROW = 'M211 92 L191 92 L141 144 L151 149 L159 161 L211 108 Z';

const MARK_DOT = { cx: 132.72, cy: 169.85, r: 18.35 };

/** Raw mark in source image coordinates (not 100×100). */
function markPaths(strokeFill, dotFill = CYAN) {
  return `
  <path fill="${strokeFill}" d="${MARK_BODY}"/>
  <path fill="${strokeFill}" d="${MARK_ARROW}"/>
  <circle cx="${MARK_DOT.cx}" cy="${MARK_DOT.cy}" r="${MARK_DOT.r}" fill="${dotFill}"/>`;
}

/** Fit the landscape mark into a 100×100 square, centered, uniform scale. */
function markGroup(strokeFill, dotFill = CYAN, _knockout = null) {
  const s = 92 / MARK_SRC.w;
  const tx = (100 - MARK_SRC.w * s) / 2 - MARK_SRC.x * s;
  const ty = (100 - MARK_SRC.h * s) / 2 - MARK_SRC.y * s;
  return `<g transform="translate(${r(tx)} ${r(ty)}) scale(${r(s)})">${markPaths(strokeFill, dotFill)}</g>`;
}

/** Mono: mark + dot same color (no cyan accent). */
function markGroupMono(fill) {
  return markGroup(fill, fill);
}

function markDoc(title, strokeFill, dotFill) {
  const pad = 6;
  const vb = `${MARK_SRC.x - pad} ${MARK_SRC.y - pad} ${MARK_SRC.w + pad * 2} ${MARK_SRC.h + pad * 2}`;
  return svgDoc(vb, title, markPaths(strokeFill, dotFill));
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

function markAtHeight(strokeFill, dotFill, height, x = 0, y = 0) {
  const s = height / MARK_SRC.h;
  const tx = x - MARK_SRC.x * s;
  const ty = y - MARK_SRC.y * s;
  return `<g transform="translate(${r(tx)} ${r(ty)}) scale(${r(s)})">${markPaths(strokeFill, dotFill)}</g>`;
}

function horizontalLockup(markStroke, markDot, wordFill) {
  const gap = 8;
  const iconH = 32;
  const iconW = MARK_SRC.w * (iconH / MARK_SRC.h);
  const baseline = 24.2;
  const width = Math.ceil(iconW + gap + WORDMARK_WIDTH);
  return svgDoc(
    `0 0 ${width} 32`,
    'MoveDeal lockup horizontal',
    `
  ${markAtHeight(markStroke, markDot, iconH)}
  ${wordmarkPath(wordFill, iconW + gap, baseline)}`,
  );
}

function stackedLockup(markStroke, markDot, wordFill) {
  const iconH = 64;
  const iconW = MARK_SRC.w * (iconH / MARK_SRC.h);
  const gap = 10;
  const wmW = WORDMARK_WIDTH;
  const width = Math.ceil(Math.max(iconW, wmW) + 16);
  const markX = (width - iconW) / 2;
  const wordX = (width - wmW) / 2;
  const wordY = iconH + gap + WORDMARK_CAP;
  const height = Math.ceil(wordY + 4);
  return svgDoc(
    `0 0 ${width} ${height}`,
    'MoveDeal lockup stacked',
    `
  ${markAtHeight(markStroke, markDot, iconH, markX, 0)}
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

  // Color mark (violet + cyan)
  const markColor = markDoc('MoveDeal mark — color', BRAND, CYAN);
  await writeSvg('movedeal-mark-color', markColor);
  await writePng('movedeal-mark-color', markColor, 512);
  await writePng('movedeal-mark-color', markColor, 1024);

  // White mark (for dark / brand fields) — keep cyan accent; no fixed knockout (bg varies)
  const markWhite = markDoc('MoveDeal mark — white', WHITE, CYAN);
  await writeSvg('movedeal-mark-white', markWhite);
  await writePng('movedeal-mark-white', markWhite, 512);

  // Mono / black / reversed / currentColor
  const markMono = svgDoc('0 0 100 100', 'MoveDeal mark — mono', markGroupMono('currentColor'));
  await writeSvg('movedeal-mark-mono', markMono);
  await writePng('movedeal-mark-mono', markDoc('mono raster', INK, INK), 512);

  const markBlack = markDoc('MoveDeal mark — black', INK, INK);
  await writeSvg('movedeal-mark-black', markBlack);
  await writePng('movedeal-mark-black', markBlack, 512);

  const markReversed = markDoc('MoveDeal mark — reversed', PAPER, PAPER);
  await writeSvg('movedeal-mark-reversed', markReversed);

  // On-brand tile (legacy name kept for kit completeness)
  const markOnBrand = svgDoc(
    '0 0 100 100',
    'MoveDeal mark — on brand',
    `
  <rect width="100" height="100" rx="18" fill="${BRAND}"/>
  <g transform="translate(6 4) scale(0.88)">${markGroup(WHITE, CYAN, BRAND)}</g>`,
  );
  await writeSvg('movedeal-mark-on-ocean', markOnBrand);
  await writePng('movedeal-mark-on-ocean', markOnBrand, 512);

  // Favicon — full color mark
  // Favicon — square padded mark (landscape crop is too thin in a tab)
  const favicon = svgDoc('0 0 100 100', 'MoveDeal', markGroup(BRAND, CYAN));
  await writeSvg('movedeal-favicon', favicon);
  await writePng('movedeal-favicon', favicon, 32);
  await writePng('movedeal-favicon', favicon, 64);

  // App icon — brand rounded square, white MD, cyan dot
  const appIcon = svgDoc(
    '0 0 100 100',
    'MoveDeal app icon',
    `
  <rect width="100" height="100" rx="22" fill="${BRAND}"/>
  <g transform="translate(8 6) scale(0.84)">${markGroup(WHITE, CYAN, BRAND)}</g>`,
  );
  await writeSvg('movedeal-app-icon', appIcon);
  await writePng('movedeal-app-icon', appIcon, 512);
  await writePng('movedeal-app-icon', appIcon, 1024);
  await writePng('movedeal-icon', appIcon, 192);
  await writePng('movedeal-icon', appIcon, 512);

  // Profile tiles
  const profiles = [
    ['movedeal-profile-light', PAPER, BRAND, CYAN],
    ['movedeal-profile-dark', INK, BRAND, CYAN],
    ['movedeal-profile-ocean', BRAND, WHITE, CYAN],
    ['movedeal-profile-signal', CYAN, INK, BRAND],
  ];
  for (const [name, bg, stroke, dot] of profiles) {
    const svg = svgDoc(
      '0 0 100 100',
      name,
      `
  <rect width="100" height="100" fill="${bg}"/>
  <g transform="translate(12 10) scale(0.76)">${markGroup(stroke, dot, bg)}</g>`,
    );
    await writeSvg(name, svg);
    await writePng(name, svg, 512);
  }

  // Lockups — light: brand mark + ink wordmark; dark: brand mark + white wordmark
  const horizLight = horizontalLockup(BRAND, CYAN, INK);
  const horizDark = horizontalLockup(BRAND, CYAN, WHITE);
  await writeSvg('movedeal-lockup-horizontal-light', horizLight);
  await writeSvg('movedeal-lockup-horizontal-dark', horizDark);
  for (const size of [256, 512]) {
    await writePng('movedeal-lockup-horizontal-light', horizLight, size);
    await writePng('movedeal-lockup-horizontal-dark', horizDark, size);
  }

  const stackedLight = stackedLockup(BRAND, CYAN, INK);
  const stackedDark = stackedLockup(BRAND, CYAN, WHITE);
  await writeSvg('movedeal-lockup-stacked-light', stackedLight);
  await writeSvg('movedeal-lockup-stacked-dark', stackedDark);
  for (const size of [512, 1024]) {
    await writePng('movedeal-lockup-stacked-light', stackedLight, size);
    await writePng('movedeal-lockup-stacked-dark', stackedDark, size);
  }

  const wmColor = wordmarkOnly(BRAND);
  const wmWhite = wordmarkOnly(WHITE);
  const wmInk = wordmarkOnly(INK);
  await writeSvg('movedeal-wordmark-color', wmColor);
  await writeSvg('movedeal-wordmark-white', wmWhite);
  await writeSvg('movedeal-wordmark-ink', wmInk);
  await writePng('movedeal-wordmark-color', wmColor, 512);
  await writePng('movedeal-wordmark-ink', wmInk, 512);

  // Symbol exports
  for (const size of [512, 1024]) {
    await writePng('movedeal-lockup-symbol-light', markColor, size);
    await writePng('movedeal-lockup-symbol-dark', markWhite, size);
  }

  // Product logo alias used by Next OG / schema
  await writePng('movedeal-logo', appIcon, 512);
  await writePng('movedeal-logo', appIcon, 1024);

  const srcLogo = join(ROOT, 'assets-src', 'movedeal-logo-source.png');
  try {
    await access(srcLogo);
    await copyFile(srcLogo, join(PNG, 'movedeal-product-logo-original.png'));
  } catch {
    /* optional */
  }

  console.log('MoveDeal MD monogram brand assets generated (violet / cyan / ink).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

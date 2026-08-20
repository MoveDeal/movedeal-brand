/**
 * MoveDeal brand assets — truck mark is the ONLY official symbol.
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

/** Official MoveDeal product mark — delivery truck + AI chip + leaf. */
function truckMark(stroke, textFill = stroke) {
  return `
  <g fill="none" stroke="${stroke}" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round">
    <rect x="30" y="26" width="50" height="34" rx="2.5"/>
    <path d="M30 42 H18.5 C16.5 42 15 43.5 15 45.5 V58 H30"/>
    <path d="M18.5 42 L14 50 H30"/>
    <circle cx="30" cy="66" r="5.5"/>
    <circle cx="66" cy="66" r="5.5"/>
    <path d="M10 74 H86"/>
    <rect x="38" y="34" width="15" height="15" rx="1.5"/>
    <path d="M41 34 V31 M45.5 34 V31 M50 34 V31 M41 49 V52 M45.5 49 V52 M50 49 V52 M38 37 H35 M38 41.5 H35 M38 46 H35 M53 37 H56 M53 41.5 H56 M53 46 H56"/>
    <path d="M62 36 C70 36 74 42 74 47 C74 52 70 55 64 55 C58 55 56 50 56 46 C56 40 58 36 62 36 Z"/>
    <path d="M62 38 C64 42 65 46 65 52"/>
  </g>
  <text x="45.5" y="45" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="7.5" font-weight="700" fill="${textFill}">AI</text>`;
}

function svgDoc(viewBox, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  <title>${title}</title>${body}
</svg>
`;
}

function wordmark(fill, x = 108, y = 56, size = 22) {
  return `<text x="${x}" y="${y}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="${size}" font-weight="700" fill="${fill}" letter-spacing="-0.03em">MoveDeal</text>`;
}

async function writeSvg(name, content) {
  await writeFile(join(SVG, `${name}.svg`), content, 'utf8');
}

function rasterize(svgString, size) {
  const resvg = new Resvg(svgString, {
    fitTo: { mode: 'width', value: size },
    font: { loadSystemFonts: true },
    background: 'rgba(0,0,0,0)',
  });
  return resvg.render().asPng();
}

async function writePng(name, svgString, size) {
  await writeFile(join(PNG, `${name}-${size}.png`), rasterize(svgString, size));
}

async function main() {
  await mkdir(SVG, { recursive: true });
  await mkdir(PNG, { recursive: true });

  // --- Symbol variants (truck only) ---
  const symbols = [
    ['movedeal-mark-color', OCEAN, OCEAN, null],
    ['movedeal-mark-mono', INK, INK, null],
    ['movedeal-mark-reversed', PAPER, PAPER, null],
    ['movedeal-mark-on-ocean', WHITE, WHITE, null],
    ['movedeal-mark-black', '#000000', '#000000', null],
    ['movedeal-mark-white', WHITE, WHITE, null],
  ];

  for (const [name, stroke, text, _bg] of symbols) {
    const svg = svgDoc('0 0 96 96', `MoveDeal mark — ${name}`, truckMark(stroke, text));
    await writeSvg(name, svg);
    await writePng(name, svg, 512);
    await writePng(name, svg, 1024);
  }

  // Favicon = truck color
  await writeSvg(
    'movedeal-favicon',
    svgDoc('0 0 96 96', 'MoveDeal favicon', truckMark(OCEAN)),
  );

  // App icon — rounded Ocean tile, white truck
  const appIcon = svgDoc(
    '0 0 96 96',
    'MoveDeal app icon',
    `
  <rect width="96" height="96" rx="20" fill="${OCEAN}"/>
  <g transform="translate(0,-2) scale(0.92) translate(4,6)">
    ${truckMark(WHITE)}
  </g>`,
  );
  await writeSvg('movedeal-app-icon', appIcon);
  await writePng('movedeal-app-icon', appIcon, 512);
  await writePng('movedeal-app-icon', appIcon, 1024);

  // Profiles
  const profiles = [
    ['movedeal-profile-light', PAPER, OCEAN],
    ['movedeal-profile-dark', NIGHT, PAPER],
    ['movedeal-profile-ocean', OCEAN, WHITE],
    ['movedeal-profile-signal', SIGNAL, WHITE],
  ];
  for (const [name, bg, stroke] of profiles) {
    const svg = svgDoc(
      '0 0 96 96',
      name,
      `
  <rect width="96" height="96" fill="${bg}"/>
  <g transform="translate(0,-2) scale(0.78) translate(12,14)">
    ${truckMark(stroke)}
  </g>`,
    );
    await writeSvg(name, svg);
    await writePng(name, svg, 512);
    await writePng(name, svg, 1024);
  }

  // Horizontal lockups
  const horizLight = svgDoc(
    '0 0 320 96',
    'MoveDeal lockup horizontal light',
    `
  <g transform="translate(4,0)">${truckMark(OCEAN)}</g>
  ${wordmark(INK, 108, 58, 26)}`,
  );
  const horizDark = svgDoc(
    '0 0 320 96',
    'MoveDeal lockup horizontal dark',
    `
  <g transform="translate(4,0)">${truckMark(PAPER)}</g>
  ${wordmark(PAPER, 108, 58, 26)}`,
  );
  await writeSvg('movedeal-lockup-horizontal-light', horizLight);
  await writeSvg('movedeal-lockup-horizontal-dark', horizDark);
  for (const size of [256, 512]) {
    await writePng('movedeal-lockup-horizontal-light', horizLight, size);
    await writePng('movedeal-lockup-horizontal-dark', horizDark, size);
  }
  // Transparent = same as light mark on transparent (light wordmark)
  await writePng('movedeal-lockup-horizontal-transparent', horizLight, 256);
  await writePng('movedeal-lockup-horizontal-transparent', horizLight, 512);

  // Stacked lockups
  const stackedLight = svgDoc(
    '0 0 200 200',
    'MoveDeal lockup stacked light',
    `
  <g transform="translate(52,18) scale(1)">${truckMark(OCEAN)}</g>
  <text x="100" y="150" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="22" font-weight="700" fill="${INK}" letter-spacing="-0.03em">MoveDeal</text>`,
  );
  const stackedDark = svgDoc(
    '0 0 200 200',
    'MoveDeal lockup stacked dark',
    `
  <g transform="translate(52,18)">${truckMark(PAPER)}</g>
  <text x="100" y="150" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="22" font-weight="700" fill="${PAPER}" letter-spacing="-0.03em">MoveDeal</text>`,
  );
  await writeSvg('movedeal-lockup-stacked-light', stackedLight);
  await writeSvg('movedeal-lockup-stacked-dark', stackedDark);
  for (const size of [512, 1024]) {
    await writePng('movedeal-lockup-stacked-light', stackedLight, size);
    await writePng('movedeal-lockup-stacked-dark', stackedDark, size);
    await writePng('movedeal-lockup-stacked-transparent', stackedLight, size);
  }

  // Symbol-only PNGs (alias of mark)
  const symbol = svgDoc('0 0 96 96', 'MoveDeal symbol', truckMark(OCEAN));
  for (const size of [512, 1024]) {
    await writePng('movedeal-lockup-symbol-light', symbol, size);
    await writePng(
      'movedeal-lockup-symbol-dark',
      svgDoc('0 0 96 96', 'symbol dark', truckMark(PAPER)),
      size,
    );
    await writePng('movedeal-lockup-symbol-transparent', symbol, size);
  }

  // Copy product raster if present
  const srcLogo = join(ROOT, 'assets-src', 'movedeal-logo-source.png');
  try {
    await access(srcLogo);
    await copyFile(srcLogo, join(PNG, 'movedeal-product-logo-original.png'));
  } catch {
    /* optional */
  }

  console.log('MoveDeal brand assets generated (truck mark only).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

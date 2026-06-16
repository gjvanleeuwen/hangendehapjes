import sharp from 'sharp';
import opentype from 'opentype.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dir, '..');
const DEFAULT_SRC = path.join(ROOT, 'static/images/hero.jpeg');

const W = 1200;
const H = 630;
const WORDMARK = 'HANGENDE HAPJES';

// Render the wordmark in the real logo typeface (Lovelo Line). The font's outlined
// "double-line" glyphs don't survive librsvg's text rendering (it fills them solid),
// so we convert the wordmark to actual vector paths with opentype.js — librsvg then
// renders those paths faithfully, preserving the line/outline look of the logo.
const fontBuffer = readFileSync(path.join(ROOT, 'static/lovelo/Lovelo Line Bold.otf'));
const wordmarkFont = opentype.parse(
	fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength)
);
const WORDMARK_SIZE = 34;
const WORDMARK_X = 64;
const WORDMARK_BASELINE = 92;
const wordmarkPathData = wordmarkFont
	.getPath(WORDMARK, WORDMARK_X, WORDMARK_BASELINE, WORDMARK_SIZE)
	.toPathData(2);

const escapeXml = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

type Variant = {
	out: string;
	src?: string;
	eyebrow: string;
	titleLines: string[];
	titleSize?: number;
};

const variants: Variant[] = [
	{
		out: 'static/og-image.jpg',
		eyebrow: 'ENTERTAINEND ETEN',
		titleLines: ['Hapjes die jouw gasten onthouden.'],
		titleSize: 56
	},
	{
		out: 'static/og-blog-hoeveel-hapjes-per-persoon.jpg',
		eyebrow: 'CATERING PLANNER',
		titleLines: [
			'Hoeveel hapjes moet je',
			'serveren per persoon voor',
			'een receptie of bruiloft?'
		],
		titleSize: 48
	},
	{
		out: 'static/og-blog-burrata-catering.jpg',
		src: path.join(ROOT, 'static/images/burrata_closeup.jpeg'),
		eyebrow: 'Entertainend Eten',
		titleLines: ['Burrata vanaf een hangend dienblad,', 'live voor elke gast.'],
		titleSize: 46
	}
];

for (const v of variants) {
	const titleSize = v.titleSize ?? 56;
	const lineHeight = Math.round(titleSize * 1.18);
	const baseY = H - 64;
	const titleStartY = baseY - (v.titleLines.length - 1) * lineHeight;
	const eyebrowY = titleStartY - 70;

	const titleNodes = v.titleLines
		.map(
			(line, i) => `<text
		x="64" y="${titleStartY + i * lineHeight}"
		fill="white"
		font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
		font-size="${titleSize}" font-weight="600"
	>${escapeXml(line)}</text>`
		)
		.join('\n\t');

	const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
	<defs>
		<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color="rgba(12,10,9,0.30)"/>
			<stop offset="55%" stop-color="rgba(12,10,9,0.55)"/>
			<stop offset="100%" stop-color="rgba(12,10,9,0.92)"/>
		</linearGradient>
		<filter id="wmShadow" x="-20%" y="-40%" width="140%" height="180%">
			<feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.6)"/>
		</filter>
	</defs>
	<rect width="${W}" height="${H}" fill="url(#g)"/>
	<path d="${wordmarkPathData}" fill="rgba(255,255,255,0.96)" filter="url(#wmShadow)"/>
	<text
		x="64" y="${eyebrowY}"
		fill="rgba(255,255,255,0.82)"
		font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
		font-size="20" font-weight="500" letter-spacing="5"
	>${escapeXml(v.eyebrow.toUpperCase())}</text>
	${titleNodes}
</svg>`;

	const out = path.join(ROOT, v.out);
	await sharp(v.src ?? DEFAULT_SRC)
		.resize(W, H, { fit: 'cover', position: sharp.strategy.attention })
		.composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
		.jpeg({ quality: 88, progressive: true, mozjpeg: true })
		.toFile(out);

	console.log(`✓ wrote ${path.relative(ROOT, out)} (${W}×${H})`);
}

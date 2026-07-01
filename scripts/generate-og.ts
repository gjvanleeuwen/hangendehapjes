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
	// When set, the background is a side-by-side triptych of these images (cover-cropped
	// into equal columns) instead of a single photo. Used for the wedding-cake collage.
	collage?: string[];
	// Crop gravity for the single-photo background. Defaults to sharp's "attention"
	// (salient region), but some shots need a fixed bias, e.g. 'bottom' to keep a
	// subject sitting low in the frame.
	position?: string;
	// Horizontal alignment of the eyebrow + title block. Defaults to 'left'; use 'right'
	// to keep the text clear of a subject sitting on the left of the photo.
	align?: 'left' | 'right';
	eyebrow: string;
	titleLines: string[];
	titleSize?: number;
};

const img = (name: string) => path.join(ROOT, 'static/images', name);

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
	},
	{
		out: 'static/og-blog-tiramisu-bruiloft.jpg',
		src: img('tiramisutaart_cacao.jpg'),
		// Keep the lower part of the frame so both the live hapje (the cup) and the
		// cacao taart underneath stay visible.
		position: 'bottom',
		eyebrow: 'De Toetjes Vrouw',
		titleLines: ['Tiramisu op je bruiloft'],
		titleSize: 48
	},
	{
		out: 'static/og-blog-italiaanse-bruidstaart.jpg',
		src: img('GuidoDijkstraFotografie.com-DSC07206.jpg'),
		// Cake sits on the left, so anchor the text on the right to keep it clear.
		align: 'right',
		eyebrow: 'De Toetjes Vrouw',
		titleLines: ['Italiaanse bruidstaart:', 'een verse millefeuille.'],
		titleSize: 48
	},
	{
		out: 'static/og-blog-bruidstaart.jpg',
		collage: [
			img('bruidstaart_80_pers.jpeg'),
			img('bruidstaart_orchidee.jpeg'),
			img('lage_bruidstaart.jpeg')
		],
		eyebrow: 'De Toetjes Vrouw',
		titleLines: ['Een klassieke bruidstaart,', 'op maat gebakken.'],
		titleSize: 48
	}
];

for (const v of variants) {
	const titleSize = v.titleSize ?? 56;
	const lineHeight = Math.round(titleSize * 1.18);
	const baseY = H - 64;
	const titleStartY = baseY - (v.titleLines.length - 1) * lineHeight;
	const eyebrowY = titleStartY - 70;

	const align = v.align ?? 'left';
	const textX = align === 'right' ? W - 64 : 64;
	const textAnchor = align === 'right' ? 'end' : 'start';

	const titleNodes = v.titleLines
		.map(
			(line, i) => `<text
		x="${textX}" y="${titleStartY + i * lineHeight}" text-anchor="${textAnchor}"
		fill="white"
		font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
		font-size="${titleSize}" font-weight="600"
	>${escapeXml(line)}</text>`
		)
		.join('\n\t');

	// Thin separators between collage columns so the triptych reads as three photos.
	const dividers = v.collage
		? v.collage
				.slice(1)
				.map((_, i) => {
					const x = Math.round((W / v.collage!.length) * (i + 1));
					return `<rect x="${x - 1}" y="0" width="2" height="${H}" fill="rgba(255,255,255,0.55)"/>`;
				})
				.join('\n\t')
		: '';

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
	${dividers}
	<rect width="${W}" height="${H}" fill="url(#g)"/>
	<path d="${wordmarkPathData}" fill="rgba(255,255,255,0.96)" filter="url(#wmShadow)"/>
	<text
		x="${textX}" y="${eyebrowY}" text-anchor="${textAnchor}"
		fill="rgba(255,255,255,0.82)"
		font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
		font-size="20" font-weight="500" letter-spacing="5"
	>${escapeXml(v.eyebrow.toUpperCase())}</text>
	${titleNodes}
</svg>`;

	const out = path.join(ROOT, v.out);
	const layers: sharp.OverlayOptions[] = [];

	let pipeline: sharp.Sharp;
	if (v.collage) {
		const cols = v.collage.length;
		const colW = Math.round(W / cols);
		for (let i = 0; i < cols; i++) {
			// Last column absorbs any rounding remainder so the row fills the full width.
			const width = i === cols - 1 ? W - colW * (cols - 1) : colW;
			const tile = await sharp(v.collage[i])
				.resize(width, H, { fit: 'cover', position: sharp.strategy.attention })
				.toBuffer();
			layers.push({ input: tile, left: colW * i, top: 0 });
		}
		pipeline = sharp({
			create: { width: W, height: H, channels: 3, background: { r: 0, g: 0, b: 0 } }
		});
	} else {
		pipeline = sharp(v.src ?? DEFAULT_SRC).resize(W, H, {
			fit: 'cover',
			position: v.position ?? sharp.strategy.attention
		});
	}

	layers.push({ input: Buffer.from(overlay), top: 0, left: 0 });

	await pipeline
		.composite(layers)
		.jpeg({ quality: 88, progressive: true, mozjpeg: true })
		.toFile(out);

	console.log(`✓ wrote ${path.relative(ROOT, out)} (${W}×${H})`);
}

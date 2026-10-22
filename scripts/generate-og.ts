import sharp from 'sharp';
import opentype from 'opentype.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// Open Graph cards: one photo, cover-cropped to 1200x630, with only the wordmark in
// the top-left corner. No gradient, no title: the share card is the photo itself.
// The page title and description already travel along in og:title / og:description.

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

type Variant = {
	out: string;
	src?: string;
	// Crop gravity. Defaults to sharp's "attention" (salient region), but some shots
	// need a fixed bias, e.g. 'bottom' to keep a subject sitting low in the frame.
	position?: string;
	// Manual vertical crop for photos taller than 1.9:1: where to place the window,
	// 0 = flush with the top of the photo, 1 = flush with the bottom. Overrides
	// `position`. Use when neither gravity keeps the right things in frame.
	cropY?: number;
	// Diagonal split, mirroring the homepage hero (Hero.svelte, md+ layout): the left
	// photo fills a panel 58% wide, the right photo a panel 70% wide anchored right,
	// and the two meet on a seam running from 58% at the top to 30% at the bottom.
	split?: { left: Panel; right: Panel };
};

// One photo in a split panel. Focus values (0..1) are the equivalent of CSS
// object-position; `zoom` > 1 scales the photo up before cropping, to push an
// edge (e.g. a photographer watermark along the bottom) out of frame.
type Panel = { src: string; focusX?: number; focusY?: number; zoom?: number };

const img = (name: string) => path.join(ROOT, 'static/images', name);

const variants: Variant[] = [
	{
		out: 'static/og-image.jpg',
		// Same two photos and the same diagonal as the homepage hero.
		split: {
			// Charlotte sits right of centre in hero.jpeg; nudge the window right so
			// she lands around a third of the card, clear of the seam.
			left: { src: img('hero.jpeg'), focusX: 0.6 },
			// Zoom in a touch and favour the top so the couple's faces stay in and
			// the watermark along the bottom edge drops out.
			right: {
				src: img('tiramisutaart_bruiloft_aansnijden.jpeg'),
				focusX: 0.24,
				focusY: 0.35,
				zoom: 1.2
			}
		}
	},
	{
		out: 'static/og-catering-bruiloft.jpg',
		// Klassieke bruidstaart next to the hapjes concept at a wedding: the two
		// things we do for a bruiloft, in one card.
		split: {
			left: { src: img('bruidstaart_bloemen.jpeg'), focusY: 0.35 },
			right: { src: img('tiramisutaart_hapje.jpg'), focusY: 0.3 }
		}
	},
	{
		out: 'static/og-catering-bedrijfsfeest.jpg',
		// Zoet en hartig side by side, hands and trays only: the concept, not us.
		split: {
			left: { src: img('tiramisu_dienblad_handen.jpeg'), focusY: 0.4 },
			right: { src: img('burrata_closeup.jpeg'), focusX: 0.6 }
		}
	},
	{
		out: 'static/og-catering-hilversum.jpg',
		// Both of us at work at an event, trays in frame but faces still visible.
		split: {
			left: { src: img('charlotte_evenement.jpeg'), focusY: 0.5 },
			right: { src: img('gijs_evenement.jpeg'), focusX: 0.45, focusY: 0.42 }
		}
	},
	{ out: 'static/og-blog-hoeveel-hapjes-per-persoon.jpg' },
	{ out: 'static/og-blog-burrata-catering.jpg', src: img('burrata_closeup.jpeg') },
	{
		out: 'static/og-blog-tiramisu-bruiloft.jpg',
		src: img('tiramisutaart_cacao.jpg'),
		// Keep the lower part of the frame so both the live hapje (the cup) and the
		// cacao taart underneath stay visible.
		position: 'bottom'
	},
	{
		out: 'static/og-blog-italiaanse-bruidstaart.jpg',
		// 4400x2316 is already ~1.9:1, so this is a near-lossless crop.
		src: img('millefoglie_banner.jpeg')
	},
	{
		out: 'static/og-blog-bruidstaart.jpg',
		src: img('bruitstaart_120_pers.jpeg'),
		// 3:2 photo. A third of the way down keeps both faces and the cake topper in
		// frame and only loses the base of the lowest tier.
		cropY: 0.33
	}
];

// Wordmark with a soft shadow so it stays legible on light and dark photos alike,
// now that there is no gradient underneath it.
const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
	<defs>
		<filter id="wmShadow" x="-20%" y="-40%" width="140%" height="180%">
			<feDropShadow dx="0" dy="1" stdDeviation="3" flood-color="rgba(0,0,0,0.7)"/>
		</filter>
	</defs>
	<path d="${wordmarkPathData}" fill="rgba(255,255,255,0.96)" filter="url(#wmShadow)"/>
</svg>`;

// Cover-crop `src` to w x h with chosen focal points (0..1, like CSS
// object-position) instead of sharp's fixed gravities. `zoom` > 1 scales the
// photo up before cropping so edges can be pushed out of frame.
async function coverAt(
	src: string,
	w: number,
	h: number,
	opts: { focusX?: number; focusY?: number; zoom?: number } = {}
): Promise<Buffer> {
	const clamp = (v: number) => Math.min(1, Math.max(0, v));
	const zoom = Math.max(1, opts.zoom ?? 1);
	const scaled = await sharp(src)
		.rotate()
		.resize(Math.round(w * zoom), Math.round(h * zoom), { fit: 'outside' })
		.toBuffer();
	const { width = w, height = h } = await sharp(scaled).metadata();
	const left = Math.round((width - w) * clamp(opts.focusX ?? 0.5));
	const top = Math.round((height - h) * clamp(opts.focusY ?? 0.5));
	return sharp(scaled).extract({ left, top, width: w, height: h }).toBuffer();
}

// Seam geometry shared by the split layout and its seam line.
const SEAM_TOP_X = Math.round(W * 0.58);
const SEAM_BOTTOM_X = Math.round(W * 0.3);
const LEFT_PANEL_W = SEAM_TOP_X;
const RIGHT_PANEL_W = Math.round(W * 0.7);

async function splitBackground(split: NonNullable<Variant['split']>): Promise<sharp.Sharp> {
	const left = await coverAt(split.left.src, LEFT_PANEL_W, H, split.left);

	// Right panel, clipped to everything right of the seam. The polygon is in
	// panel coordinates: the panel starts at W - RIGHT_PANEL_W.
	const panelX = W - RIGHT_PANEL_W;
	const mask =
		Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${RIGHT_PANEL_W}" height="${H}">
	<polygon points="${SEAM_TOP_X - panelX},0 ${RIGHT_PANEL_W},0 ${RIGHT_PANEL_W},${H} ${SEAM_BOTTOM_X - panelX},${H}" fill="white"/>
</svg>`);
	const right = await sharp(await coverAt(split.right.src, RIGHT_PANEL_W, H, split.right))
		.ensureAlpha()
		.composite([{ input: mask, blend: 'dest-in' }])
		.png()
		.toBuffer();

	const seam = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
	<line x1="${SEAM_TOP_X}" y1="0" x2="${SEAM_BOTTOM_X}" y2="${H}" stroke="rgba(255,255,255,0.7)" stroke-width="4"/>
</svg>`);

	return sharp({
		create: { width: W, height: H, channels: 3, background: { r: 0, g: 0, b: 0 } }
	}).composite([
		{ input: left, left: 0, top: 0 },
		{ input: right, left: panelX, top: 0 },
		{ input: seam, left: 0, top: 0 }
	]);
}

for (const v of variants) {
	const out = path.join(ROOT, v.out);

	if (v.split) {
		// Flatten the split first; composite() can't be chained twice on one pipeline.
		const bg = await splitBackground(v.split).then((p) => p.png().toBuffer());
		await sharp(bg)
			.composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
			.jpeg({ quality: 88, progressive: true, mozjpeg: true })
			.toFile(out);
		console.log(`✓ wrote ${path.relative(ROOT, out)} (${W}×${H}, split)`);
		continue;
	}

	let pipeline = sharp(v.src ?? DEFAULT_SRC).rotate();

	if (v.cropY !== undefined) {
		const { width = 0, height = 0 } = await pipeline.metadata();
		const cropH = Math.min(height, Math.round(width / (W / H)));
		const top = Math.round((height - cropH) * Math.min(1, Math.max(0, v.cropY)));
		pipeline = pipeline.extract({ left: 0, top, width, height: cropH });
	}

	await pipeline
		.resize(W, H, { fit: 'cover', position: v.position ?? sharp.strategy.attention })
		.composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
		.jpeg({ quality: 88, progressive: true, mozjpeg: true })
		.toFile(out);

	console.log(`✓ wrote ${path.relative(ROOT, out)} (${W}×${H})`);
}

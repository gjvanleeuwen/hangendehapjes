import sharp from 'sharp';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dir, '..');
const SRC = path.join(ROOT, 'static/images/hero.jpeg');
const OUT = path.join(ROOT, 'static/og-image.jpg');

const W = 1200;
const H = 630;

const WORDMARK = 'HANGENDE HAPJES';
const EYEBROW = 'ENTERTAINEND ETEN';
const TITLE = 'Hapjes die jouw gasten onthouden.';

const escapeXml = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
	<defs>
		<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color="rgba(12,10,9,0.30)"/>
			<stop offset="55%" stop-color="rgba(12,10,9,0.55)"/>
			<stop offset="100%" stop-color="rgba(12,10,9,0.92)"/>
		</linearGradient>
	</defs>
	<rect width="${W}" height="${H}" fill="url(#g)"/>
	<text
		x="64" y="80"
		fill="rgba(255,255,255,0.92)"
		font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
		font-size="22" font-weight="600" letter-spacing="6"
	>${escapeXml(WORDMARK)}</text>
	<text
		x="64" y="498"
		fill="rgba(255,255,255,0.82)"
		font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
		font-size="20" font-weight="500" letter-spacing="5"
	>${escapeXml(EYEBROW.toUpperCase())}</text>
	<text
		x="64" y="568"
		fill="white"
		font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
		font-size="56" font-weight="600"
	>${escapeXml(TITLE)}</text>
</svg>`;

await sharp(SRC)
	.resize(W, H, { fit: 'cover', position: sharp.strategy.attention })
	.composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
	.jpeg({ quality: 88, progressive: true, mozjpeg: true })
	.toFile(OUT);

console.log(`✓ wrote ${path.relative(ROOT, OUT)} (${W}×${H})`);

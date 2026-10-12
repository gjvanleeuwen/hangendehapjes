/**
 * Bouwt de A5-flyer als drukklare PDF: tekst en vormen blijven vector (fonts
 * ingebed), foto's gaan er op ~300 dpi in.
 *
 *   bun flyer/build.ts
 *
 * Levert twee bestanden op:
 *   flyer/hangende-hapjes-flyer-a5-afloop.pdf  216 x 154 mm (3 mm afloop) voor de drukker
 *   flyer/hangende-hapjes-flyer-a5.pdf         210 x 148 mm, precies A5
 */
import sharp from 'sharp';
import { existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dir, '..');
const assets = resolve(import.meta.dir, 'assets');
mkdirSync(assets, { recursive: true });

// Breedte in px voor ~400 dpi op het geplaatste formaat. Let op: de foto's
// worden bijgesneden tot hun kader, dus de *weergegeven* breedte telt, niet de
// kaderbreedte. Voorkant: 3:2-foto op 154 mm hoogte = ~231 mm breed.
// withoutEnlargement houdt kleinere originelen op hun eigen maat.
const images: Record<string, [string, number, sharp.Region?]> = {
	'hero.jpg': ['hero.jpeg', 3600],
	'cake.jpg': ['tiramisutaart_bruiloft_aansnijden.jpeg', 3600],
	'burrata.jpg': ['burrata_closeup.jpeg', 1800],
	// Ingezoomd op handen, schaaltje en tray, net als de burrata-foto. Het
	// schaaltje met cacao staat in het midden.
	'tiramisu.jpg': ['tiramisu_dienblad_gijs.jpeg', 1800, { left: 80, top: 700, width: 950, height: 800 }],
	'tiramisutaart.jpg': ['tiramisutaart_cacao.jpg', 1800],
	'millefeuille.jpg': ['millefoglie_banner.jpeg', 2200],
};


for (const [out, [src, width, crop]] of Object.entries(images)) {
	const img = sharp(resolve(root, 'static/images', src)).rotate();
	if (crop) img.extract(crop);
	await img
		.resize({ width, withoutEnlargement: true })
		.jpeg({ quality: 95, chromaSubsampling: '4:4:4' })
		.toFile(resolve(assets, out));
}

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const html = `file://${resolve(import.meta.dir, 'flyer.html')}`;

const targets: [string, string][] = [
	['hangende-hapjes-flyer-a5-afloop.pdf', html],
	['hangende-hapjes-flyer-a5.pdf', `${html}?trim`]
];

// Headless Chrome blijft soms hangen nadat de PDF al geschreven is, dus we
// wachten tot het bestand niet meer groeit en ruimen het proces dan zelf op.
async function printToPdf(out: string, url: string) {
	const path = resolve(import.meta.dir, out);
	rmSync(path, { force: true });
	const proc = Bun.spawn(
		[
			chrome,
			'--headless',
			'--disable-gpu',
			'--no-pdf-header-footer',
			'--allow-file-access-from-files',
			`--user-data-dir=${resolve(import.meta.dir, '.chrome')}`,
			`--print-to-pdf=${path}`,
			url
		],
		{ stdout: 'ignore', stderr: 'ignore' }
	);
	let lastSize = -1;
	for (let i = 0; i < 120; i++) {
		await Bun.sleep(500);
		const size = existsSync(path) ? statSync(path).size : 0;
		if (size > 0 && size === lastSize) break;
		lastSize = size;
	}
	proc.kill();
	await proc.exited;
	if (!existsSync(path)) throw new Error(`Geen PDF gemaakt: ${out}`);
}

// De bruidstaart-foto is staand en het kader bijna vierkant. Om de hele taart
// te tonen zetten we hem er volledig in en vullen de zijkanten met een
// vervaagde kopie; de donkere wand en tafel lopen daardoor gewoon door.
async function fitTall(src: string, out: string, crop: sharp.Region, aspect: number) {
	const input = resolve(root, 'static/images', src);
	const w = Math.round(crop.height * aspect);
	// Zachte overgang: de linker- en rechterrand van de foto lopen uit in de
	// vervaagde achtergrond, zodat er geen harde naad te zien is.
	const fade = Math.round(crop.width * 0.12);
	const mask = Buffer.from(
		`<svg xmlns="http://www.w3.org/2000/svg" width="${crop.width}" height="${crop.height}">
			<defs><linearGradient id="g" x1="0" x2="1">
				<stop offset="0" stop-color="#fff" stop-opacity="0"/>
				<stop offset="${fade / crop.width}" stop-color="#fff" stop-opacity="1"/>
				<stop offset="${1 - fade / crop.width}" stop-color="#fff" stop-opacity="1"/>
				<stop offset="1" stop-color="#fff" stop-opacity="0"/>
			</linearGradient></defs>
			<rect width="100%" height="100%" fill="url(#g)"/>
		</svg>`
	);
	const fg = await sharp(input)
		.rotate()
		.extract(crop)
		.ensureAlpha()
		.composite([{ input: mask, blend: 'dest-in' }])
		.png()
		.toBuffer();
	const bg = await sharp(input)
		.rotate()
		.extract(crop)
		.resize(w, crop.height, { fit: 'cover' })
		.blur(60)
		.toBuffer();
	// Eerst samenvoegen, dan pas verkleinen: sharp schaalt anders de
	// achtergrond vóór het samenvoegen.
	const merged = await sharp(bg)
		.composite([{ input: fg, left: Math.round((w - crop.width) / 2), top: 0 }])
		.toBuffer();
	await sharp(merged)
		.resize({ width: 1600 })
		.jpeg({ quality: 95, chromaSubsampling: '4:4:4' })
		.toFile(resolve(assets, out));
}
await fitTall('bruidstaart_orchidee.jpeg', 'bruidstaart.jpg', { left: 0, top: 230, width: 2040, height: 2900 }, 1.05);

for (const [out, url] of targets) {
	await printToPdf(out, url);
	console.log(`✓ flyer/${out}`);
}

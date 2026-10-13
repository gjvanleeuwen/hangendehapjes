/**
 * Bouwt de carrousels voor de campagne tiramisu-nov26:
 *
 *   bun design/ads/build.ts            alle advertenties uit copy.ts
 *   bun design/ads/build.ts kasteel    één advertentie (id uit copy.ts)
 *   bun design/ads/build.ts reel       de geparkeerde reel (zie reel.ts)
 *
 * Alleen foto's, geen tekst: de woorden staan in Ads Manager (zie copy.ts).
 * Levert op in design/ads/out/<ad>/card-<n>-1080x1350.jpg (feed, 4:5). Zet
 * SIZES hieronder op [1350, 1920] voor ook de 9:16 voor stories en reels.
 *
 * Headless Chrome kan niet in de sandbox van Claude Code (socket), dus draai dit
 * script gewoon in je eigen terminal.
 */
import sharp from 'sharp';
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ads, type Card } from './copy';
import { reel } from './reel';

const SIZES = [1350];
/** Wordmark linksboven op de beelden. Uit: het profiel staat al boven de advertentie. */
const WORDMARK = false;
const here = import.meta.dir;
const root = resolve(here, '../..');
const dirs = {
	assets: resolve(here, 'assets'),
	tmp: resolve(here, '.tmp'),
	out: resolve(here, 'out'),
	chrome: resolve(here, '.chrome'),
	source: resolve(here, 'source')
};
for (const d of Object.values(dirs)) mkdirSync(d, { recursive: true });

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const what = process.argv[2] ?? 'all';

// ---------- helpers ----------

function fill(template: string, values: Record<string, string>) {
	return readFileSync(resolve(here, 'templates', template), 'utf8').replace(
		/\{\{(\w+)\}\}/g,
		(_, k) => values[k] ?? ''
	);
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** Screenshot van een lokale html op vaste maat. Chrome blijft hangen na het
 *  schrijven, dus we wachten tot het bestand stabiel is en stoppen het zelf. */
async function screenshot(html: string, out: string, width: number, height: number, transparent: boolean) {
	rmSync(out, { force: true });
	const proc = Bun.spawn(
		[
			chrome,
			'--headless',
			'--disable-gpu',
			'--hide-scrollbars',
			'--no-first-run',
			'--allow-file-access-from-files',
			`--user-data-dir=${dirs.chrome}`,
			...(transparent ? ['--default-background-color=00000000'] : []),
			`--window-size=${width},${height}`,
			`--screenshot=${out}`,
			`file://${html}`
		],
		{ stdout: 'ignore', stderr: 'ignore' }
	);
	let lastSize = -1;
	for (let i = 0; i < 120; i++) {
		await Bun.sleep(250);
		const size = existsSync(out) ? statSync(out).size : 0;
		if (size > 0 && size === lastSize) break;
		lastSize = size;
	}
	proc.kill();
	await proc.exited;
	if (!existsSync(out)) throw new Error(`Geen screenshot gemaakt: ${out}`);
}

async function run(cmd: string[]) {
	const proc = Bun.spawn(cmd, { stdout: 'inherit', stderr: 'inherit' });
	const code = await proc.exited;
	if (code !== 0) throw new Error(`${cmd[0]} faalde met code ${code}`);
}

// ---------- carrousel ----------

async function preparePhotos(cards: Card[]) {
	for (const photo of new Set(cards.flatMap((c) => [c.photo, c.bottom?.photo]).filter(Boolean) as string[])) {
		// Rotatie uit EXIF toepassen, naar max 2200 px lange zijde.
		await sharp(resolve(root, 'static/images', photo))
			.rotate()
			.resize({ width: 2200, height: 2200, fit: 'inside', withoutEnlargement: true })
			.jpeg({ quality: 92 })
			.toFile(resolve(dirs.assets, photo));
	}
}

async function renderCard(card: Card, height: number, outFile: string, tmpName: string) {
	const html = resolve(dirs.tmp, `${tmpName}.html`);
	writeFileSync(
		html,
		fill('card.html', {
			height: String(height),
			mode: card.bottom ? 'split' : 'single',
			wordmark: WORDMARK ? 'wordmark' : '',
			photo: card.photo,
			position: card.position ?? '50% 50%',
			bottomPhoto: card.bottom?.photo ?? '',
			bottomPosition: card.bottom?.position ?? '50% 50%'
		})
	);
	const png = resolve(dirs.tmp, `${tmpName}.png`);
	await screenshot(html, png, 1080, height, false);
	await sharp(png).jpeg({ quality: 92, chromaSubsampling: '4:4:4' }).toFile(outFile);
}

async function buildAds(only?: string) {
	const list = ads.filter((a) => !only || a.id === only);
	if (list.length === 0) throw new Error(`Geen advertentie met id ${only}`);
	await preparePhotos(list.flatMap((a) => a.cards));
	for (const ad of list) {
		const dir = resolve(dirs.out, ad.id);
		mkdirSync(dir, { recursive: true });
		for (const [i, card] of ad.cards.entries()) {
			for (const height of SIZES) {
				await renderCard(card, height, resolve(dir, `card-${i + 1}-1080x${height}.jpg`), `${ad.id}-${i + 1}-${height}`);
			}
			console.log(`${ad.id} kaart ${i + 1}`);
		}
	}
}

// ---------- reel ----------

function sourceClip() {
	for (const name of ['raw.mp4', 'raw.mov', 'raw.MOV', 'mux-fallback-720p.mp4']) {
		const p = resolve(dirs.source, name);
		if (existsSync(p)) return p;
	}
	throw new Error('Geen bronclip in design/ads/source/ (raw.mp4 of mux-fallback-720p.mp4)');
}

async function buildReel() {
	const src = sourceClip();
	console.log(`bron: ${src}`);

	// 1. Overlays als transparante png's.
	const overlays: string[] = [];
	for (const [i, shot] of reel.shots.entries()) {
		const s = shot as { eyebrow?: string; title?: string; brand?: boolean };
		const html = resolve(dirs.tmp, `overlay-${i + 1}.html`);
		writeFileSync(
			html,
			fill('overlay.html', {
				eyebrow: esc(s.eyebrow ?? ''),
				title: esc(s.title ?? ''),
				brand: s.brand ? '<div class="brand wordmark">HANGENDE<br />HAPJES</div>' : ''
			})
		);
		const png = resolve(dirs.tmp, `overlay-${i + 1}.png`);
		await screenshot(html, png, 1080, 1920, true);
		overlays.push(png);
		console.log(`overlay ${i + 1}`);
	}

	// 2. ffmpeg: drie stukken knippen, naar 1080x1920, aan elkaar, overlays erop
	//    met korte fade, 30 fps h264 + aac. Harde cuts, Reels-stijl.
	const fade = 0.3;
	const parts: string[] = [];
	const concatIn: string[] = [];
	let offset = 0;
	const starts: number[] = [];
	for (const [i, shot] of reel.shots.entries()) {
		const d = shot.to - shot.from;
		parts.push(
			`[0:v]trim=${shot.from}:${shot.to},setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,setsar=1,fps=30[v${i}]`,
			`[0:a]atrim=${shot.from}:${shot.to},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.05,afade=t=out:st=${(d - 0.05).toFixed(2)}:d=0.05[a${i}]`
		);
		concatIn.push(`[v${i}][a${i}]`);
		starts.push(offset);
		offset += d;
	}
	parts.push(`${concatIn.join('')}concat=n=${reel.shots.length}:v=1:a=1[vc][ac]`);
	let last = 'vc';
	for (const [i, shot] of reel.shots.entries()) {
		const d = shot.to - shot.from;
		const st = starts[i];
		parts.push(
			`[${i + 1}:v]format=rgba,fade=t=in:st=0:d=${fade}:alpha=1,fade=t=out:st=${(d - fade).toFixed(2)}:d=${fade}:alpha=1,setpts=PTS-STARTPTS+${st.toFixed(2)}/TB[o${i}]`,
			`[${last}][o${i}]overlay=0:0:eof_action=pass:enable='between(t,${st.toFixed(2)},${(st + d).toFixed(2)})'[ov${i}]`
		);
		last = `ov${i}`;
	}
	parts.push(`[ac]loudnorm=I=-16:TP=-1.5:LRA=11[aout]`);

	const out = resolve(dirs.out, 'tiramisu-nov26-reel-hapje-1080x1920.mp4');
	const cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-i', src];
	for (const [i, shot] of reel.shots.entries()) {
		cmd.push('-loop', '1', '-framerate', '30', '-t', String(shot.to - shot.from), '-i', overlays[i]);
	}
	cmd.push(
		'-filter_complex', parts.join(';'),
		'-map', `[${last}]`, '-map', '[aout]',
		'-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1',
		'-c:a', 'aac', '-b:a', '160k', '-ar', '48000',
		'-movflags', '+faststart', '-t', offset.toFixed(2),
		out
	);
	await run(cmd);
	console.log(`reel ${offset.toFixed(1)} s -> ${out}`);

	// Contactvel om de cut te controleren.
	await run(['ffmpeg', '-y', '-loglevel', 'error', '-i', out, '-vf', 'fps=2,scale=180:-1,tile=7x4', '-frames:v', '1', resolve(dirs.tmp, 'reel-check.jpg')]);
}

if (what === 'reel') await buildReel();
else await buildAds(what === 'all' ? undefined : what);
console.log('klaar');

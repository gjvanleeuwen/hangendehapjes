<script lang="ts">
	import { formatEUR } from '$lib/admin/calc';
	import {
		HOUR_TIER_POINTS,
		WEBSITE_PRICES,
		discountSketch,
		type PricingConfig,
		type SpecialVariant
	} from '$lib/admin/pricing';

	type SketchProduct = 'tiramisu' | 'burrata' | SpecialVariant;

	let {
		config,
		product,
		currentPortions,
		fruitCost,
		burrataIngredientCost
	}: {
		config: PricingConfig;
		product: SketchProduct;
		currentPortions: number;
		fruitCost: number;
		burrataIngredientCost: number;
	} = $props();

	const PRODUCT_OPTIONS: { value: SketchProduct; label: string }[] = [
		{ value: 'tiramisu', label: 'Tiramisu hapjes' },
		{ value: 'burrata', label: 'Burrata hapjes' },
		{ value: 'tiramisu-taart', label: 'Tiramisu-taart' },
		{ value: 'millefeuille-taart', label: 'Millefeuille-taart' }
	];

	// Volgt de calculator, tenzij je hier zelf een product kiest.
	let pick = $state<SketchProduct | null>(null);
	const shown = $derived(pick ?? product);

	const points = $derived(
		discountSketch({
			product: shown,
			config,
			fruitCostPerPortion: fruitCost,
			burrataIngredientCost
		})
	);

	const website = $derived(
		Object.entries(WEBSITE_PRICES[shown]).map(([n, total]) => ({
			n: Number(n),
			total,
			perPortion: total / Number(n)
		}))
	);

	// --- Geometrie --------------------------------------------------------------
	const W = 640;
	const PAD = { l: 52, r: 16, t: 12, b: 28 };
	const H1 = 220;
	const H2 = 140;

	const xMin = $derived(points[0]?.n ?? 25);
	const xMax = $derived(points.at(-1)?.n ?? 400);
	const x = (n: number) => PAD.l + ((n - xMin) / Math.max(1, xMax - xMin)) * (W - PAD.l - PAD.r);

	function niceTicks(lo: number, hi: number, count: number): number[] {
		const span = Math.max(hi - lo, 1e-6);
		const raw = span / count;
		const mag = 10 ** Math.floor(Math.log10(raw));
		const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
		const out: number[] = [];
		for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(round(v));
		return out;
	}
	const round = (v: number) => Math.round(v * 1000) / 1000;

	const priceDomain = $derived.by(() => {
		const vals = [
			...points.flatMap((p) => [p.perPortionBefore, p.perPortionAfter]),
			...website.map((w) => w.perPortion)
		];
		const lo = Math.floor(Math.min(...vals));
		const hi = Math.ceil(Math.max(...vals));
		return [lo, hi] as const;
	});
	const priceTicks = $derived(niceTicks(priceDomain[0], priceDomain[1], 4));
	const yPrice = (v: number) =>
		PAD.t +
		(1 - (v - priceDomain[0]) / Math.max(1e-6, priceDomain[1] - priceDomain[0])) *
			(H1 - PAD.t - PAD.b);

	const pctMax = $derived(Math.max(5, Math.ceil(Math.max(...points.map((p) => p.discountPct)))));
	const pctTicks = $derived(niceTicks(0, pctMax, 3));
	const yPct = (v: number) => PAD.t + (1 - v / pctMax) * (H2 - PAD.t - PAD.b);

	const xTicks = $derived(niceTicks(xMin, xMax, 6).filter((t) => t >= xMin && t <= xMax));

	const path = (vals: { n: number; v: number }[], y: (v: number) => number) =>
		vals.map((p, i) => `${i ? 'L' : 'M'}${x(p.n).toFixed(1)},${y(p.v).toFixed(1)}`).join('');

	const beforePath = $derived(
		path(
			points.map((p) => ({ n: p.n, v: p.perPortionBefore })),
			yPrice
		)
	);
	const afterPath = $derived(
		path(
			points.map((p) => ({ n: p.n, v: p.perPortionAfter })),
			yPrice
		)
	);
	const pctPath = $derived(
		path(
			points.map((p) => ({ n: p.n, v: p.discountPct })),
			yPct
		)
	);

	const anchors = $derived(HOUR_TIER_POINTS.filter((a) => a >= xMin && a <= xMax));
	const pointAt = (n: number) => points.find((p) => p.n === n);

	// --- Hover ----------------------------------------------------------------
	let hoverN = $state<number | null>(null);
	const hover = $derived(hoverN === null ? null : pointAt(hoverN));

	function onMove(e: PointerEvent) {
		const svg = e.currentTarget as SVGSVGElement;
		const rect = svg.getBoundingClientRect();
		const px = ((e.clientX - rect.left) / rect.width) * W;
		let best = points[0];
		for (const p of points) if (Math.abs(x(p.n) - px) < Math.abs(x(best.n) - px)) best = p;
		hoverN = best?.n ?? null;
	}

	const nowInRange = $derived(currentPortions >= xMin && currentPortions <= xMax);

	// Tabel: de ankers plus de websiteprijzen.
	const tableRows = $derived(
		[...new Set([...anchors, ...website.map((w) => w.n)])]
			.sort((a, b) => a - b)
			.map((n) => {
				const p =
					pointAt(n) ??
					discountSketch({
						product: shown,
						config,
						from: n,
						to: n,
						fruitCostPerPortion: fruitCost,
						burrataIngredientCost
					})[0];
				const site = website.find((w) => w.n === n)?.total;
				return { n, p, site };
			})
			.filter((r) => r.p)
	);

	const pct = (v: number) => `${v.toString().replace('.', ',')}%`;
</script>

<div class="viz-root space-y-3">
	<div class="flex flex-wrap items-center gap-3">
		<select
			aria-label="Product in de schets"
			value={shown}
			onchange={(e) => (pick = e.currentTarget.value as SketchProduct)}
			class="h-8 rounded-md border border-input bg-background px-2 text-sm"
		>
			{#each PRODUCT_OPTIONS as o (o.value)}
				<option value={o.value}>{o.label}</option>
			{/each}
		</select>
		{#if pick !== null}
			<button
				type="button"
				class="text-xs text-muted-foreground underline hover:text-foreground"
				onclick={() => (pick = null)}
			>
				volg de calculator
			</button>
		{/if}
		<div class="ml-auto flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
			<span class="flex items-center gap-1.5">
				<svg width="18" height="6" aria-hidden="true"
					><line x1="0" y1="3" x2="18" y2="3" class="stroke-before" stroke-width="2" /></svg
				>
				Zonder korting
			</span>
			<span class="flex items-center gap-1.5">
				<svg width="18" height="6" aria-hidden="true"
					><line x1="0" y1="3" x2="18" y2="3" class="stroke-after" stroke-width="2" /></svg
				>
				Met korting
			</span>
			<span class="flex items-center gap-1.5">
				<svg width="10" height="10" aria-hidden="true"
					><circle cx="5" cy="5" r="4" class="fill-site stroke-surface" stroke-width="1.5" /></svg
				>
				Website
			</span>
		</div>
	</div>

	<div class="relative">
		<div class="mb-1 text-xs text-muted-foreground">
			Prijs per portie, excl. btw, binnen de vrije straal
		</div>
		<svg
			viewBox="0 0 {W} {H1}"
			class="w-full touch-none select-none"
			role="img"
			aria-label="Prijs per portie met en zonder korting, afgezet tegen het aantal porties"
			onpointermove={onMove}
			onpointerleave={() => (hoverN = null)}
		>
			{#each priceTicks as t (t)}
				<line x1={PAD.l} x2={W - PAD.r} y1={yPrice(t)} y2={yPrice(t)} class="stroke-grid" />
				<text x={PAD.l - 6} y={yPrice(t)} dy="0.32em" text-anchor="end" class="axis-label">
					€{t}
				</text>
			{/each}
			{#each xTicks as t (t)}
				<text x={x(t)} y={H1 - 8} text-anchor="middle" class="axis-label">{t}</text>
			{/each}
			{#if nowInRange}
				<line
					x1={x(currentPortions)}
					x2={x(currentPortions)}
					y1={PAD.t}
					y2={H1 - PAD.b}
					class="stroke-now"
					stroke-dasharray="3 3"
				/>
			{/if}
			<path d={beforePath} fill="none" class="stroke-before" stroke-width="2" />
			<path d={afterPath} fill="none" class="stroke-after" stroke-width="2" />
			{#each website as w (w.n)}
				<circle
					cx={x(w.n)}
					cy={yPrice(w.perPortion)}
					r="4.5"
					class="fill-site stroke-surface"
					stroke-width="2"
				/>
			{/each}
			{#if hover}
				<line x1={x(hover.n)} x2={x(hover.n)} y1={PAD.t} y2={H1 - PAD.b} class="stroke-cross" />
				<circle
					cx={x(hover.n)}
					cy={yPrice(hover.perPortionBefore)}
					r="4"
					class="fill-before stroke-surface"
					stroke-width="2"
				/>
				<circle
					cx={x(hover.n)}
					cy={yPrice(hover.perPortionAfter)}
					r="4"
					class="fill-after stroke-surface"
					stroke-width="2"
				/>
			{/if}
		</svg>

		<div class="mt-3 mb-1 text-xs text-muted-foreground">Korting volgens de curve</div>
		<svg
			viewBox="0 0 {W} {H2}"
			class="w-full touch-none select-none"
			role="img"
			aria-label="Kortingspercentage afgezet tegen het aantal porties"
			onpointermove={onMove}
			onpointerleave={() => (hoverN = null)}
		>
			{#each pctTicks as t (t)}
				<line x1={PAD.l} x2={W - PAD.r} y1={yPct(t)} y2={yPct(t)} class="stroke-grid" />
				<text x={PAD.l - 6} y={yPct(t)} dy="0.32em" text-anchor="end" class="axis-label">
					{t}%
				</text>
			{/each}
			{#each xTicks as t (t)}
				<text x={x(t)} y={H2 - 8} text-anchor="middle" class="axis-label">{t}</text>
			{/each}
			{#if nowInRange}
				<line
					x1={x(currentPortions)}
					x2={x(currentPortions)}
					y1={PAD.t}
					y2={H2 - PAD.b}
					class="stroke-now"
					stroke-dasharray="3 3"
				/>
			{/if}
			<path d={pctPath} fill="none" class="stroke-after" stroke-width="2" />
			{#each anchors as a (a)}
				{@const p = pointAt(a)}
				{#if p}
					<circle
						cx={x(a)}
						cy={yPct(p.discountPct)}
						r="4"
						class="fill-after stroke-surface"
						stroke-width="2"
					/>
				{/if}
			{/each}
			{#if hover}
				<line x1={x(hover.n)} x2={x(hover.n)} y1={PAD.t} y2={H2 - PAD.b} class="stroke-cross" />
			{/if}
		</svg>

		{#if hover}
			<div
				class="pointer-events-none absolute top-6 z-10 w-52 rounded-md border bg-popover p-2.5 text-xs shadow-md"
				style="left: clamp(0px, calc({(x(hover.n) / W) * 100}% + 12px), calc(100% - 13rem));"
			>
				<div class="mb-1 text-muted-foreground">{hover.n} porties</div>
				<div class="flex items-center justify-between gap-2">
					<span class="flex items-center gap-1.5 text-muted-foreground">
						<svg width="12" height="4" aria-hidden="true"
							><line x1="0" y1="2" x2="12" y2="2" class="stroke-before" stroke-width="2" /></svg
						>Zonder korting
					</span>
					<strong class="tabular-nums">{formatEUR(hover.totalBefore)}</strong>
				</div>
				<div class="flex items-center justify-between gap-2">
					<span class="flex items-center gap-1.5 text-muted-foreground">
						<svg width="12" height="4" aria-hidden="true"
							><line x1="0" y1="2" x2="12" y2="2" class="stroke-after" stroke-width="2" /></svg
						>Met korting
					</span>
					<strong class="tabular-nums">{formatEUR(hover.totalAfter)}</strong>
				</div>
				<div class="mt-1 flex justify-between gap-2 border-t pt-1 text-muted-foreground">
					<span>Korting</span>
					<span class="tabular-nums">{pct(hover.discountPct)}</span>
				</div>
				<div class="flex justify-between gap-2 text-muted-foreground">
					<span>Per portie</span>
					<span class="tabular-nums">{formatEUR(hover.perPortionAfter)}</span>
				</div>
			</div>
		{/if}
	</div>

	<details class="text-sm">
		<summary class="cursor-pointer text-xs text-muted-foreground">Als tabel</summary>
		<table class="mt-2 w-full text-sm">
			<thead class="text-xs text-muted-foreground">
				<tr>
					<th class="pb-1 text-left font-normal">Porties</th>
					<th class="pb-1 text-right font-normal">Zonder korting</th>
					<th class="pb-1 text-right font-normal">Korting</th>
					<th class="pb-1 text-right font-normal">Met korting</th>
					<th class="pb-1 text-right font-normal">Website</th>
					<th class="pb-1 text-right font-normal">Verschil</th>
				</tr>
			</thead>
			<tbody>
				{#each tableRows as r (r.n)}
					<tr class="border-t">
						<td class="py-1">{r.n}</td>
						<td class="py-1 text-right tabular-nums">{formatEUR(r.p.totalBefore)}</td>
						<td class="py-1 text-right tabular-nums">{pct(r.p.discountPct)}</td>
						<td class="py-1 text-right tabular-nums">{formatEUR(r.p.totalAfter)}</td>
						<td class="py-1 text-right tabular-nums">{r.site != null ? formatEUR(r.site) : ''}</td>
						<td class="py-1 text-right tabular-nums">
							{r.site != null ? formatEUR(r.p.totalAfter - r.site) : ''}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</details>
</div>

<style>
	.viz-root {
		--series-1: #2a78d6;
		--series-2: #eb6834;
		--site: #0b0b0b;
		--surface: #fcfcfb;
	}
	:global(.dark) .viz-root {
		--series-1: #3987e5;
		--series-2: #d95926;
		--site: #f0efec;
		--surface: #1a1a19;
	}
	.stroke-after {
		stroke: var(--series-1);
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.stroke-before {
		stroke: var(--series-2);
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.fill-after {
		fill: var(--series-1);
	}
	.fill-before {
		fill: var(--series-2);
	}
	.fill-site {
		fill: var(--site);
	}
	.stroke-surface {
		stroke: var(--surface);
	}
	.stroke-grid {
		stroke: currentColor;
		opacity: 0.1;
	}
	.stroke-cross {
		stroke: currentColor;
		opacity: 0.35;
	}
	.stroke-now {
		stroke: currentColor;
		opacity: 0.4;
	}
	.axis-label {
		font-size: 11px;
		fill: currentColor;
		opacity: 0.6;
	}
</style>

# Handover: make the first Instagram ad with Gijs

> **Update 22 Oct 2026:** the first test (tiramisu-nov26) ran and is paused. Results, lessons and the decision rule for judging the next ad are in `docs/_ANALYSIS/meta-ads-tiramisu-nov26-results.md`. Read that first; its limits (€100 per booking, €20 per enquiry, max ~€0,34 per click) replace the older ones below.

You are picking up where the planning stopped. The numbers, the campaign settings and the limits are decided. What is not decided is the creative itself. Your job: read the context below, then work it out **with Gijs in conversation**, from the material that already exists in this repo. Do not write a finished ad and hand it over; ask, propose, let him choose, then write it down.

## Read first, in this order

1. `docs/instagram-ads-plan.md`: the test we are running. Objective traffic, €10 a day for four weeks, one ad set, two creatives, landing page `/blog/tiramisu-bruiloft`, campaign name `tiramisu-nov26`, the tagged links, and the decision rules.
2. `docs/meta-ads-plan.md`, sections "Creatives" and "Copy": format specs (9:16 video 6 to 15 s with burned-in captions, statics as a 9:16 master with a 4:5 safe crop), the earlier creative ideas, and the warning that organic performance of a clip says nothing about paid.
3. `CLAUDE.md`, "Voice and tone": first person plural, jij/je, no em dashes, no "aan tafel", concrete numbers, the Charlotte = zoet / Gijs = hartig contrast, "first catering concept, authenticity over polish". These rules apply to ad copy.
4. The limits the ad must beat, from the funnel report (`bun run report`, section "Ads rule"): max €0,35 per click, €40 per lead, €201 per booking. The ad's one job is cheap clicks from the right people; the page does the rest.

## What we are selling in this ad

Tiramisu op je bruiloft, in two forms: as a hangend hapje (Charlotte or Gijs walks among the guests with a tray and builds each portion fresh) or as a tiramisutaart cut together. Prices are public and are a selling point: vanaf €425 voor 50 gasten (hapje), vanaf €375 voor 30 gasten (taart), travel free within about 30 km of Hilversum. Audience: couples 25 to 40 within 50 km of Hilversum planning a wedding. Decision cycle about four months, so the ad asks for a date check, not a purchase.

## Material in the repo

Video:

- One Mux clip used on the tiramisu blog page: playback id `Q6dowlovJnKajd134vOoS60101q00RS3NYz2YgOCv4gQpE` (see `src/routes/blog/tiramisu-bruiloft/+page.svelte`). Gijs has the source files and the two organic tiramisu reels on the Instagram account; the July plan says re-cut those for paid.
- No burrata or corporate video exists. Do not plan around footage that is not there.

Photos, in `static/images/` (originals, plus `optimized/` variants):

- Tiramisu hapje: `tiramisu_dienblad_gijs.jpeg`, `tiramisu_dienblad_handen.jpeg`, `tiramisutaart_hapje.jpg`
- Tiramisutaart: `tiramisutaart_bruiloft_aansnijden.jpeg`, `tiramisutaart_bruiloft_punt.jpeg`, `tiramisutaart_cacao.jpg`, `tiramisutaart_opbouw.jpg`
- People and events: `charlotte_evenement.jpeg`, `gijs_evenement.jpeg`, `charlotte_main.jpeg`, `gijs_main.jpeg`, `owners.jpeg`, `hero.jpeg`, `GuidoDijkstraFotografie.com-DSC07206.jpg` (credit the photographer if used)
- Other products, not for this ad: burrata, millefoglie and klassieke bruidstaart photos.

Brand: `static/brand/wordmark.svg`, the A5 flyer in `flyer/` (its `assets/` folder has print-ready crops: `tiramisu.jpg`, `tiramisutaart.jpg`, `hero.jpg`) and the OG images in `static/` for a sense of the house style. Fonts and colours are in `src/app.css` (brand magenta and teal variables).

Social proof: the reviews in `src/lib/i18n/nl.ts` under `reviews.items`, 5,0 on Google. A short quote can go on a static.

## How to run the conversation

Ask before you assume. In roughly this order:

1. **Which clip.** Show him the shot list idea from the plan (tray and hands in second one, the pour, a guest reacting, the cake being cut, the price on screen) and ask which of his clips has those moments. Ask who edits: him, Charlotte, or whether you should write a frame-by-frame brief for a tool like CapCut.
2. **Which product leads.** The page preselects the tiramisutaart, the organic search demand is "tiramisu bruidstaart", but the video material is the hapje. Ask which one the reel should open on, or whether the reel is hapje and the static is taart. His call.
3. **Hook and overlay text.** Propose two or three hooks in his voice ("Tiramisu op je bruiloft, vers per gast", "Hartig of zoet?", "Check of jullie datum nog vrij is") and let him pick or rewrite. He rewrites prose himself; you own structure and pacing. Never invent process details.
4. **Static.** Agree on three photos for a carousel, or one hero photo for a single image, with the price line on it. Confirm the price lines against the blog page before writing them.
5. **Copy.** Write the primary text, headline and the CTA button choice ("Meer informatie" was suggested), NL only for this test, and ask him to rewrite in his words. Keep it under four lines.
6. **Exports.** Produce the exact file list he needs to upload: filenames, dimensions, duration, caption text per frame, and which tagged link belongs to which creative (`utm_content=reel` and `utm_content=carousel`).

Things you will not do: invent footage, promise outcomes, write English copy for this test, suggest a landing page other than the blog page, or propose a pixel or cookie banner (the consent-based server route is specified in `docs/meta-capi-task.md` and is separate work).

## Deliverable

Append to `docs/instagram-ads-plan.md` a section "Creatives, final" with, per ad: name, format, duration, shot list with on-screen text per shot, the agreed copy, the link, and the export filenames. Keep it short enough that Gijs can build both ads from it in an afternoon.

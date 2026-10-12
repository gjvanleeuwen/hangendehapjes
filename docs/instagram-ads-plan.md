# Instagram ads: first test

One campaign, one audience, two creatives, four weeks. The goal is not revenue yet. The goal is to learn two numbers the spreadsheet cannot give us: what a click costs us on Meta, and how often cold traffic turns into an aanvraag.

## Limits we test against

From the "Ads rule" section of the funnel report (`bun run report`), 8 October 2026:

| Limit                | Value | Comes from                                             |
| -------------------- | ----- | ------------------------------------------------------ |
| Max cost per click   | €0,35 | €201 left per booking × 20% win rate × 0,87% lead rate |
| Max cost per lead    | €40   | €201 × 20%                                             |
| Max cost per booking | €201  | €690 excl. BTW − €139 materials − €350 we keep         |

These are break-even against the €350 we want to keep per event. Under the limit we earn, at the limit we are paid, above it the ad eats into the €350. The report recomputes them on every run; always use the latest.

## Before the first euro

1. Deploy the current site: inline form on the blog pages, first-touch attribution, new events. Without it, leads from ads cannot be tied back to the campaign.
2. Decide the campaign name and use it everywhere: `tiramisu-nov26`. The report matches spend, visits and leads on this name.
3. Create `data/ad-spend.csv` with the header `campaign,from,to,spend,clicks`.

## Campaign setup (Ads Manager, not "boost post")

| Setting    | Choice                                    | Why                                                                                            |
| ---------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Objective  | Traffic, optimised for landing page views | No pixel yet, so Meta cannot optimise for leads; landing page views filter out accidental taps |
| Structure  | 1 campaign, 1 ad set, 2 ads               | Meta splits the budget between the two creatives by performance                                |
| Location   | Netherlands, 50 km around Hilversum       | Covers Amsterdam, Utrecht, Amersfoort, Almere: the free travel radius                          |
| Age        | 25 to 40                                  | Couples planning a wedding                                                                     |
| Interests  | Trouwen, bruiloft, bruiloftsplanning      | Nothing narrower; let Meta find the couples                                                    |
| Placements | Instagram only: feed, reels, stories      | Facebook and Audience Network are cheaper and worse                                            |
| Budget     | €10 per day, ad set level                 | About €280 over four weeks, roughly 600 to 900 clicks                                          |
| Schedule   | 4 weeks, no end date set, we stop by hand | Stopping by hand keeps the learning phase intact                                               |
| Link       | see below                                 | Both ads to the same page                                                                      |

Landing page for both ads: `https://hangendehapjes.nl/blog/tiramisu-bruiloft`. It has the video, the prices, the reviews and the form with "Tiramisu taart" preselected.

Links, one per creative:

```
https://hangendehapjes.nl/blog/tiramisu-bruiloft?utm_source=instagram&utm_medium=paid&utm_campaign=tiramisu-nov26&utm_content=reel
https://hangendehapjes.nl/blog/tiramisu-bruiloft?utm_source=instagram&utm_medium=paid&utm_campaign=tiramisu-nov26&utm_content=carousel
```

`utm_medium=paid` is what makes the report count these visits as "Instagram ads" instead of organic Instagram.

## Creatives

The ad does the pitching. The page only has to confirm. Both creatives show the act, the price and the two of you, so a click already knows what it costs and who comes.

### Ad 1: reel, 12 to 15 seconds, vertical 9:16

Cut from the existing Mux clips. Three shots:

1. Charlotte or Gijs building a tiramisu with the tray around the neck, guests around. 5 seconds. On screen: "Tiramisu op je bruiloft, vers per gast"
2. A guest getting the schaaltje, reaction. 4 seconds. On screen: "Vanaf €425 voor 50 gasten"
3. The tiramisutaart being cut, or the two of you. 4 seconds. On screen: "Check of jullie datum nog vrij is"

No music licence worries: use the sound Instagram offers in the ad composer, or no sound with captions.

### Ad 2: carousel, three photos, 4:5

1. The tiramisutaart on location.
2. A hapje in a guest's hand.
3. Charlotte and Gijs together with the trays.

Card text, in order: "Tiramisutaart vanaf €375 voor 30 gasten", "Of als hangend hapje, vers per gast", "Wij zijn Charlotte en Gijs".

### Copy (draft, in our own voice; Gijs rewrites)

Primary text, one version for both ads:

> Tiramisu op jullie bruiloft? Wij maken hem ter plekke, vers per gast, lopend tussen jullie gasten door. Of als hele taart om samen aan te snijden. Vanaf €425 voor 50 gasten, reizen in het Gooi, Amsterdam en Utrecht inbegrepen. Check of jullie datum nog vrij is.

Headline: "Tiramisu op je bruiloft, vers per gast"

Call to action button: "Meer informatie" (Meta's options are fixed; this one matches a page with prices better than "Offerte aanvragen").

Rules from CLAUDE.md apply: jij/je, no em dashes, no "aan tafel", playful close.

## Measuring, weekly

1. In Ads Manager, read per ad: spend, link clicks, landing page views, cost per landing page view.
2. Add one line per ad to `data/ad-spend.csv`, using the `utm_campaign` name. Use landing page views as the click count; that is what we pay for and what Umami sees.

```
campaign,from,to,spend,clicks
tiramisu-nov26,2026-11-03,2026-11-09,71.20,205
```

3. Export the aanvragen (Exporteer JSON in the admin) and the Umami data, run `bun run report`.
4. Read the campaign row: cost per click and cost per lead, each with ok, above or stop against the limits.
5. For every ad lead in the admin: reply the same day, set the status within a day, fill in reden afwijzing when lost. The win rate on ad leads decides whether this ever scales.

## Decision rules

| After      | If                                                        | Then                                                                                                 |
| ---------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| €50 spent  | cost per landing page view above €0,50 on one ad          | pause that ad, keep the other                                                                        |
| €50 spent  | above €0,50 on both                                       | stop, make a new reel, restart                                                                       |
| €150 spent | cost per lead above €40                                   | stop, look at the landing-page row: did they see the form, did they start?                           |
| €150 spent | cost per lead under €40                                   | raise to €20 per day                                                                                 |
| 4 weeks    | cost per lead under €40 and win rate on ad leads near 20% | plan January at €25 per day, the peak planning month after the Christmas engagements                 |
| 4 weeks    | cost per lead fine, win rate on ad leads well under 20%   | the leads are colder than our organic ones: shorter reply time, tasting offer for cakes, then retest |

## Not now

- No separate landing page, lead magnet, or video sales letter. The blog page with the form is the landing page; the ad is the pitch.
- No Facebook placements, no lookalikes, no retargeting. Retargeting needs a pixel and more traffic than we have.
- No pixel for the first two weeks. If clicks land under €0,35, add the server-side Lead event with the consent checkbox so Meta can report leads per ad (see `docs/funnel-report.md`, ads rule).

## Judge at four weeks on three numbers

1. Cost per click against €0,35.
2. Cost per lead against €40.
3. Win rate on ad leads against 20%.

All three hold: scale in January. One fails: fix that one thing, retest with the same setup. Two fail: Instagram ads are not our channel yet; put the time into the organic pages, which already deliver leads at €0.

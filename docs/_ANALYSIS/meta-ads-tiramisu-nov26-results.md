# Meta ads test 1: tiramisu-nov26 (14 to 22 October 2026)

First paid Instagram test. Paused on 22 October 2026 with €39.07 of the €50 budget spent. The remaining ~€11 sits as prepaid balance in the ad account (spending limit €50 on the account, raise it in billing before the next run).

Read this before planning or judging the next Meta ad. The decision rule at the bottom is the main thing to reuse.

## Setup

| Setting | Value |
| --- | --- |
| Account | Hangende Hapjes (Meta ad account 1284397237145748) |
| Campaign | "Nieuwe campagne voor Verkeer", objective traffic |
| Ad set | "Nieuwe advertentieset voor Verkeer" (120247368787710665), optimised for landing page views, €5 a day |
| Placements | Instagram (feed, stories, reels, explore, search) and Threads |
| Location | 40 km around Hilversum |
| Age | 24 to 40, hard limit (see "Mistake" below) |
| Landing page | /blog/tiramisu-bruiloft, tagged `utm_source=instagram&utm_medium=paid&utm_campaign=tiramisu-nov26&utm_content=<ad>` |
| Ads | One Advantage+ placement ad with static cards ("Nieuwe advertentie voor Verkeer") and two carousels (`kasteel`, `shoot`), all price-led: "Vanaf €425 voor 50 gasten" |

## Results

| Measure | Result | Limit |
| --- | --- | --- |
| Spend | €39.07 | €50 budget |
| Landing page views | 170 | |
| Cost per click | €0.22 overall, €0.16 in the first two days, €0.33 at the end | €0.34 |
| Enquiries | 1 (partial form capture, 14 Oct, `kasteel` carousel, quote sent for 50 guests in June 2027, "enthousiast") | |
| Cost per enquiry | €39 | €20 |
| Cost per booking | €39 if that quote books | €100 |

Per ad, lifetime:

| Ad | Spend | Clicks | Landing page views |
| --- | --- | --- | --- |
| Nieuwe advertentie voor Verkeer | €25.48 | 135 | 129 |
| carousel shoot | €12.11 | 35 | 35 |
| carousel kasteel | €1.48 | 5 | 6 |

The limits come from Gijs's ceiling of about €100 ad cost per booking (decided 14 Oct 2026), a 20% win rate, so €20 per enquiry, and a max cost per click of €0.17 to €0.34 depending on how well ad visitors convert.

## What we learned

1. **Advantage+ audience ignores your age range.** It was on at launch, so the 24 to 40 range was only a suggestion and 47% of visitors were 55+. Turned off on 15 Oct; after that only 24 to 40 was reached. Always switch Advantage+ audience off when age matters.
2. **Clicks are cheap, intent is low.** 9 in 10 ad visitors left without scrolling or clicking anything (Umami). Almost all spend went to Instagram Reels, where people tap out of curiosity.
3. **The small local audience wears out a static ad in about a week.** Cost per click went from €0.16 to €0.33 and click rate from ~4% to ~1.6% as the same 24 to 40 year olds saw it again. Plan a new creative every one to two weeks at €5 a day.
4. **Partial form capture saved the only lead.** The visitor stopped at the guests field, the form had already stored their details, Gijs followed up, and they came back via the Instagram bio link. Keep partial capture. Instagram leads also move slowly: count DMs and repeat visits, not only completed forms.
5. **Ad changes restart learning.** Any targeting or creative edit sends the ad set back through review and learning. With small budgets, don't edit mid-test unless something is broken.
6. **Delivery is evening-heavy.** Most clicks came between 20:00 and 01:00. Low daytime traffic is normal.

### Instagram ad visitors vs Google visitors, same landing page

Since the inline form went live on the blog (8 Oct 2026 15:09). Instagram: 180 visitors. Google: 31 visitors, so treat as direction, not exact.

| Step | Instagram ad | Google |
| --- | --- | --- |
| Did more than just land | 11% | 42% |
| Stayed 30+ seconds | 4% | 32% |
| Reached the prices | 8% | 29% |
| Saw the contact form | 8% | 32% |
| Started the form | 1.1% | 3.2% |
| Sent an enquiry | 0.6% | 3.2% |

Chart: `reports/instagram-vs-google-2026-10-22.html` (gitignored, regenerate from the Umami export if needed). Umami data from before 8 Oct 2026 has no price or form events on the blog pages, so never compare across that date.

## Decision rule for the next ads

Judge an ad after about 100 visitors on its **form reach**: the share of ad visitors that reach the contact form (Umami event `contact_view`, filtered on the campaign). Don't wait for enquiries; they need several hundred visitors to mean anything.

```
expected enquiry rate      = form reach × 10%
expected cost per enquiry  = cost per click ÷ (form reach × 10%)
ad meets the €20 limit when  form reach ≥ cost per click ÷ €2
```

| Cost per click | Form reach needed |
| --- | --- |
| €0.15 | 7.5% |
| €0.20 | 10% |
| €0.25 | 12.5% |
| €0.30 | 15% |

The 10% is the share of non-ad visitors who enquire after seeing the form: 7 of 59 all-time (12%), 2 of 24 since the form moved (8%). Instagram visitors who saw the form started it about as often as others, so the same rate applies. Recompute it as more data comes in. It only counts the online form, not WhatsApp or DMs.

Test 1 check: €0.22 per click needed 11% form reach; it got 8.3%, so expected ≈ 0.8% enquiry rate and ≈ €26 per enquiry. The real result (1 enquiry in 192 visitors) matches.

## For the next ad

- **Creative:** a 9:16 video for Reels (that's where the budget goes), showing it's a wedding cake, the two of us, and the price. Goal: fewer curious taps, more people who scroll to the form. See `docs/_TASKS/ads-creative-handover.md` for material and format specs.
- **Settings:** Advantage+ audience off, age 24 to 40, 40 km around Hilversum, tagged links with a new `utm_content` per ad.
- **Budget:** raise the account spending limit first. At €5 a day, plan a creative swap after about a week.
- **Check after 3 to 4 days:** cost per click and form reach against the table above. Below the line, swap the creative or stop.
- **Compare against other channels on cost per booking:** Google is free and enquires at ~3%; ThePerfectWedding (€500/yr, 15 to 20 requests claimed for bruidstaarten) is under consideration.

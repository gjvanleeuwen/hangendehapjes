# Meta ads test 2: awareness video + date-check retargeting

Status: concept, not started. Saved 22 October 2026 to tackle later.

Builds on test 1 (tiramisu-nov26). Read `docs/_ANALYSIS/meta-ads-tiramisu-nov26-results.md` first: it has the results, the lessons and the form-reach decision rule this plan relies on.

## Idea

Two ads that work together instead of one cold conversion ad:

1. **Awareness video** to local couples. Goal: watching, following, and later searching for "hangende hapjes".
2. **Date-check ad** shown only to people who watched at least half of that video or engaged with the Instagram account. Goal: visitors who actually reach the form.

Instagram's weakness becomes the filter: most viewers are curious scrollers, and we only pay to send the interested ones to the site.

## Why this shape

- **Optimising for enquiries is impossible at this budget.** Meta needs about 50 conversions a week to learn; we get one or two a month. So the objectives stay video views and traffic.
- **Cold Instagram traffic barely reaches the form.** Test 1: 8% of ad visitors reached the form, against 32% of Google visitors on the same page. A better creative helps but won't triple that.
- **The live concept is found by name, not by search.** "Live hapjes" and similar phrases get almost no searches. People search brand or character names after seeing them. That calls for awareness, measured by branded searches.

## Setup

| | Ad 1: awareness | Ad 2: date check |
| --- | --- | --- |
| Objective | Video views, optimised for ThruPlay | Traffic, optimised for landing page views |
| Audience | 24 to 40 within 40 km of Hilversum, **Advantage+ audience off** | Watched at least 50% of ad 1, or engaged with the Instagram account, last 60 days |
| Placements | Reels and Stories | Reels, Stories and feed |
| Budget | €4 a day | €3 a day, start once the warm audience has about 1,000 people |
| Length | 2 to 3 weeks, about €100 for both ads together | Same |
| Landing page | None | /blog/tiramisu-bruiloft, own `utm_content` per ad, `utm_campaign` new per run |

### Creative

**Ad 1:** 15 to 30 second vertical video, in the voice of the founding Instagram post. Charlotte and Gijs walk among guests with the trays and make a portion per guest; the cake being finished with cacao. Say the names (Hangende Hapjes, De Toetjes Vrouw, De Borrel Baas) so people can search for them later. Burned-in captions. Material: the Mux clip on the tiramisu page and the source files of the two organic tiramisu reels. See `docs/_TASKS/ads-creative-handover.md` for photos, formats and voice rules. Gijs writes or approves the copy.

**Ad 2:** 6 to 15 seconds or one strong image. The tiramisu cake or hapje, the existing price line "vanaf €425 voor 50 gasten", and "Check of jullie datum nog vrij is". These viewers already know us, so the ad only needs a reason to act now.

## Goal metrics

| Ad | Metric | Target | Source |
| --- | --- | --- | --- |
| Awareness | Viewers still watching after 3 seconds | 25% or more | Meta |
| Awareness | 3-second viewers who watch to the end | 15% or more | Meta |
| Awareness | Cost per completed view | €0.05 or less | Meta |
| Awareness | Search impressions for "hangende hapjes" | Clearly above baseline (35 impressions Apr to Oct 2026) | Google Search Console |
| Awareness | Instagram followers and profile visits | Clearly up during the run | Instagram |
| Date check | Cost per click | €0.30 or less | Meta |
| Date check | Visitors reaching the form | At least cost per click ÷ €2 (15% at €0.30) | Umami `contact_view`, filtered on the campaign |
| Date check | Cost per enquiry | €20 or less | Admin |

Judge the date-check ad on form reach after about 100 visitors. Judge the awareness ad on viewing and search lift only, never on enquiries.

## Timing

Couples largely plan over winter, and bookings arrive about 4.5 months before the event. A date-check run in January will probably beat the same run in November. If running something sooner, make it the awareness ad so January's date-check ad has a warm audience ready.

## Before launch

- [ ] Raise the Meta account spending limit (still €50, €39 used by test 1).
- [ ] Confirm `META_DATASET_ID` and `META_CAPI_TOKEN` are set on Dokploy so consented ad leads and bookings report back to Meta.
- [ ] Cut ad 1 video and write ad 2 creative with Gijs.
- [ ] New `utm_campaign` for the run and a separate `utm_content` per ad.

## Fallback: single ad

If two ads is too much, run only the date-check ad with a video creative and the same targeting as test 1, and judge it on form reach after about 100 visitors. Same cost, but expect fewer interested visitors.

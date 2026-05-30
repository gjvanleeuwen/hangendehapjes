# SEO content plan

Reference doc for the blog posts and `/catering/[city]` pages we want to ship. Generated from a keyword-research pass on 2026-04-28 (`/toprank:keyword-research`) and a follow-up SERP probe on "tiramisu bruiloft".

This file is a **plan**, not a task list. Active work lives in [todo.md](../todo.md). Re-evaluate quarterly.

## Methodology and caveats

- Volumes / difficulty are **qualitative buckets** (Low / Med / High), not numeric. We don't have Google Keyword Planner / Ahrefs / Semrush wired up. Re-rank if/when we do.
- Difficulty buckets are based on observed competitor depth in the SERP (who ranks, how thick their content is, what content type wins).
- WebSearch is US-located, so NL SERPs from a real Dutch IP may surface slightly different competitors and featured snippets. The big NL incumbents (ThePerfectWedding, Trouwen.nl, Hapjes aan Huis, Bruiloft.nl) are stable.
- Refresh annually — keyword dynamics shift.

## Strategic summary

The NL catering SERP splits into three tiers we can act on:

1. **Head terms** ("hapjes catering bruiloft", "walking dinner bruiloft") are owned by aggregators (ThePerfectWedding, Trouwen.nl, Hapjes aan Huis, Bruiloft.nl). Don't compete head-on.
2. **Mid-tail process / cost / quantity questions** have thin formulaic incumbents. Real first-party numbers (50 porties/uur, €8,50 per portie at 50 tier, €0,45/km, ~2–3 standaard hapjes per portie) genuinely differentiate.
3. **Long-tail concept terms** specific to our offering ("burrata bar bruiloft", "tiramisu bruiloft", "live tiramisu serveren") have **near-zero NL caterer competition**. We can own these terms.

Anchor: own the long-tail (Tier S concept terms), build authority via the mid-tail (Tier A planning content), and skip the head terms entirely.

## Priority tiers

### Tier S — write first

| #   | Target query                                                         | Secondary queries                                                            | Intent                                    | Vol               | Diff                                                                             | Why                                                                                                                                                                                                                                                                                                                                                                                                        |
| --- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------- | ----------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | **hoeveel hapjes per persoon receptie / bruiloft**                   | "hoeveel borrelhapjes per persoon", "aantal hapjes per gast"                 | Informational, GEO-prime                  | Med-High          | Low-Med                                                                          | Existing answers are thin & generic ("5–7 hapjes p.p."). We have real serving data. LLMs pull short factual answers from this exact query family.                                                                                                                                                                                                                                                          |
| S2  | **tiramisu bruiloft**                                                | "tiramisu trouwfeest", "tiramisu live bruiloft", "tiramisu dessert bruiloft" | Informational + commercial                | Med               | **Low** (vs caterers — SERP owned by recipe sites and Tiktok, not service sites) | User-priority target. Zero NL caterers positioned here. Recipes own the SERP — Google will surface a service page for booking-intent queries.                                                                                                                                                                                                                                                              |
| S3  | **burrata bruiloft / burrata bar bruiloft / wat is een burrata bar** | "burrata catering", "burrata station bruiloft"                               | Informational + commercial, **GEO-prime** | Low-Med (growing) | Very low                                                                         | **Confirmed AI Overview win**: searching "burrata bruiloft" already triggers a Google AI Overview describing the burrata-bar concept and citing [OhMyFoodness](https://ohmyfoodness.nl/) + 3 others — _all recipe sites_, **no caterer cited**. The AI is already willing to give this answer in NL; we just need to be the service-side page it cites. White space. Ship in tandem with S2 tiramisu post. |
| S4  | **live cooking op een bruiloft — hoe werkt het**                     | "live cooking catering", "vers koken bruiloft"                               | Informational                             | Med               | Med                                                                              | "Live cooking" SERP is dominated by BBQ/foodtruck framing. Walking + per-guest preparation is differentiated.                                                                                                                                                                                                                                                                                              |
| S5  | **wat kost catering 50 / 100 / 200 personen bruiloft**               | "catering prijs per persoon", "prijs walking dinner"                         | Informational, price-curiosity            | High              | Med                                                                              | Top SERP claims walking dinner = €50–100/persoon. Our component price (€8,50/portie at 50) is a strong contrast that earns the click and the AI citation.                                                                                                                                                                                                                                                  |
| S6  | **/catering/hilversum** (location page)                              | "catering hilversum bruiloft", "bruiloft catering het gooi"                  | Local commercial                          | Med               | Med                                                                              | Real local-pack competitors (FAJE, Delight, Smorre, STOOP, La Casina). None with a "live walking" angle. GBP + this page = local-pack win.                                                                                                                                                                                                                                                                 |

### Tier A — write next

| #   | Target query                                                      | Secondary queries                                          | Intent                  | Vol           | Diff     | Why                                                                                                                                                           |
| --- | ----------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------- | ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | **alternatief voor walking dinner / walking dinner vs buffet**    | "walking dinner of buffet", "originele bruiloft eten"      | Comparison, GEO-prime   | Med           | Low      | Pure question intent, no dominant page. Position us as a _complement_ to walking dinner — the ~1-uur live-component during borrel/dessert, not the full meal. |
| A2  | **tiramisu live serveren / live tiramisu bruiloft**               | "tiramisu live opmaken", "tiramisu show bruiloft"          | Informational, niche    | Low (growing) | Very low | Same own-the-term play as S3. Pair with S2 (one master post + sub-page, or single combined post).                                                             |
| A3  | **wat is een walking dinner / verschil walking dinner en buffet** | "walking dinner uitleg", "walking dinner vs lopend buffet" | Definitional, GEO-prime | High          | Med-High | Existing answers are good but writeable better with concrete pace numbers, pricing math, and a clean diagram. Worth the climb.                                |
| A4  | **/catering/het-gooi** (location umbrella)                        | "catering bussum / laren / blaricum / naarden / huizen"    | Local commercial        | Med           | Med      | Covers sub-Het-Gooi venues with real venue mentions. Competing with Alvida, La Casina.                                                                        |
| A5  | **/catering/amsterdam**                                           | "bruiloft catering amsterdam"                              | Local commercial        | High          | High     | High volume, high difficulty (every Amsterdam caterer competes). Worth it for inbound but don't expect quick top-5.                                           |

### Tier B — later

| #   | Target query                                       | Intent                       | Vol     | Diff     | Why                                                                                                                   |
| --- | -------------------------------------------------- | ---------------------------- | ------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| B1  | **bruiloft catering trends 2026 / 2027**           | Informational, trend         | Med     | Med      | Dated content earns Perplexity citations. Refresh annually. Frame "live walking concepts" as the trend we're part of. |
| B2  | **dessertkar / dessert bar bruiloft**              | Informational, niche         | Low-Med | Low      | Sister concept to tiramisu offer. Reframe as "dessertkar vs live tiramisu".                                           |
| B3  | **interactieve catering / eten als entertainment** | Informational, brand-aligned | Low     | Very low | Almost no NL content. Pure category-creation play; ties to the existing "Eten als Entertainment" hero copy.           |
| B4  | **/catering/utrecht**                              | Local commercial             | High    | High     | Same logic as Amsterdam — high volume, high difficulty, do it for the inbound.                                        |

### Tier C — skip

| Query                                            | Why skip                                                                                                                                                    |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "originele hapjes bruiloft"                      | Listicle SERP owned by ThePerfectWedding's "16x originele hapjes". Hard climb, low payoff (we don't sell 16 different hapjes).                              |
| "borrelhapjes" / generic recipe terms            | Wrong audience (people cooking at home, not booking catering).                                                                                              |
| "hapjes catering bruiloft Nederland" (head term) | Owned by aggregators (Hapjescateraar, Hapjes aan Huis, Bruiloft.nl). Compete via long-tail.                                                                 |
| "Italiaanse catering bruiloft"                   | Lazzarella, La Casina, By Nathalie own this — and we're not really an Italian-catering brand, we're a "live walking" brand using Italian-ingredient dishes. |

## Topic clusters

Two pillar pages, everything hangs off them.

### Cluster 1 — "Live walking catering"

**Pillar:** homepage hero / About copy.
**Spokes:** S3 burrata bar, S4 live cooking, A1 alternatief walking dinner, A2 live tiramisu, B1 trends, B3 interactieve catering. Internal-link these all back to the homepage and to each other.

### Cluster 2 — "Catering planning facts"

**Pillar:** S1 hoeveel hapjes (becomes the long-tail anchor for facts/numbers content).
**Spokes:** S5 wat kost catering, A3 wat is walking dinner, B2 dessertkar.
This cluster is built to be **cited by AI** — short concrete answers to question-intent queries.

### Cluster 3 — "Local catering"

**Pillar:** S6 /catering/hilversum.
**Spokes:** A4 /catering/het-gooi, A5 /catering/amsterdam, B4 /catering/utrecht.
Each MUST have substantive different copy (real venue mentions, real travel-fee math, local references). Google penalises city-swap doorway pages.

## 6-month content calendar

| Month              | Ship                                                     | Reasoning                                                                                                                                                 |
| ------------------ | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **May 2026**       | S1 hoeveel hapjes + S6 /catering/hilversum               | Highest-leverage post (already in todo as portion-sizing post) + home-turf location page. Both anchor their clusters.                                     |
| **June 2026**      | S2 tiramisu bruiloft + S3 burrata bar                    | Land-grab both long-tail concept terms while no NL caterer competes. The Charlotte-Gijs symmetry plays well in tandem.                                    |
| **July 2026**      | S5 wat kost catering 50/100/200 + S4 live cooking        | Cost post = peak summer planning intent. Live cooking pillar feeds Cluster 1.                                                                             |
| **August 2026**    | A4 /catering/het-gooi + A2 live tiramisu serveren        | Complete the Het Gooi local trio. Tiramisu live post mirrors burrata for Cluster 1 symmetry. (Or merge A2 into S2 as one master tiramisu post — simpler.) |
| **September 2026** | A1 alternatief walking dinner + A3 wat is walking dinner | Comparison-intent pair — high GEO value for the autumn wedding-planning surge (people booking for spring/summer 2027).                                    |
| **October 2026**   | A5 /catering/amsterdam + B1 trends 2027                  | Amsterdam page (don't expect quick wins, but inbound starts). Dated trend post drives Perplexity recency citations into 2027.                             |

Months 7–12: refresh S1/S5 with new numbers, ship Tier B (B2 dessertkar, B3 interactieve catering), add B4 /catering/utrecht.

## Per-post briefs (Tier S)

### S1 — "Hoeveel hapjes per persoon op een receptie of bruiloft?"

- **Slug:** `/blog/hoeveel-hapjes-per-persoon` + `/en/blog/how-many-bites-per-guest`
- **Length:** 600–900 words
- **Intent:** Pure question-intent, factual answer
- **Schema:** `Article` with author=[Charlotte, Gijs], `dateModified`. Optionally `HowTo` if we structure as steps.
- **Must include:** real numbers from our bookings — 50 porties/uur per persoon, ~2–3 standaard hapjes per portie, breakdown by event type (receptie, borrel, walking dinner-aanvulling), guidance for 50 / 100 / 200 gasten with travel-fee math
- **Differentiator:** existing SERP says generic "5–7 per persoon, 4 hours". Our angle: it depends on whether we're the _full_ food or a _complement_ — real-world numbers from our events
- **CTA:** soft — "Plan je feest? Vertel ons hoeveel gasten je verwacht"

### S2 — "Tiramisu op je bruiloft — live geserveerd of als taart?" (or split)

- **Slug:** `/blog/tiramisu-bruiloft` + `/en/blog/tiramisu-wedding`
- **Length:** 700–1000 words
- **Intent:** Mixed — recipes vs service. We position firmly on the service side
- **Schema:** `Article` + nested `Service` reference to De Toetjes Vrouw
- **Must include:** Charlotte's perspective as a baker, why live-built tiramisu beats pre-made portions for events, Italian sourcing (mascarpone, mokapot espresso, savoiardi), pacing math (~50 porties/uur), actual photos from events
- **Optionally:** mention wedding-cake alternative once we add cakes (see todo.md)
- **Differentiator:** SERP is recipes. We're the only caterer-positioned page
- **Possibly merge with A2** (live tiramisu serveren) into one master post — simpler than splitting

### S3 — "Burrata op je bruiloft — burrata bar of live burrata bowl?"

- **Slug:** `/blog/burrata-bruiloft` + `/en/blog/burrata-wedding` (note: broader slug than originally planned to capture both "burrata bruiloft" and "burrata bar bruiloft" intent)
- **Length:** 700–1000 words
- **Intent:** Definitional + commercial bridge, **GEO-prime** (AI Overview already triggers on this query)
- **Schema:** `Article` + nested `Service` reference to De Borrel Baas
- **Must include:** Gijs's perspective, what stracciatella vs burrata actually means (the AI Overview gets this slightly fuzzy — we can be the precise source), the difference between "burrata bar" (station — guests style their own) and "live burrata bowl" (walking, per-guest, our format), Scrocchi-toast pairing logic, pacing math (50/uur), real toppings list using the exact vocabulary the AI Overview already uses: _geroosterde tomaatjes, pestos, gegrilde nectarines, noten, vers brood, basilicumolie, pijnboompitten, gedroogde ham_
- **Differentiator:** AI Overview is already willing to give a "burrata bar" answer in NL but is citing recipe blogs. We become the caterer-side citation. **Link out to [OhMyFoodness's burrata recipes](https://ohmyfoodness.nl/10x-recepten-met-burrata/)** as the at-home version — they're a citation complement, not a competitor (recipes vs service intent). That outbound link is also a positive signal: we're not trying to displace them, we're occupying an adjacent service-side niche
- **AI Overview note:** The AI Overview cites _OhMyFoodness + 3 others_. Once our page exists, we should be in that citation set within weeks for service-intent queries. Track this in the monthly AI baseline check (todo.md Recurring section).

### S4 — "Live cooking op een bruiloft — hoe werkt het?"

- **Slug:** `/blog/live-cooking-bruiloft` + `/en/blog/live-cooking-wedding`
- **Length:** 700–1000 words
- **Intent:** Process / how-it-works
- **Schema:** `Article` + `HowTo` if step-structured
- **Must include:** the spectrum — BBQ on locatie / foodtruck / walking live-built (us); when each makes sense; the logistics (power, water, tafel needs — we need almost none); pace math
- **Differentiator:** position walking-live as a distinct sub-category vs the dominant BBQ/foodtruck framing

### S5 — "Wat kost catering voor 50, 100 of 200 personen?"

- **Slug:** `/blog/wat-kost-catering-bruiloft` + `/en/blog/cost-of-wedding-catering`
- **Length:** 800–1200 words
- **Intent:** Price-curiosity, high commercial-adjacent
- **Schema:** `Article` + `FAQPage` for sub-questions
- **Must include:** market context (€50–100/persoon for walking dinner per Trouwen.nl), our actual prices per tier (€425 / €650 / €1.125 for tiramisu, €450 / €700 / €1.225 for burrata), travel-fee math, _what's included_ vs _not included_ (drinks, full meal, staff)
- **Differentiator:** real numbers, transparent breakdown vs the vague "€35–50/persoon" most pages give

### S6 — `/catering/hilversum` (location page)

- **Slug:** `/catering/hilversum` + `/en/catering/hilversum`
- **Length:** 400–700 words
- **Intent:** Local commercial
- **Schema:** `LocalBusiness` with `addressLocality: Hilversum` + `Service` nested
- **Must include:** real Hilversum venue mentions (Dudok, Beeld en Geluid, Hilvertshof, Stadhuis, parks), travel-fee = €0 (we're based there), couple-of-Hilversum origin story
- **Differentiator:** every other Hilversum cateraar is generic. We're literally local
- **Note:** keep different from `/catering/het-gooi` — Hilversum-specific content, not "Het Gooi minus other cities"

## Sources (probed 2026-04-28)

### Head term — "hapjes catering bruiloft Nederland"

- [ThePerfectWedding catering hub](https://www.theperfectwedding.nl/catering)
- [Hapjescateraar bruiloft](https://hapjescateraar.nl/gelegenheden/bruiloft/)
- [Hapjes aan Huis bruiloft](https://hapjesaanhuis.nl/nl/gelegenheden/bruiloft-catering-1/)
- [Dutch Horeca Group](https://dutchhorecagroup.nl/catering-bruiloft/)
- [Bruiloft.nl catering](https://bruiloft.nl/catering)

### Walking dinner

- [Grand Reves walking dinner](https://www.grandsrevescatering.nl/post/walking-dinner-voor-bruiloften-stijlvol-smaakvol-en-onvergetelijk)
- [Thuiskok Klaas — wat is een walking dinner](https://thuiskokklaasculinair.nl/wat-is-een-walking-dinner)
- [KOM Catering walking dinner](https://kenjekom.nl/walking-dinner-organiseren/)
- [Trouwen.nl trouwlocaties walking dinner](https://trouwen.nl/inspiratie/de-mooiste-trouwlocaties-walking-dinner-bruiloft-voor-foodies)

### Live cooking

- [ByFrankies live cooking bruiloft](https://www.byfrankies.nl/bruiloft-catering-vers-koken-op-locatie-elk-gerecht/)
- [Buiten.studio BBQ + live cooking](https://buiten.studio/bbq-catering/bruiloft-bbq-catering/)
- [Firma Kok FoodBikes](https://firmakokcatering.nl/)

### Hoeveel hapjes

- [Van Reusel Verhuur](https://vanreuselverhuur.nl/hoeveel-hapjes-per-persoon/)
- [Bleu Blanc (BE)](https://bleu-blanc.be/blog/post/15149/hoeveel-hapjes-per-persoon-voorzien-bij-een-receptie-of-evenement/)
- [Food and Wood borrelbox](https://www.foodandwood.nl/artikel/hoeveel-hapjes-per-persoon-borrelbox/)

### Tiramisu bruiloft (the user-priority target)

- SERP dominated by recipes (wijnspijs, baktotaal, leukerecepten, keukenliefde) and Tiktok. **No NL caterer ranks for the exact phrase.**
- Closest commercial result: [Patisserie Aurelie tiramisu taart](https://patisserie-aurelie.nl/product/tiramisu-taart/) — a product, not a wedding-service page
- [Hartichoc dessert trouwfeest (BE)](https://www.hartichoc.be/nl/dessert-trouwfeest) — Belgian, mentions tiramisu but not positioned at "tiramisu bruiloft"
- [ThePerfectWedding bruiloft dessert](https://www.theperfectwedding.nl/blog/1426/uniek-bruiloft-dessert) — broad dessert page, not tiramisu-specific

### Wat kost catering

- [Trouwen.nl kosten catering](https://trouwen.nl/inspiratie/hoeveel-kosten-catering-per-persoon-op-de-trouwlocatie)
- [FoodtruckBooking 100 personen](https://www.foodtruckbooking.nl/nieuws/762/wat-kost-de-catering-van-een-bruiloft-met-100-personen)

### Local — Hilversum / Het Gooi

- [FAJE Catering](https://fajecatering.nl/)
- [Delight Catering Hilversum](https://delight-catering.nl/catering/hilversum/)
- [Smorre Catering Het Gooi](https://www.catering-verhuur-hetgooi.nl/catering-en-partyverhuur-hilversum/)
- [STOOP Catering Hilversum](https://www.stoopcateringevents.nl/catering-hilversum/)
- [La Casina Italiaanse catering Het Gooi](https://lacasina.nl/italiaanse-catering-in-het-gooi-la-casina-brengt-italiaanse-smaken-naar-uw-evenement/)
- [Alvida Catering Het Gooi](https://www.alvida-catering.nl/en/woonplaats/catering-in-gooi)

### Italian / dessert competitors

- [Lazzarella Italiaanse catering](https://lazzarella.nl/italiaanse-pizza-catering-bruiloft/)
- [La Casina Italiaanse bruiloft](https://lacasina.nl/italiaanse-bruiloft-catering-maak-uw-grote-dag-onvergetelijk-met-la-casina/)
- [By Nathalie Italiaans](https://www.bynathalie.eu/luxe-catering/bruiloft/italiaans)

### Burrata bruiloft (added 2026-04-28 after AI Overview observation)

- [OhMyFoodness — 10 burrata recipes](https://ohmyfoodness.nl/10x-recepten-met-burrata/) — primary AI Overview citation for NL burrata queries; recipe-intent, not service-intent (complement, not competitor)
- [OhMyFoodness — Italian cheeses guide](https://ohmyfoodness.nl/over-italiaanse-kazen-parmezaan-mozzarella-pecorino-en-meer/)
- [TheKitchn — Burrata Bar (US)](https://www.thekitchn.com/burrata-bar-23157739) — US trend article AI Overviews translate from
- [Burrata House Catering (US/LA)](https://burratahouse.com/catering-selections/) — US precedent for the "burrata catering" category
- [Kiss the Cook Catering — DIY Burrata station](https://www.kissthecookcatering.com/burrata) — US service-side reference
- **No NL caterer is positioned on "burrata bruiloft" or "burrata bar bruiloft"** as of 2026-04-28. Confirmed via SERP probe + observed AI Overview citing only recipe blogs.

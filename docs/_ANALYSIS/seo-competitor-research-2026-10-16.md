# SEO competitor and keyword research: 16 October 2026

_DataForSEO (google.nl, Dutch) joined with Search Console 1 April to 13 October 2026. Pipeline: `scripts/seo-research/`. Interactive report: `reports/seo-research-2026-10-16.html` (gitignored, rebuild with `uv run scripts/seo-research/research.py report --run 2026-10-16`). Spend: $3.72 including the $0.25 sample run._

This complements the [23 September SEO review](seo-analysis-2026-09-23.md) and the [enquiry analysis](enquiry-analysis-2026-09-23.md). Those settle what converts (tiramisu) and what GSC shows. This adds what GSC cannot: real search volumes, who holds the top 10, how strong they are, and where links come from.

Owner steer for this run (Gijs, 16 October): tiramisu and millefoglie are already #1 and need protecting, not pushing. Growth focus is the **hapjes / live concept** and the **klassieke bruidstaart**. There is no single clear competitor, so competitors are a means, not the goal.

---

## Summary for Gijs

1. **De klassieke bruidstaart is de makkelijkste groei.** The cake SERPs are held by small bakery sites with weak authority. `bruidstaart bestellen` (480 searches a month) has a top 10 with median domain rank 91, and `klassieke bruidstaart` 121. Our page already has more text and more prices than the pages that rank. What it lacks is the words people search in its title and H1, real photos, and a guest-count sizing answer. Searches peak January to May, so ship before January.
2. **The live concept wins on occasions, not on its own name.** Nobody searches for "walking act" or "live catering" (10 a month each). `walking dinner` (2,400) and `live cooking` (1,300) look big but their SERPs are restaurant walking tours and Van der Valk buffets. People with an event search `catering bruiloft` (480 to 880), `catering feest` (260), `event catering` (140 to 390), `catering bedrijfsfeest` (170, and the highest CPC we saw at €13.12) and `hapjes bruiloft` (70 to 90). We have no page for any of these occasions. Every caterer that ranks does.
3. **Authority is the ceiling, not content.** DataForSEO finds **zero referring domains** for hangendehapjes.nl. Peers sit between 27 and 975. Every "reachable" position below assumes first links. The quickest real links are wedding directories that already rank on our target SERPs (ThePerfectWedding, Trouwen.nl, Eventplanner, TopTrouwbedrijven, Huwelijk.nl) and Hilversum venues.
4. **Local is a reviews game.** We show up in Google Maps for Hilversum queries, and we're #3 in the map pack for `hapjes catering hilversum`. We have 3 reviews. The two leaders have 47 and 69. A steady review request after every event is the single cheapest local lever.
5. **Stop chasing generic "hapjes".** Around 15,000 monthly searches for hapjes, hartige hapjes, italiaanse hapjes and hapjes receptie are recipe searches; recipe blogs hold the top 10. The same goes for `hapjes catering`, which turns out to be delivered trays. Keep the intent filter and don't write for these.

---

## Method and caveats

| Input                                                                      | Size |
| -------------------------------------------------------------------------- | ---: |
| Relevant keywords collected (Labs suggestions + related, GSC seeds)        |  659 |
| Of which DIY / supermarket / delivery (kept for reference, never targeted) |  120 |
| Keyword groups after merging close variants, with a SERP                   |  104 |
| Dropped as recipe-dominated SERP                                           |   42 |
| Organic SERPs (desktop, NL-wide, top 20)                                   |  250 |
| Google Maps SERPs from Hilversum                                           |    8 |
| Organic SERPs searched from Hilversum                                      |    6 |
| Competitor pages parsed for content gaps                                   |  101 |
| Peer domains analysed for ranked keywords and backlinks                    |   10 |

- **Volumes are Google Ads buckets** (10, 20, 30, 40, 50, 70, 90, 110, 140, 170, 210, 260, 320, 390, 480, 590, 720, 880, 1,000, 1,300, 1,600, 1,900, 2,400 …). Where Labs and Keyword Planner disagree, the higher is shown and the source noted. Labs reported **0** for `catering hilversum` while GSC shows 1,110 impressions in six months, so Keyword Planner was queried for ~80 core terms. Low terms like `tiramisu bruiloft` (Ads 30) get more GSC impressions than their bucket suggests; treat everything under 50 as "small, order of magnitude".
- **One SERP snapshot**, desktop, national, 16 October. GSC positions are averages over six months and mostly mobile. They disagree for some queries: the snapshot did not show us in the top 20 for `tiramisu bruiloft` (GSC 2.2). Trust GSC for where we rank; trust the snapshot for who else ranks.
- **"Reachable now / later"** counts how many top-10 results are stronger than a threshold (DataForSEO domain rank 120 "now", 220 "later"; social, marketplace and recipe results count as weak). "Now" means strong content plus a first handful of relevant links. We have zero links today, so "now" is not "this week".
- **Correlation, not causation.** Peers with more links rank better; links are not proven to be why.
- Competitor pages were fetched politely (robots.txt, 1 request/second/host, cached) for gap analysis only. No competitor text is reused anywhere.

---

## 1. Authority: where we stand

| Domain                    | DataForSEO rank | Referring main domains | Notes                                                              |
| ------------------------- | --------------: | ---------------------: | ------------------------------------------------------------------ |
| **hangendehapjes.nl**     |           **0** |                  **0** | Not in the link index at all                                       |
| eatertainment.nl          |             289 |                    975 | Food entertainment concept; #1 for `italiaanse hapjes` via recipes |
| hapjesaanhuis.nl          |             257 |                    898 | Delivery catering; on every hapjes/local SERP                      |
| debuffettenboer.nl        |             373 |                    475 | Catering aan huis; #2 `catering hilversum`                         |
| cateringfabriek.nl        |             246 |                    244 | Naarden; #1 `catering het gooi`                                    |
| tiramisuhilversum.nl      |             150 |                    147 | Italian caterer in Hilversum; #1 `cateraar hilversum`              |
| droomtaart.nl             |             125 |                    119 | #1 `bruidstaart`                                                   |
| fajecatering.nl           |              95 |                    111 | Hilversum; map-pack leader (47 reviews)                            |
| sillybakery.nl            |             170 |                     73 | #1 `wat kost een bruidstaart`                                      |
| lacasina.nl               |             122 |                     42 | Italian catering Het Gooi                                          |
| dutchfoodentertainment.nl |               0 |                     27 | Closest concept peer, also barely linked                           |

DataForSEO's Labs database knows us for only six keywords (millefoglie, italiaanse bruidstaart, tiramisu bar, cateraar(s) hilversum, borreltied). GSC shows far more. That gap is normal for a young site with no links: third-party indexes under-sample it.

Practical read: the bakery and Italian-catering sites that hold our target SERPs mostly have 40 to 150 referring domains. Ten to twenty genuine, relevant links would move us into their range.

## 2. Where we rank well (protect)

GSC, 1 April to 13 October:

| Query                     | Clicks / impressions | GSC position | Ads volume | Snapshot top 3                            |
| ------------------------- | -------------------: | -----------: | ---------: | ----------------------------------------- |
| `tiramisu bruidstaart`    |             31 / 133 |          2.3 |         20 | **us**, welovecakes.nl, instagram         |
| `tiramisu bruiloft`       |              22 / 97 |          2.2 |         30 | facebook, lacuisineus.com, trouwen.nl     |
| `tiramisu toren bruiloft` |              11 / 81 |          3.8 |         10 |                                           |
| `tiramisu taart bruiloft` |               7 / 34 |          1.6 |        <10 |                                           |
| `millefoglie bruidstaart` |              6 / 147 |          3.9 |   30 to 40 | deliscu.nl, instagram, **us**             |
| `italiaanse bruidstaart`  |              2 / 198 |          4.3 |         70 | pinterest, deliscu.nl, instagram          |
| `millefoglie taart`       |              9 / 147 |          5.2 |         50 |                                           |
| `millefoglie`             |            4 / 1,073 |          9.2 |        880 | tastykoken.nl (recipe), deliscu.nl, ah.nl |

These are small markets that we already own. Their top 10s are soft (median rank 73 to 150): nobody with authority is coming for them. Protect means: keep the pages fresh, keep internal links, don't rewrite titles that work.

## 3. Hapjes and the live concept

### Demand by how people actually search

| Search                                                                 |         Volume / month | Source | What the SERP is                                       |
| ---------------------------------------------------------------------- | ---------------------: | ------ | ------------------------------------------------------ |
| `hapjes`                                                               |                  6,600 | Labs   | Recipes (recipe-dominated)                             |
| `italiaanse hapjes`                                                    |                  1,900 | Labs   | Recipes; eatertainment.nl #1 with recipes              |
| `hartige hapjes` (+ koud, bladerdeeg, high tea variants)               |      720 to 1,600 each | Labs   | Recipes                                                |
| `walking dinner`                                                       |                  2,400 | Ads    | Culinary walking tours past restaurants                |
| `live cooking`                                                         |                  1,300 | Ads    | Van der Valk live-cooking buffets                      |
| `catering aan huis`                                                    |                  1,600 | Labs   | Delivery caterers (debuffettenboer, hapjesaanhuis)     |
| `catering bruiloft`                                                    | 480 (Ads) / 880 (Labs) | both   | Eventplanner, stoopcateringevents, Trouwen.nl          |
| `catering op locatie`                                                  |             720 to 880 | both   | Foodtruck club, caterers                               |
| `foodtruck aan huis`                                                   |                    880 | Labs   | Foodtruck companies, weak (median rank 107)            |
| `luxe hapjes`                                                          |             480 to 590 | both   | Half order pages, half recipes                         |
| `event catering` / `catering event`                                    |             140 to 390 | both   | cateringevents.nl, eventplanner                        |
| `catering feest`                                                       |                    260 | Ads    | Regional caterers, eventplanner "Partycatering top 10" |
| `hapjes catering`                                                      |                    210 | both   | Delivered hapjes trays (hapjesaanhuis, dsrfood)        |
| `foodtruck bruiloft`                                                   |             140 to 210 | both   | Foodtruck companies, Trouwen.nl                        |
| `catering bedrijfsfeest`                                               |                    170 | Ads    | Business caterers; **CPC €13.12**                      |
| `party catering`                                                       |                    170 | Labs   | Party rental + eventplanner                            |
| `hapjes bruiloft`                                                      |               70 to 90 | both   | Pinterest, ThePerfectWedding, hapjescateraar           |
| `dessertbuffet`                                                        |                     90 | both   | Event venues, BE caterers                              |
| `live cooking catering`                                                |               10 to 40 | both   | livecooking-overijssel, alvida-catering                |
| `walking dinner bruiloft`                                              |                     30 | both   | Caterers, Trouwen.nl                                   |
| `hapjes receptie`                                                      |                     20 | both   | Recipes                                                |
| `live catering`, `food entertainment`, `walking act`                   |                10 each | both   | Mixed                                                  |
| `live cooking bruiloft`, `eetbare act`, `bijzondere catering bruiloft` |              no volume | Ads    |                                                        |

What this says:

- **The concept has no search demand under its own name.** People don't know to search for "a person with a tray who makes your hapje". They search for catering for an occasion. The concept is the reason to pick us once they land, not the reason they land.
- **"Walking dinner" and "live cooking" are false friends.** High volume, wrong product. Writing a definitional post (Tier A3 in the content plan) would compete with restaurant tours and Van der Valk for a reader who isn't booking a caterer. `walking dinner bruiloft` (30) is the version that fits.
- **The generic hapjes space is a recipe market.** The intent filter in `seo-keyword-targets.md` is confirmed by the SERPs, not just by our 0-click GSC rows.

### Reachability on the terms that fit

| Query                     |        Vol | Reachable now | Later | Strongest in top 3 (rank)               | Our GSC     |
| ------------------------- | ---------: | ------------: | ----: | --------------------------------------- | ----------- |
| `catering bruiloft`       | 480 to 880 |        page 2 |    #7 | eventplanner.nl (459), trouwen.nl (395) | not ranking |
| `catering op locatie`     | 720 to 880 |            #9 |    #7 | debuffettenboer.nl (373)                |             |
| `catering feest`          |        260 |            #8 |    #5 |                                         |             |
| `event catering`          | 140 to 390 |            #9 |    #7 | eventplanner.nl (459)                   |             |
| `catering bedrijfsfeest`  |        170 |        page 2 |    #6 | cateringgroep.nl (274)                  |             |
| `party catering`          |        170 |            #8 |    #6 | eventplanner.nl                         |             |
| `foodtruck aan huis`      |        880 |            #4 |    #1 | weak SERP (median 107)                  |             |
| `foodtruck bruiloft`      | 140 to 210 |           #10 |    #7 |                                         |             |
| `luxe hapjes`             | 480 to 590 |            #6 |    #3 | weak, mixed intent                      |             |
| `hapjes bruiloft`         |   70 to 90 |            #8 |    #6 | theperfectwedding.nl (482)              | 26.1        |
| `dessertbuffet`           |         90 |            #8 |    #4 |                                         |             |
| `walking dinner bruiloft` |         30 |            #7 |    #4 | trouwen.nl (395)                        |             |
| `live cooking catering`   |   10 to 40 |            #7 |    #4 |                                         |             |

### Follow-up: how other live concepts get found (16 October)

Keyword Planner volumes for 66 live-concept phrases, plus the rankings of Meisjes met Smaak (the company behind the Oestermeisje):

| Searched                                                                                                                                      |       Volume / month |
| --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------: |
| `sushimeisje` / `sushi meisjes`                                                                                                               |          1,300 / 880 |
| `mobiele bar`                                                                                                                                 |                  390 |
| `sweet table bruiloft`                                                                                                                        |                  390 |
| `oesterman`                                                                                                                                   |                  260 |
| `oestermeisje`                                                                                                                                |                  110 |
| `walking act`, `food act`, `live catering`, `food entertainment`, `bijzondere catering`                                                       |              10 each |
| `rondlopende catering`, `live hapjes`, `eetbare act`, `interactieve catering`, `hapjesmeisje`, `tiramisumeisje`, `catering met entertainment` | no measurable volume |

- **Meisjes met Smaak** (rank 143, 150 referring domains) gets ~400 search visits a month, of which ~340 from its own brand name and ~45 from `oestermeisjes`. Its concept pages (`sushimeisje`, `ijsmeisje`) rank on page 2 to 5. Its homepage title is "Mobiel culinair entertainment boeken", a phrase with no measurable volume.
- **hetoestermeisje.nl** is an unrelated shop (framed oyster shells).
- **Conclusion:** live concepts are found through their brand or a character name that people have seen at an event (sushimeisje, oesterman), never through descriptive "live" wording. For us that means: win on occasion searches (`catering bruiloft`, `hapjes bruiloft`, `catering bedrijfsfeest`), sell "live" on the page, and grow brand searches through events, Instagram and video. Don't name competitors' characters on our pages: the searcher wants them, not us.

### Content gap: occasion pages

The 49 competitor pages compared against our homepage organise their offer by occasion: Bruiloft (6 of the ranking sites), Bedrijfsfeest (4), Private events (4), plus FAQ on vegetarian/vegan/halal (3) and "hoeveel hapjes per persoon" (4). We serve every occasion from one homepage whose title is "Live catering voor jouw bruiloft of evenement" (`live catering` has 10 searches a month).

Our homepage is not thin: 1,119 words, 11 questions and 6 prices against a competitor median of 674 words, 0 questions and 0 prices. The gap is structure and targeting, not volume of text.

The `/blog/hoeveel-hapjes-per-persoon` guide has **0 images** against a median of 7.5 on the ranking pages, and the related searches around it are mostly DIY-host terms. It stays a planning answer, not a growth page.

## 4. De klassieke bruidstaart

### Demand

| Search                                            |              Volume / month |   Reachable now |  Later | Top 3 (rank)                                                   | Our GSC            |
| ------------------------------------------------- | --------------------------: | --------------: | -----: | -------------------------------------------------------------- | ------------------ |
| `bruidstaart`                                     |                       4,400 |              #8 |     #5 | droomtaart.nl (125), ah.nl recipe, sillybakery.nl (170)        | 7.0 (1 impression) |
| `bruidstaart bestellen`                           |                         480 |          **#3** |     #3 | by-ine.nl (88), butikpastam.nl (0), toptrouwbedrijven.nl (416) |                    |
| `wat kost een bruidstaart`                        |                         210 |              #4 | **#1** | sillybakery.nl (170), reddit, facebook                         |                    |
| `prijs bruidstaart`                               |                   90 to 110 |              #7 |     #5 | theperfectwedding.nl (482), reddit, bakkerbas.nl               |                    |
| `bruidstaart proeven`                             |                          90 |              #5 |     #2 | instagram, sprinklestaarten.nl, gebakkerij.nl                  |                    |
| `bruidstaart proeverij`                           |                          70 |              #7 |     #3 | gebakkerij.nl, wishusweet.nl, perfectpastry.nl                 |                    |
| `bruidstaart 50 personen`                         |                          70 |              #6 |     #4 | perfectpastry.nl, jeeigentaart.nl, pinterest                   | 12.2               |
| `wat kost een bruidstaart voor 50 personen`       |                          50 |              #5 |     #3 | reddit, bakker-koster.nl, bruidenbruidegom.nl                  |                    |
| `moderne bruidstaart`                             |                          40 |              #6 |     #4 | beautifulbrideshop.nl, perfectpastry.nl                        |                    |
| `klassieke bruidstaart` / `bruidstaart klassiek`  |                     30 each |          **#3** |     #2 | bakverhalen.nl (121), huwelijk.nl (346), enjoy-cakes.nl        | 12.6 / 12.3        |
| `bruidstaart 25 personen` / `100 personen`        |                     30 each |         #7 / #6 |     #4 |                                                                | 13.3 / –           |
| `bruidstaart utrecht` / `amsterdam` / `hilversum` |               110 / 90 / 20 |  #7 (Hilversum) |     #5 | local bakeries, goudengids                                     | 18.1 / – / –       |
| guest-count price questions (20 to 200 personen)  | 10 to 20 each, ~20 variants | mostly #4 to #6 |        | reddit, small bakeries                                         |                    |
| `bruidstaart op maat`                             |                       **0** |                 |        |                                                                |                    |

Seasonality: `bruidstaart` runs at 5,400 a month from January to May and drops to 2,900 in December. `bruidstaart bestellen` peaks in March (720).

### Why we don't rank yet, and what fixes it

The page `/blog/bruidstaart` has 1,155 words, 8 prices and 8 FAQs against a competitor median of 657 words, 1 price and 0 FAQs. Content depth is not the problem.

- **Targeting.** The title is "Bruidstaart op maat: inclusief proeven" and the H1 "Bruidstaart op maat: Perfect voor jullie dag". `bruidstaart op maat` has no measurable volume. `klassieke bruidstaart`, `bruidstaart bestellen` and `bruidstaart proeven` (together ~600 a month) are not in the title or H1. "Proeven zit bij de prijs in" is a genuine differentiator for the 160 monthly proeven/proeverij searches.
- **Photos.** 5 images against a median of 12. Cake buyers shop with their eyes; the ranking pages are galleries.
- **Unanswered questions** that recur in People also ask: "Hoeveel taart voor 50 personen?" (3 SERPs), "Hoeveel taart voor 30 personen?" (2), "Wat is een lekkere vulling voor een bruidstaart?" (4, near miss), "Wat is de gemiddelde prijs van een bruidstaart?" (5, near miss), "Wat kost een sweet table?".
- **Authority.** The pages above us have 70 to 150 referring domains or are directories. A couple of wedding-directory profiles linking to this page would matter more here than anywhere else on the site.
- **Local pack.** 9 of the 13 bruidstaart SERPs checked show a map pack. Our profile is categorised only as Catering. In the `bruidstaart hilversum` Maps results, Taaartjes Hilversum (#4) combines Catering with "Bakkerij voor bruidstaarten" and "Buffet met zoetigheden en desserts" as extra categories. Add those only if they honestly describe the offer.

## 5. Local: Google Maps and the Hilversum SERPs

Maps results, searched from central Hilversum (top 20):

| Query                                | Our position   | Top 3 (rating, reviews)                                        |
| ------------------------------------ | -------------- | -------------------------------------------------------------- |
| `hapjes catering hilversum`          | **#3** (5★, 3) | Boer10 Foodservice (5★, 69), FAJÉ (4.9★, 47), us               |
| `bedrijfsfeest catering hilversum`   | #10            | Boer10 (69), FAJÉ (47), That chef (5)                          |
| `cateraar hilversum`                 | #11            | Foodking (5), That chef (5), Boer10 (69)                       |
| `catering hilversum`                 | #15            | Boer10 (69), Catering Hilversum (1), FAJÉ (47)                 |
| `catering het gooi`                  | not in top 20  | Catering Service Het Gooi (4), Warung Adinda (176), FAJÉ (47)  |
| `bruidstaart hilversum`              | not in top 20  | Emmanna (57), LAB Pasticceria (72), Banketbakkerij Burgt (219) |
| `catering bussum` / `catering laren` | not in top 20  | small local caterers, 1 to 138 reviews                         |

The organic local pack from Hilversum shows FAJÉ, Boer10 and "Catering Hilversum" for `catering hilversum` and `cateraar hilversum`, and **us** in the pack for `hapjes catering hilversum`.

Observations:

- Ratings don't separate anyone: almost everyone is 4.8 to 5.0. Review count and relevance do. Two businesses with 1 and 5 reviews still beat us on some queries, so category and relevance matter alongside volume.
- Our profile: claimed, primary category Catering, secondary "Service establishment", 3 reviews, no address shown (service-area business).
- Real categories seen in this market: Catering (80 listings), Mobiele cateraar (4), Bakkerij voor bruidstaarten (2), Buffet met zoetigheden en desserts (1).
- Organic `catering hilversum` from Hilversum: we're not in the top 20 (GSC average 31.5 over six months, 1,110 impressions). The page is held back by authority, as before, not by missing content: 1,040 words against a 786 median, but 3 images against 9.

## 6. Competitors (no single one)

There is no one rival. Each of our markets has its own set:

| Market                                             | Who holds it                                                                        | How strong                                      |
| -------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------- |
| Tiramisu / millefoglie for weddings                | us, deliscu.nl, welovecakes.nl, Instagram                                           | weak; we lead                                   |
| Klassieke bruidstaart                              | small bakeries (by-ine, tortedolci, yumbons, sillybakery, droomtaart) + directories | weak to medium                                  |
| Occasion catering (bruiloft, feest, bedrijfsfeest) | Eventplanner, Trouwen.nl, ThePerfectWedding + regional caterers                     | directories strong, caterers medium             |
| Hilversum / Het Gooi catering                      | FAJÉ, Boer10, De Buffettenboer, Tiramisu Hilversum, Cateringfabriek, La Casina      | medium                                          |
| Concept peers (food entertainment)                 | eatertainment.nl, dutchfoodentertainment.nl, showbird.com                           | eatertainment strong (via recipes), others weak |

Directories are not competitors to beat; they are places to be listed. They hold positions 1 to 7 on `catering bruiloft`, `hapjes bruiloft`, `prijs bruidstaart`, `catering feest` and `walking dinner bruiloft`.

## 7. Links: what peers have and what's realistic for us

Peer backlink profiles are dominated by things we should **not** copy: paid blog networks (dozens of generic Dutch blogs at rank 35 or 51 linking to eatertainment.nl and debuffettenboer.nl), startpagina-style link pages, and spam directories (clifflisting, seodirectorypro and similar). Only seven domains link to two or more peers, and most of those are low-value directories.

Realistic shortlist, in order of value per hour:

| #   | Target                                             | Why                                                                                                   | Evidence                                                                                                                                  |
| --- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Google Business Profile reviews**                | Not a link, but the local ranking lever. Ask every client after the event.                            | 3 reviews vs 47 and 69 for the map-pack leaders                                                                                           |
| 2   | **ThePerfectWedding.nl** supplier profile          | Ranks #1 `prijs bruidstaart`, #2 `hapjes bruiloft`, #7 `bruidstaart`, `bruiloft catering`             | rank 482                                                                                                                                  |
| 3   | **Trouwen.nl** supplier profile                    | #3 `catering bruiloft`, ranks on `walking dinner bruiloft`, `foodtruck bruiloft`, `tiramisu bruiloft` | rank 395                                                                                                                                  |
| 4   | **Eventplanner.nl** listing                        | #1 `catering bruiloft`, #4 `catering feest` ("Partycatering top 10"), #10 `live cooking`              | rank 459                                                                                                                                  |
| 5   | **TopTrouwbedrijven.nl**                           | #3 `bruidstaart bestellen`, #10 `bruidstaart`, ranks `bruidstaart 50 personen`                        | rank 416                                                                                                                                  |
| 6   | **Huwelijk.nl**                                    | #2 `klassieke bruidstaart`                                                                            | rank 346                                                                                                                                  |
| 7   | **Hilversum venues** (preferred-supplier pages)    | Partner links with local relevance; venue sites already link to caterers they work with               | Dudockx & Wildschut and Gooiland Events are in the `bedrijfsfeest hilversum` pack; paviljoen-debuitenplaats.nl links to De Buffettenboer  |
| 8   | **Real-wedding features** (ZegMaarYes and similar) | Editorial link + photos, via the couple and photographer                                              | zegmaaryes.nl links to eatertainment.nl                                                                                                   |
| 9   | **Local platforms**: livehilversum.com             | Local relevance                                                                                       | links to tiramisuhilversum.nl                                                                                                             |
| 10  | **Trustoo.nl / StarOfService** profile             | Lead platforms that rank on local queries; a profile gives SERP presence                              | Trustoo #4 `hapjes catering hilversum` and #12 `bedrijfsfeest hilversum`; StarOfService #12 `catering het gooi` (searched from Hilversum) |

Caveats: directory pricing and link attributes were not checked. Several wedding directories sell profiles; a paid listing is advertising and fine as such, but a paid **followed** link bought for ranking is a Google link scheme. Choose them for the leads and the SERP presence. Nothing has been submitted or contacted.

## 8. Decisions revisited with data

- **Second city page (Het Gooi / Utrecht / Amsterdam): still defer.** `catering het gooi` is 50 a month (Ads), Gooi towns 20 to 140 each. Amsterdam (880 to 1,000) and Utrecht (720) are reachable only at #7 to #10 now. Hilversum itself still averages position 31.5 and we're #15 in Maps there. The data agrees with the 23 September decision.
- **Is millefoglie demand wedding demand? Mostly not.** `millefoglie` 880 a month against `millefoglie bruidstaart` 30 to 40 and `italiaanse bruidstaart` 70. The `millefoglie` SERP is a recipe site, a bakery and Albert Heijn. Roughly 1 in 10 searches is wedding intent.
- **Which Tier A/B posts have volume?** See the content plan update. In short: `walking dinner bruiloft` 30, `live cooking bruiloft` none, `wat kost catering per persoon` 10, `catering bruiloft kosten` 10, `dessertbuffet` 90, `foodtruck aan huis` 880. Tier S4 and S5 as written have little search volume.

## 9. What to stop doing

- Writing for generic hapjes, hartige or italiaanse hapjes, or hapjes receptie: recipe SERPs.
- Definitional posts on `walking dinner` or `live cooking`: wrong product behind the volume.
- More city pages before Hilversum and the Maps profile move.
- Trying to rank on the concept's own vocabulary (live catering, food entertainment, walking act): no searches. Use it as the pitch on occasion pages instead.
- Looking at peer backlink profiles as a to-do list: most of it is paid networks and spam.

---

## Evidence and repeatability

- Run directory: `data/seo-research/2026-10-16/` (gitignored). Key files: `overtake.csv` (per-query reachability with GSC), `ads_volume.csv` (Keyword Planner check), `maps.csv`, `local.json`, `content_gaps/*.md`, `backlinks.json`, `opportunities.csv`, `keywords.csv`, `report.md`.
- Cost log: `data/seo-research/costs.csv`. DataForSEO balance before the run was $46.06.
- GSC input: `data/gsc/gsc-2026-04-01_2026-10-13.json`, pulled 16 October with the isolated `CLOUDSDK_CONFIG=/Users/GijsvanLeeuwen/.config/gcloud-hangendehapjes-seo`.
- Re-run for free from cache: `uv run scripts/seo-research/research.py report --run 2026-10-16`. A fresh run in 3 to 6 months costs about $3.50 and shows whether the bruidstaart and occasion work moved anything.

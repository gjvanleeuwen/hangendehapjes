# Meta ads plan (goals, creatives, pixel)

Reference doc for the paid-social push. Decided in the 2026-07 ads planning session.
Actionable checklist lives in [todo.md](../todo.md) under "Paid acquisition". This doc is
the strategy + content + tracking detail behind those checkboxes.

Note: this reverses the old "skip Meta for now" call in todo.md. That call assumed we'd
optimise for conversions (which our lead volume can't feed) and that the pixel was a
prerequisite. The plan below sidesteps both: we optimise for cheap engagement, and the
early phase needs no site pixel at all.

---

## The core split: search captures, social generates

Two different jobs, two different channels. Don't mix them.

- **Google Search = demand capture.** Only works where people already type a query. Our
  concept has almost no search demand (nobody googles a thing they don't know exists), so
  search is a narrow play. The one live search pond is the **classic bruidstaart**: real
  search volume exists and we don't rank for it yet (confirmed case "b"), so paid clicks
  there are incremental, not cannibalising. Keep it geo/intent-qualified ("bruidstaart op
  maat", "bruidstaart Hilversum / Het Gooi", "bruidstaart proeven"), never generic
  "bruidstaart" (national, every baker, expensive). Do NOT bid on `tiramisu-bruiloft` terms:
  we already rank organically, so paid would buy clicks we get for free.
- **Meta / Instagram = demand generation.** We interrupt the right people with a video and
  create the want. This is the better-fit channel for a novel, visual concept, and it's
  where the bulk of budget goes.

---

## Campaign structure: two campaigns, split by audience, sequenced

Not three parallel campaigns (brand / tiramisu / burrata). "Brand" isn't its own campaign,
it rides on the best specific creative. Running overlapping consumer campaigns just makes us
bid against ourselves and starves each of signal. The clean cut is **audience**:

| Campaign     | Audience                                                      | Lead product / angle                                     |
| ------------ | ------------------------------------------------------------- | -------------------------------------------------------- |
| **Consumer** | Engaged couples, party hosts (bruiloften, recepties, feesten) | Live concept, tiramisu, tiramisu taart, "hartig of zoet" |
| **Zakelijk** | Corporate / event planners, office managers                   | Burrata / Borrel Baas, "iets nieuws voor je event"       |

**Sequence, don't parallelise.** Launch Consumer first (SEO already proves wedding demand,
Meta's engaged/wedding targeting is cheap and sharp, and we have tiramisu video). Add Zakelijk
only after burrata video exists, because a live concept without motion underdelivers and the
corporate audience is fuzzier and pricier to reach. On a small budget, sequencing beats
simultaneity.

---

## Objective: optimise for engagement, not conversions (early)

A new bespoke high-ticket caterer will never hit the ~50 conversions/week Meta needs to exit
learning phase on a conversion campaign, so pointing it at "leads" just burns budget stuck in
learning. Instead:

- **Objective = video views / engagement.** Cheap signal Meta is brilliant at, and high-intent
  people self-select through to the site or DM.
- **Free warm-audience building.** Video-view and engagement campaigns build retargetable
  Custom Audiences ON META (video viewers 50%+, IG/FB engagers) with **no website pixel and no
  cookie banner needed**, because that data lives on Meta, not our site. This is the early
  audience engine given our thin site traffic.
- **Graduate later.** Only move toward a lead/conversion objective + website retargeting once
  there's a warm pool and some pixel history.

---

## Creatives

### Inventory reality (2026-07)

- **Video: only 2 clips, both tiramisu/dessert. Zero burrata / corporate video.**
- **Photos: ~30.** Burrata ~6, classic bruidstaart ~4, tiramisu taart ~3, millefoglie ~4,
  people/event ~11.
- **The bottleneck is video, especially burrata.** Not budget. At every event, the highest-value
  thing to capture is vertical burrata + tiramisu clips.
- **Organic performance is NOT a paid predictor.** One of the tiramisu clips underperformed
  organically; that mostly means few followers saw it, not that the creative is weak. Don't
  shelve it. Re-cut it for paid and let paid data decide.

### Format specs (applies to every asset)

- **Video:** 1080x1920 (9:16), 6 to 15s, hook in second 1, burned-in captions, legible sound-off.
- **Static:** build a **9:16 master (1080x1920)** with key content inside a centered **4:5 safe
  zone**, then export the 4:5 crop (1080x1350) for feed. Upload both and use Meta placement asset
  customization so Stories/Reels get 9:16 and feed gets 4:5. Skip 1:1 (loses to 4:5 in feed) and
  1.91:1 landscape.
- Put video + static in the SAME ad set and let Meta allocate budget to the winner.

### Consumer creative set (launch now)

| #       | Format            | Angle                                                                               | Build from                             |
| ------- | ----------------- | ----------------------------------------------------------------------------------- | -------------------------------------- |
| 1       | 9:16 video <15s   | Concept reveal: live tiramisu between guests, hook = tray+hands frame 1             | re-cut existing clip                   |
| 2       | 9:16 video <10s   | Same footage, different hook (open on the pour / a guest's face)                    | re-cut existing clip                   |
| 3       | 9:16 + 4:5 static | Product beauty + offer: `tiramisutaart_hapje` + "vanaf 50 porties, vanaf Hilversum" | have it                                |
| 4       | 9:16 + 4:5 static | Real-event proof: `charlotte_evenement`, "dit gebeurt op echte bruiloften"          | have it                                |
| 5 (opt) | 9:16 + 4:5 static | "Hartig of zoet?" duo, brand duality + CTA                                          | compose `charlotte_main` + `gijs_main` |

### Zakelijk creative set (hold for burrata video)

| #           | Format            | Angle                             | Build from                         |
| ----------- | ----------------- | --------------------------------- | ---------------------------------- |
| 1           | 9:16 + 4:5 static | Live burrata bar op je borrel     | `burrata_closeup` / `burrata_trio` |
| 2           | 9:16 + 4:5 static | Borrel Baas in actie              | `gijs_evenement`                   |
| real launch | 9:16 video        | Gijs maakt burrata live + reactie | **needs shoot**                    |

Static-only Zakelijk underdelivers for a live concept. Either hold entirely until the burrata
shoot, or run the two statics at a token budget just to start seeding the audience.

### Landing pages

- Consumer video clicks land on **`/blog/tiramisu-bruiloft`** (already ranks + converts organic
  traffic, so it's a proven, de-risked landing page).
- Later, retarget that page's organic visitors on Instagram with a static price/CTA (needs the
  pixel, see below).

### Copy

Ad copy (primary text, headline, CTA) per creative, NL + EN, still to write in the brand voice.
Openers can play on "Hartig of zoet?" / "Waar kies jij voor?". Concrete beats vague
(50 porties, vanaf Hilversum, €0,45/km).

---

## Pixel + consent

Not needed for the early engagement phase (warm audiences come from Meta-side engagement). Add
it now only to start accumulating website + conversion history for later retargeting.

- **Meta Pixel only. No GA4, ever** (Umami already covers analytics, cookieless). **Google Ads
  tag only if/when we run the bruidstaart search campaign**, and it needs ~1,000-person audiences
  to serve, so it's even less useful early than Meta.
- **Every tracker is another line behind the consent banner and another chip off our "we don't
  collect" advantage.** Add only what a live channel needs.
- **Consent is mandatory (NL/GDPR).** The Meta pixel drops tracking cookies, so it must be gated
  behind a cookie banner that defaults to OFF until accept. Umami stays cookieless and needs no
  consent, so the banner gates only the Meta pixel.
- **Minimal banner:** two buttons (accepteren / weigeren), a localStorage flag, pixel loads only
  on accept. No heavy CMP library.
- **Volume caveat.** Website-visitor retargeting needs a few hundred to ~1,000 people to serve.
  On thin traffic the pool builds slowly, so install now = accumulate for later, not use today.
- **Conversion event:** fire Meta `Lead` on the existing `contact_submit` Umami event so future
  conversion campaigns / measurement have data.

---

## Open questions / decisions

- Daily budget for the Consumer test (suggest starting small, ~€10/day, 2 to 3 weeks).
- Who edits the re-cut clips + builds the statics.
- When the burrata shoot happens (gates the whole Zakelijk campaign).

# Funnel report: website → aanvraag → booking

One script turns three data sources into a single HTML report with a JSON snapshot per run, so you can re-run it monthly and compare.

```sh
bun run gsc:pull     # fresh Search Console data → data/gsc/
bun run report       # → reports/funnel-<date>.html + .json
bun run report -- --km 45   # assume 45 km one-way for the cost estimates
open reports/funnel-$(date +%F).html
```

`data/` and `reports/` are gitignored (they contain customer data).

## Inputs

| Source                                                                   | Where it comes from                                                        | Where to put it                                                                                                                                                                                                     |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Umami (visits, CTA clicks, form funnel)                                  | Umami Cloud → website → Settings → Export data. You get a mail with a zip. | Drop the zip in `data/`. The script unzips it and picks the newest export.                                                                                                                                          |
| Ad spend (Instagram / Meta)                                              | Ads Manager, typed over per campaign.                                      | `data/ad-spend.csv` with header `campaign,from,to,spend,clicks`; campaign must equal the `utm_campaign` of the ad link.                                                                                             |
| Search Console (clicks, impressions, per page/query/day)                 | `bun run gsc:pull` (API) or Search Console → Performance → Export.         | API: automatic under `data/gsc/`. UI export: unzip to `data/gsc-<date>/` (has `Dates.csv` or `Datums.csv`).                                                                                                         |
| Aanvragen pipeline (leads, offertes, won, amounts, timing, lost reasons) | The `deals` table behind `/admin/aanvragen`.                               | Click **Exporteer JSON** at the top of `/admin/aanvragen` and save the file as `data/deals-<date>.json`. Newest file wins. Alternative: `bun run report -- --db` with `DATABASE_URL` pointing at the live database. |

### Search Console API access (one-time)

The pull script uses the gcloud CLI's application default credentials. Log in with the Google account that owns the `sc-domain:hangendehapjes.nl` property:

```sh
gcloud auth application-default login --scopes=https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/webmasters.readonly
bun run gsc:pull
```

On a 403 the script prints which properties the logged-in account can see. Data lags about 3 days; the script stops 3 days before today and pulls from 2026-04-01 by default (`--start`, `--end`, `--site` to override). Re-running just overwrites older days with newer numbers.

## What the report shows

- **Overall tiles**: visits, GSC clicks, leads, lead rate, offertes, win rate, won value, value per visit, value per lead, value per Google click (also with the open pipeline weighted by win rate). Click-based tiles only appear when GSC covers 90%+ of the days in the range.
- **Per month**: traffic by source, contact funnel (viewed → submitted), leads, offertes, won, open, lost. Cohort by the month the aanvraag came in.
- **By source / by campaign / by landing page**: the three tables for judging ads. Campaign and landing-page leads need the measured first touch (see below).
- **Business & customers**: bookings, revenue incl/excl BTW, average and median order value, guests per booking, price per guest, lead time (came in → event), repeat customers, open offertes, plus a cost picture: materials, hours, gross margin and € per hour over won bookings, by product and per booking, and the agenda load per event month. Costs and hours come from the deal when it has them (`costs`, `time_spent`), otherwise from the admin pricing model (`src/lib/admin/pricing.ts`, `DEFAULT_CONFIG`) at the deal's guest count and `--km` one-way (default 30, the edge of the free travel radius). "Quote vs model" compares the real quote with what the calculator would price today.
- **Runs over time**: one row per earlier `reports/funnel-*.json`.
- **All aanvragen**: the list with the bucket the report used and whether it came from your manual attributie, the measured first touch, or the client's own words.

## Keeping the pipeline data useful

The report can only show what the admin records. Per deal:

Everything below lives on the **Pijplijn** tab of `/admin/aanvragen/[id]`, except kosten and uren (tab **Uren & kosten**). The "let op" column in the list (`reden?`, `reactie?`, `verloopt`, `kosten?`) links straight to the field that is missing.

- **Status** drives everything. "Afgewezen (klant)" counts against the win rate, "Afgewezen (wij)" does not. Set it from the list: the select saves on change.
- **Eerste reactie op** is stamped automatically the first time a deal leaves "nieuw". Correct it if you replied earlier by mail or WhatsApp.
- **Offerte verstuurd op**, **geaccepteerd op** and **afgewezen op** are stamped automatically on the status change; together they give days to offerte and days to decision.
- **Reden afwijzing** (te duur, andere leverancier, feest gaat niet door, geen reactie, anders): fill it in on every lost deal. In the list a second select appears as soon as the status is "Afgewezen (klant)", so filing a lost deal is two clicks without leaving the list.
- **Attributie** only when you know the real source (a chat at an event, a friend); otherwise the measured first touch and the client's own words fill in.
- **After the booking** the status walks on: Geaccepteerd, Geleverd, Factuur verstuurd, Betaald (afgerond). All four count as won. Nobody tells the admin the event happened or the money came in, so set these yourself. The list nudges you with `geleverd?` once the event date has passed, `factuur?` while a deal sits on Geleverd, and `betaald?` when an invoice is more than 14 days old. **Factuur verstuurd op** and **betaald op** are stamped on the status change, just like the other dates.
- **Opvolgen**: an open offerte gets two reminders and then a call. Click "Herinnerd" (or "Gebeld") in the list's Opvolgen column and today's date lands on the next step; the `herinner 1`, `herinner 2`, `bellen` and `afsluiten?` chips show when the next step is due, 7 days apart (`FOLLOW_UP_DAYS` in `src/lib/deals.ts`). The dates are editable on the Pijplijn tab.
- **Kans** (laag, midden, hoog) is a gut feeling per open deal. The dashboard weights the openstaand value with it (20%, 50%, 80%; no kans counts as 50%).
- **Kosten** and **uren** per deal replace the pricing-model estimates in the margin section.

## Ads rule

The report ends its business section with "Ads rule: what a click may cost". It derives a maximum cost per click, per lead and per booking from the won bookings: average booking excl. BTW, minus materials, minus what we want to keep per event, equals what a booking leaves for ads; times the win rate gives the max per lead; times the lead rate of ad traffic gives the max per click. The three assumptions live in `ADS_RULE` in `scripts/funnel-economics.ts`: win rate 20%, ad traffic converts at 50% of the measured lead rate, and €350 to keep per event before tax. The limits are break-even against that pay target, not profit. The campaign table marks each campaign's cost per click and cost per lead as ok, above (up to 1,5× the max) or stop.

## How a lead gets its source

Priority order, implemented in `scripts/funnel-report.ts` and the admin:

1. **Attributie** you typed in the admin (manual truth).
2. **First touch** the site measured: `src/lib/attribution.ts` stores the first utm / referrer / landing page in `localStorage` for 180 days (root layout), the contact form sends it along, and it lands in `deals.first_touch` (also on half-finished leads). The admin shows it as "site: …", the notification email as "Bron (site)".
3. **What the client typed** in "hoe ons gevonden".

The same `sourceBucket()` function labels Umami visits in the report and the `contact_start` / `contact_submit` events in Umami (`source`, `campaign`, `landing` properties), so Umami's own event breakdown matches the report.

## Tagging ads (Instagram, Meta, Google)

Paid vs organic is decided by `utm_medium`, so every ad link must carry UTMs:

```
https://hangendehapjes.nl/?utm_source=instagram&utm_medium=paid&utm_campaign=bruiloft-2027&utm_content=reel-tiramisu
```

- `utm_source`: `instagram`, `facebook`, `tiktok`, `google`
- `utm_medium`: `paid` (anything else counts as organic)
- `utm_campaign`: one name per campaign; shows up as its own row
- `utm_content`: creative / placement, visible in the admin and email summary

`fbclid` alone is not treated as paid, because Meta adds it to organic link clicks too.

## Umami events

Click events use `data-umami-event="<surface>_<action>"`:

- Homepage: `nav_offerte`, `hero_products`, `home_offerte`, `home_whatsapp`, `footer_whatsapp`, `footer_mail`, `footer_instagram`, `footer_facebook`, `footer_tiktok`.
- Blog posts (slug ∈ `tiramisu`, `bruidstaart_klassiek`, `bruidstaart`, `burrata`, `hapjes`): `blog_<slug>_top_offerte` (CTA under the summary), `blog_<slug>_sticky_offerte` and `blog_<slug>_sticky_whatsapp` (mobile bottom bar), `blog_<slug>_prices_view` (price section scrolled into view), `blog_<slug>_andere_taart_<id>`.
- Location pages: `catering_<slug>_offerte`, `catering_<slug>_whatsapp`.

Form lifecycle events (`contact_view`, `contact_start`, `contact_service_type`, `contact_step`, `contact_submit`, `contact_error`, and `contact_abandon` with `lastField` and `step`) carry `surface` (`home` or `blog_<slug>`) plus `source` / `campaign` / `landing` from the first touch, so in Umami you can build one funnel per page and per channel: prices seen → form seen → started → submitted. The report shows the same funnel per landing page.

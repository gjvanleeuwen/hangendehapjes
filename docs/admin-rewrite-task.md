# Task: rewrite `/admin/aanvragen` so filing data takes seconds

## Why

The aanvragen admin grew into one 1.500-line page where every deal expands into two stacked panels (portal and payments on top, a 25-field editor below), with offerte versions, akkoord evidence, praktische vragen, uren and notities all in the same scroll. Finding the one field you need (set a status, pick a reden afwijzing, fill in the eerste reactie date) means hunting through unrelated sections. Result: the fields are not filled in, and the funnel report (`docs/funnel-report.md`) stays blind on reply speed, lost reasons, costs and hours.

The rewrite has one goal: **the daily actions take one or two clicks, and everything else is out of the way until you need it.**

## What stays exactly as it is

- The data model. All columns exist already (`src/lib/server/db.ts`, `src/lib/deals.ts`). Do not add, rename or drop columns.
- The business rules in `src/routes/admin/aanvragen/+page.server.ts`: the `update` action's parsing and its auto-stamps (offerte verstuurd op + geldig tot on sending, geaccepteerd op, afgewezen op, eerste reactie on leaving `nieuw`), `generateAcceptance`, `setQuoteVisibility`, `deleteQuote`, `delete`, `dismissLead`, `create`. Move them, do not change their semantics. Keep a partial-update model: a form only sends the fields it shows, the action only touches what was sent.
- `$lib/deals` helpers (`isOfferteSent`, `isWon`, `isPending`, `computeMetrics`, `LOST_REASONS`, `TIME_PHASES`, `PAYMENT_TERMS`, quote helpers). The dashboard at `/admin`, the calculator, document generator, event sheet, klantportaal, ICS feed (`/admin/calendar.ics`) and the JSON export (`/admin/aanvragen/export.json`) keep working unchanged.
- Stack and conventions: SvelteKit, Svelte 5 runes, TypeScript, Tailwind v4, the shadcn components under `src/lib/components/ui`, form actions with `use:enhance`, `bun run check` clean, prettier clean. Admin UI language is Dutch, informal (jij/je), no em dashes.

## Target structure

### 1. List page: `/admin/aanvragen`

A lean table, one row per deal, nothing expands inline. Columns: binnen, naam (+ bron under it), event (datum, gasten, locatie), wat, status, offerte bedrag, geldig tot, portaal state, and a "let op" column.

- **Status** stays an inline select that saves on change (as now). When the new status is `afgewezen`, a small inline select for **reden afwijzing** appears in the same cell and saves on change. Filing a lost reason is two clicks from the list, no navigation.
- **Let op** column shows at most three chips, each a link to the matching section on the detail page: "reden?" (afgewezen without reason), "reactie?" (not `nieuw` but no eerste reactie date), "verloopt" (geldig tot within 7 days, amber; past, red), "kosten?" (won, no costs or hours logged).
- Filters above the table as toggles: open (nieuw + offerte verstuurd + in optie), gewonnen, verloren, alles. Default: open. A text search on name.
- Row click opens the detail page. No `editingId` state, no `colspan` panels.
- Top bar: "+ Nieuwe aanvraag" (opens the create form on its own page or in a sheet), "Exporteer JSON", "Agenda" link.
- Half-finished leads ("Half ingevulde aanvragen") move to their own small page `/admin/aanvragen/leads` with a count badge in the top bar. The agenda calendar, the ICS instructions and the Analytics `<details>` move off this page: agenda to `/admin/agenda`, analytics already lives on `/admin`.

### 2. Detail page: `/admin/aanvragen/[id]`

Header: name, event date, status select with reden afwijzing, the amount, and the action buttons that exist today (event sheet, offerte maken, factuur maken, bereken offerte). Below the header, **tabs**, one job per tab, each tab its own small form with its own save button:

| Tab                    | Fields                                                                                                                                                                                                                                                                                                                     | Notes                                                                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pijplijn** (default) | status, reden afwijzing, eerste reactie op, offerte verstuurd op, geldig tot, geaccepteerd op, afgewezen op, offertebedrag, btw, interne notitie                                                                                                                                                                           | This is the tab Gijs opens ten times a week. Dates in one row, money in one row, notitie last. Saving stamps nothing the user did not change. |
| **Contact & event**    | naam, e-mail, telefoon, bron (wat ze zeiden), attributie, gemeten bron (read-only), datum, locatie, gasten, concept, keuze, dagdeel, tijd, bericht (read-only)                                                                                                                                                             | Rarely edited after intake.                                                                                                                   |
| **Offerte & portaal**  | actieve offerte (versions list with zichtbaar/verwijder), klantlink (generate, open, copy, geldig t/m, aan/uit), betaalafspraak, aanbetaling (bedrag, status, Mollie link), eindbetaling (idem), notitie voor de klant, praktische vragen (aan/uit + question config), akkoord evidence (read-only), ops audit (read-only) | Everything that today sits in the top panel and the quote-version block. Group with headings: Offerte, Klantlink, Betalen, Portaal.           |
| **Uren & kosten**      | kosten (excl. btw), uren per fase (`TIME_PHASES`), live readout of take-home and €/uur                                                                                                                                                                                                                                     | Feeds the margin section of the report.                                                                                                       |

Each tab is its own component under `src/lib/admin/aanvraag/` (e.g. `PipelineTab.svelte`, `ContactTab.svelte`, `PortalTab.svelte`, `HoursTab.svelte`) so no file exceeds roughly 300 lines. The detail route has its own `+page.server.ts` with the moved actions; the list route keeps only `update` (status + reason), `delete` and `dismissLead`.

### 3. Create page: `/admin/aanvragen/nieuw`

The current "Aanvraag toevoegen" form, unchanged in fields, on its own page. Keep the "oorspronkelijke datum" backfill field.

### 4. Mobile

Gijs files things from his phone between events. The list collapses to cards on small screens (name, event, status select, chips). The detail tabs become a horizontal scrollable tab bar. All selects and date inputs are native so iOS pickers work.

## Steps for the executor

1. Read `src/routes/admin/aanvragen/+page.svelte` and `+page.server.ts` end to end, and `src/lib/deals.ts`. List every form field name the `update` action accepts; the new tabs must use the same names so the action needs no changes.
2. Create the detail route and move the per-deal markup into the four tab components. Move `generateAcceptance`, `setQuoteVisibility`, `deleteQuote` into the detail route's actions. Keep `update` available in both routes (shared helper module, e.g. `src/lib/server/admin/deal-actions.ts`, imported by both `+page.server.ts` files).
3. Rebuild the list page from scratch with the columns, filters and chips above. Delete the expanded-row code.
4. Move half-finished leads and the agenda to their own routes; add them to the admin nav in `src/routes/admin/+layout.svelte`.
5. Create page for new aanvragen.
6. Run `bun run check` and `bun run lint`. Walk through with the local database (`docs/local-admin-testing.md`): create a deal, send an offerte (status change stamps dates), mark it lost from the list with a reason, open the detail page, log hours and costs, generate a klantlink, and confirm `/admin/aanvragen/export.json` still returns the deal with `lostReason`, `firstReplyOn`, `costs`, `timeSpent`.
7. Update `docs/funnel-report.md` "Keeping the pipeline data useful" if any field label changed, and the memory notes in CLAUDE.md-adjacent docs if routes changed.

## Acceptance criteria

- From the list, setting a status and a reden afwijzing takes two clicks and no page change.
- The Pijplijn tab shows every date and money field without scrolling on a laptop screen.
- No Svelte file under `src/routes/admin/aanvragen` or `src/lib/admin/aanvraag` is longer than about 400 lines.
- Nothing in the klantportaal, document generator, calculator, ICS feed, dashboard or export changed behaviour.
- `bun run check` and `bun run lint` pass; the walkthrough in step 6 succeeds.
- On a phone, the list and the Pijplijn tab are usable without horizontal scrolling.

## Out of scope

- New fields or statuses, automated reminders, e-mail sending from the admin, any change to the public site, the klantportaal pages or the pricing model.

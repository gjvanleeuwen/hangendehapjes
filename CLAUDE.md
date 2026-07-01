# Hangende Hapjes

Simple marketing website for **Hangende Hapjes**, a small Dutch catering business run by Gijs van Leeuwen and his wife. Based in Hilversum, NL.

The business is a hybrid of food and entertainment: one or both of them walk around an event with a tray slung from the neck and prepare a snack live in front of guests. Two product concepts:

- **De Toetjes Vrouw** — wife walks around making fresh tiramisu per guest.
- **De Borrel Baas** — Gijs walks around making live burrata bowls per guest.

Aimed at weddings, receptions, corporate events, parties.

## Goals for this site

- A basic, presentable fallback so prospects who hear about us via word of mouth / Instagram can land somewhere legitimate.
- Single page, single CTA: a working contact form.
- Dutch is the primary language. A complete English mirror lives under `/en`.
- Not an e-commerce / booking platform — every booking is bespoke and finalised over email.

See [docs/website-plan.md](docs/website-plan.md) for the page structure, copy direction, and product/pricing reference.

## Project Configuration

- **Framework**: SvelteKit (Svelte 5, runes mode enforced via `svelte.config.js`)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Package Manager**: bun (use `bun install`, `bun run dev`, etc. — there is a `bun.lock`)
- **Formatting**: prettier with `prettier-plugin-svelte` and `prettier-plugin-tailwindcss`
- **Adapter**: `@sveltejs/adapter-auto` (final hosting target TBD; likely Vercel or Netlify)

Common scripts:

```sh
bun run dev       # vite dev server
bun run build     # production build
bun run check     # svelte-check / type-check
bun run format    # prettier --write
bun run lint      # prettier --check
```

## Voice and tone

Copy on this site speaks in the voice of Gijs and Charlotte themselves — first-person plural ("wij"), warm, casual, slightly playful. The reference is the founding Instagram post on [@hangendehapjes](https://instagram.com/hangendehapjes) ("Aan wie hangen dan de hapjes? Dat zijn Charlotte en Gijs…"). Match that energy.

Hard rules:

- NO EM DASHES!!
- **Always informal.** NL uses **jij / je / jouw** — never **u / uw**. EN keeps the same warmth ("you / your", contractions are fine).
- **Never "tafel" / "aan tafel" / "tray-side" or any phrasing that implies seated table service.** They walk around at receptions, parties, and weddings with a tray slung from the neck. Use "tussen jouw gasten door", "ter plekke", "lopend", "op locatie" / "on the spot", "in front of your guests".
- **The two characters are complementary, not interchangeable.** Lean into the contrast on copy:
  - Charlotte → De Toetjes Vrouw → **zoet**, klassiek, bakker.
  - Gijs → De Borrel Baas → **hartig**, nieuw en anders, koken.
  - Guests can choose whom they want, including cross-overs.
- **First catering concept.** They're new to this and that's part of the charm. Authenticity over polish. Don't write like a 10-year-old caterer.
- **Couple energy.** "Net 1 jaar getrouwd, al bijna 15 jaar samen, talloze feestjes en diners thuis als achtergrond" is the implicit backstory.
- **Vocabulary that fits**: _lekker, leuk, super, echt, gewoon, een praatje, een schaaltje, ter plekke, hartig, zoet, eensgezind_.
- **Vocabulary to avoid**: corporate verbs and nominalisations (_"verzorgen op locatie"_, _"service-aanbod"_, _"culinaire beleving"_), passive constructions, anything that sounds like a hotel chain brochure.
- **CTAs and section openers can be playful**: _"Waar kies jij voor?"_, _"Hartig of zoet?"_, _"Welke past bij jouw feest?"_ — echoing the Insta close.
- **Concrete beats vague**: _50 porties_, _€0,45 per km_, _vanaf Hilversum_. Numbers and details are good.

## i18n approach

- Default route tree is Dutch.
- `/en/...` mirrors the Dutch tree with English copy.
- Keep copy in typed string maps per locale (e.g. `src/lib/i18n/nl.ts` / `en.ts`) rather than reaching for a heavy i18n lib for a single-page site.
- Every user-facing string must exist in both locales before merging.

## Contact form

- Server endpoint inside SvelteKit (`+server.ts`) that takes the form payload and sends email.
- Postmark is preferred for deliverability; raw SMTP is acceptable as a fallback. Pick one — do not implement both.
- Secrets via `.env` (`POSTMARK_TOKEN` etc.) — never commit them.
- Honeypot + simple rate limit are sufficient anti-spam for now; no captcha.

---

## Svelte MCP server

This project has the official Svelte MCP server attached. Use it whenever you write or modify Svelte code.

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

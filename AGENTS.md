# AGENTS.md

Cineplexx Vienna showtime browser. SvelteKit + Svelte 5 + Tailwind 4 + shadcn-svelte, deployed as a Cloudflare Worker. Solo side project — see `README.md` for the pitch and full script list.

## Commands

```sh
pnpm install
pnpm dev            # dev server
pnpm check          # wrangler types + svelte-check — run before considering a task done
pnpm lint           # prettier --check + eslint
pnpm format         # prettier --write
pnpm build          # production build
pnpm preview        # build, then wrangler dev
pnpm deploy         # build and deploy to Cloudflare Workers — never run without being asked
```

No test framework is configured (no vitest/jest/playwright, no `*.test.ts` files). `pnpm check` and `pnpm lint` are the only verification available — run both after changes.

## Structure

- `src/routes/` — pages (`+page.svelte` home schedule, `cinemas/`, `cinemas/[slug]/`, `movies/`, `movies/[id]/`) plus the one API route `api/movies/+server.ts`.
- `src/lib/components/` — feature components; `src/lib/components/ui/` — shadcn-svelte primitives, each with an `index.ts` barrel (regenerate via `components.json` config, don't hand-edit primitives if avoidable).
- `src/lib/models/` — shared interfaces/types, one per file, grouped by domain (`movie/`, `cinema/`, `filter/`, `api/`); `index.ts` barrel re-exports all of them.
- `src/lib/utils/` — `filters.ts`, `sessions.ts`, `slug.ts`, `urlState.ts`. Small, single-purpose, JSDoc'd where reused across components.
- `src/lib/data/cinemas.ts` — the `cinemas` list (the four Vienna locations with showtime data).
- `src/lib/data/cinemaLocations.ts` — static location data (screens/seats) for all cinemas, including ones without showtimes.

## Cineplexx API integration

`src/routes/api/movies/+server.ts` calls `https://app.cineplexx.at/api/v1/cinemasweb/{cinemaId}/movies?date=YYYY-MM-DD` per cinema in parallel (`Promise.all`), wrapped in `fetchWithTimeout`/`retryFetch` (2 retries, 8s timeout, exponential backoff). Raw `RawMovie[]` maps to `TrimmedMovie[]` via `mapToTrimmedMovies`, which also computes `isOv`/`isImax` flags. Response is cached with `Cache-Control: public, max-age=3600`.

## OV/OMU/IMAX detection

Lives in `mapToTrimmedMovies` (`src/routes/api/movies/+server.ts`, ~lines 9-47):
- Session `isOv`: technology tag matches "OV"/"OMU" (case-insensitive), or `screenName` includes "ov"/"omu"/"englisch".
- Movie `isOv`: any session is OV, or title/`titleOriginalCalculated` contains "(OV)"/" OV"/"(OMU)"/" OMU".
- `isImax`: any session's technologies include exact "IMAX", or `screenName` includes "IMAX".

This is string/substring matching against whatever Cineplexx's screen names happen to contain — it's inherently fragile if they rename a screen. Related logic is reused in `src/lib/utils/sessions.ts` (`getCleanTech`, `TECH_TARGETS`) and `src/lib/utils/filters.ts` (`sessionMatchesFilters`). If you touch one, check the other two for consistency.

## State

Svelte 5 runes (`$state`/`$derived`/`$effect`) directly in components — no store library. Filter/date/view state is URL-driven via `src/lib/utils/urlState.ts` (`parseFilters`/`buildFilterParams`) so filters stay shareable/bookmarkable; keep new filter state flowing through there rather than adding local-only state.

## Conventions

- Full TypeScript. Tabs, single quotes, no trailing commas, printWidth 100 (`.prettierrc`), `prettier-plugin-svelte` + `prettier-plugin-tailwindcss` for class sorting.
- ESLint flat config (`eslint.config.js`).
- Cloudflare: `wrangler.jsonc`, `@sveltejs/adapter-cloudflare`, `nodejs_compat`. Don't hand-edit `.svelte-kit/` output.

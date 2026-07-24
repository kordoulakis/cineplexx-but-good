# 🎬 Cineplexx, but good

> ⚠️ This is a vibe coded side project. No architecture diagrams were drawn, no roadmap was written. I just got fed up with Cineplexx's website and fixed it myself.

Vienna's official Cineplexx site makes it way too hard to answer a simple question: "is this movie showing in English tonight?" You end up clicking into every cinema separately, squinting at screen names to guess if something's OV or dubbed. So I built my own showtime browser that just answers that question up front.

## What it does

Pulls live showtimes from Cineplexx's own API for four Vienna cinemas and puts them all in one place:

- **Multi-cinema schedule.** Donauzentrum, Apollo, Millennium City, and Westfield SCS, all in one list, filter by cinema if you only care about one
- **OV / OMU detection.** I flag original-version and OMU screenings automatically, no more decoding weird screen names
- **IMAX detection.** Spot IMAX showings without digging
- **Date picker.** Jump to any day
- **Search.** Find a movie by title
- **Shareable URLs.** Your filters, date, and view get saved in the URL, so a link is an actual link, not just "go set it up yourself"
- **Light/dark theme.** Because obviously

## Tech stack

- [SvelteKit](https://svelte.dev/docs/kit) + [Svelte 5](https://svelte.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/) with [shadcn-svelte](https://www.shadcn-svelte.com/) / [bits-ui](https://bits-ui.com/) components
- [Lucide](https://lucide.dev/) icons
- Deployed as a [Cloudflare Worker](https://developers.cloudflare.com/workers/) via `wrangler`

## Getting started

This project uses [pnpm](https://pnpm.io/).

```sh
pnpm install
pnpm dev
```

Then open whatever URL shows up in your terminal.

### Other scripts

```sh
pnpm build      # production build
pnpm preview    # build, then preview via wrangler dev
pnpm check      # type-check with svelte-check
pnpm lint       # prettier + eslint
pnpm format     # prettier --write
pnpm deploy     # build and deploy to Cloudflare Workers
```

## License

Licensed under the [Apache License 2.0](./LICENSE).

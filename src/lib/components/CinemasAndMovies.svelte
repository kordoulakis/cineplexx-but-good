<script lang="ts">
	import type { TrimmedMovie, FetchResult } from '../types/types.ts';
	import { cinemas } from '$lib/types/types';
	import { getCinemaBySlug } from '$lib/data/cinemaLocations';
	import MovieCard from '$lib/components/MovieCard.svelte';
	import FilterControls from '$lib/components/FilterControls.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getCleanTech, formatTime } from '$lib/utils/sessions';
	import { sessionMatchesFilters, matchesQuery } from '$lib/utils/filters';
	import { parseFilters, buildFilterParams, type ViewMode } from '$lib/utils/urlState';

	let {
		selectedDate = $bindable(new Date().toISOString().split('T')[0]),
		viewMode = $bindable('schedule')
	}: { selectedDate?: string; viewMode?: ViewMode } = $props();

	const todayStr = new Date().toISOString().split('T')[0];

	// Seed filters from the URL on load (URL wins so shared links restore exactly).
	const urlFilters = parseFilters(page.url.searchParams);

	let schedules = $state<Record<string, FetchResult<TrimmedMovie[]>>>({});
	let loading = $state(true);
	let componentError = $state<string | null>(null);

	let selectedTechs = $state<string[]>(urlFilters.techs ?? []);
	let showOnlyOv = $state(urlFilters.showOnlyOv ?? true);
	let searchQuery = $state(urlFilters.query ?? '');

	const allCinemaKeys = cinemas.map((c) => c.key);

	function loadSelectedCinemas(): string[] {
		if (!browser) return allCinemaKeys;
		try {
			const stored = localStorage.getItem('selectedCinemas');
			if (stored) {
				const parsed = JSON.parse(stored);
				if (
					Array.isArray(parsed) &&
					parsed.length > 0 &&
					parsed.every((k) => allCinemaKeys.includes(k))
				) {
					return parsed;
				}
			}
		} catch {}
		return allCinemaKeys;
	}

	// URL param wins; otherwise fall back to the remembered localStorage selection.
	let selectedCinemas = $state<string[]>(urlFilters.cinemas ?? loadSelectedCinemas());

	$effect(() => {
		localStorage.setItem('selectedCinemas', JSON.stringify(selectedCinemas));
	});

	// Mirror the full filter state into the URL (only non-defaults) so the view is
	// shareable, bookmarkable, and survives reload.
	$effect(() => {
		if (!browser) return;
		const params = buildFilterParams(
			{
				date: selectedDate,
				cinemas: selectedCinemas,
				techs: selectedTechs,
				showOnlyOv,
				query: searchQuery,
				view: viewMode
			},
			todayStr
		);
		const next = params.toString();
		if (next !== page.url.searchParams.toString()) {
			goto(next ? `?${next}` : page.url.pathname, {
				replaceState: true,
				keepFocus: true,
				noScroll: true
			});
		}
	});

	function computeFiltered(sched: Record<string, FetchResult<TrimmedMovie[]>>) {
		const query = searchQuery.trim().toLowerCase();
		return Object.entries(sched)
			.filter(([cinemaKey]) => selectedCinemas.includes(cinemaKey))
			.map(([cinemaKey, result]) => {
				const movies = result.ok
					? result.data
							.map((movie) => ({
								...movie,
								filteredSessions: movie.sessions.filter((s) =>
									sessionMatchesFilters(s, { showOnlyOv, selectedTechs })
								)
							}))
							.filter((movie) => movie.filteredSessions.length > 0 && matchesQuery(movie, query))
					: [];
				return { cinemaKey, result, movies };
			});
	}

	const filteredSchedules = $derived(computeFiltered(schedules));
	const hasMatches = $derived(filteredSchedules.some((s) => s.movies.length > 0));

	let searchingNextDate = $state(false);
	let noFutureMatch = $state(false);

	// Clear a stale "no upcoming date" message whenever the query changes.
	const querySignature = $derived(
		JSON.stringify([selectedDate, selectedTechs, showOnlyOv, searchQuery.trim(), selectedCinemas])
	);
	$effect(() => {
		if (querySignature) noFutureMatch = false;
	});

	async function goToNextAvailableDate() {
		searchingNextDate = true;
		noFutureMatch = false;
		const HORIZON_DAYS = 60;
		const probe = new Date(selectedDate);
		for (let i = 0; i < HORIZON_DAYS; i++) {
			probe.setDate(probe.getDate() + 1);
			const dateStr = probe.toISOString().split('T')[0];
			try {
				const res = await fetch(`/api/movies?date=${dateStr}`);
				if (!res.ok) continue;
				const sched = (await res.json()) as Record<string, FetchResult<TrimmedMovie[]>>;
				if (computeFiltered(sched).some((s) => s.movies.length > 0)) {
					selectedDate = dateStr;
					searchingNextDate = false;
					return;
				}
			} catch {
				// keep probing subsequent dates
			}
		}
		searchingNextDate = false;
		noFutureMatch = true;
	}

	// --- "Now & Soon" view -------------------------------------------------
	const WINDOW_AHEAD_MS = 6 * 60 * 60 * 1000; // surface sessions up to 6h out
	const WINDOW_BEHIND_MS = 15 * 60 * 1000; // ...plus ones that just started

	let now = $state(Date.now());
	$effect(() => {
		const id = setInterval(() => (now = Date.now()), 60_000);
		return () => clearInterval(id);
	});

	type NowItem = { movie: TrimmedMovie; session: TrimmedMovie['sessions'][number]; t: number };

	function computeNowSessions(
		sched: Record<string, FetchResult<TrimmedMovie[]>>,
		nowMs: number
	): NowItem[] {
		const query = searchQuery.trim().toLowerCase();
		const items: NowItem[] = [];
		for (const [cinemaKey, result] of Object.entries(sched)) {
			if (!selectedCinemas.includes(cinemaKey) || !result.ok) continue;
			for (const movie of result.data) {
				if (!matchesQuery(movie, query)) continue;
				for (const session of movie.sessions) {
					if (!sessionMatchesFilters(session, { showOnlyOv, selectedTechs })) continue;
					const t = new Date(session.showtime).getTime();
					if (Number.isNaN(t)) continue;
					if (t >= nowMs - WINDOW_BEHIND_MS && t <= nowMs + WINDOW_AHEAD_MS) {
						items.push({ movie, session, t });
					}
				}
			}
		}
		return items.sort((a, b) => a.t - b.t);
	}

	const nowSessions = $derived(viewMode === 'now' ? computeNowSessions(schedules, now) : []);
	const onNowSessions = $derived(nowSessions.filter((i) => i.t <= now));
	const soonSessions = $derived(nowSessions.filter((i) => i.t > now));

	$effect(() => {
		// In "now" mode we always look at today, regardless of the date picker.
		const dateToFetch = viewMode === 'now' ? todayStr : selectedDate;
		const fetchData = async () => {
			loading = true;
			try {
				const response = await fetch(`/api/movies?date=${dateToFetch}`);
				if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
				schedules = await response.json();
				componentError = null;
			} catch (err) {
				console.error('Component fetch crashed:', err);
				componentError = 'Could not load showtimes. Please try again later.';
			} finally {
				loading = false;
			}
		};

		fetchData();
	});
</script>

{#snippet sessionRow(item: NowItem)}
	{@const techs = getCleanTech(item.session.technologies, item.session.screenName)}
	<a
		href="/movies/{item.movie.slug}?date={todayStr}"
		class="flex items-center gap-3 rounded-lg border border-muted bg-card/60 px-3 py-2.5 transition-all hover:border-primary/40 hover:bg-accent"
	>
		<span class="w-14 shrink-0 font-mono text-lg font-bold tabular-nums"
			>{formatTime(item.session.showtime)}</span
		>
		<span class="min-w-0 flex-1">
			<span class="block truncate font-semibold">{item.movie.title}</span>
			<span class="block truncate text-xs text-muted-foreground"
				>{item.session.cinemaName} · {item.session.screenName}</span
			>
		</span>
		<span class="flex shrink-0 flex-wrap justify-end gap-1">
			{#if item.session.isOv}
				<Badge
					variant="default"
					class="bg-ov px-1.5 py-0 text-[10px] font-black text-ov-foreground uppercase hover:bg-ov/90"
					>OV</Badge
				>
			{/if}
			{#each techs as tech (tech)}
				{#if tech !== 'OV'}
					<Badge
						variant="outline"
						class="border-primary/20 bg-primary/5 px-1.5 py-0 text-[10px] font-black text-primary/80 uppercase"
						>{tech}</Badge
					>
				{/if}
			{/each}
		</span>
	</a>
{/snippet}

<div class="container mx-auto space-y-8 p-4">
	{#if loading}
		<div class="flex min-h-50 items-center justify-center">
			<p class="animate-pulse text-lg">Loading showtimes...</p>
		</div>
	{:else}
		{#if componentError}
			<div
				class="rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-destructive"
			>
				<p class="font-bold">Critical Error</p>
				<p>{componentError}</p>
			</div>
		{/if}

		<div class="mb-8 flex w-full flex-col items-center gap-6">
			<!-- View toggle: full schedule vs. what's on now -->
			<div class="flex items-center gap-1 rounded-full border border-muted-foreground/20 p-1">
				<button
					onclick={() => (viewMode = 'schedule')}
					class="rounded-full px-4 py-1.5 text-sm font-semibold transition-all {viewMode ===
					'schedule'
						? 'bg-primary text-primary-foreground'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					Schedule
				</button>
				<button
					onclick={() => (viewMode = 'now')}
					class="rounded-full px-4 py-1.5 text-sm font-semibold transition-all {viewMode === 'now'
						? 'bg-ov text-ov-foreground'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					Now &amp; Soon
				</button>
			</div>

			<FilterControls bind:selectedCinemas bind:selectedTechs bind:showOnlyOv bind:searchQuery />
		</div>

		{#if viewMode === 'now'}
			<!-- Now & Soon: flat, time-sorted list of imminent showtimes (today only) -->
			<div class="mx-auto w-full max-w-2xl space-y-8">
				{#if nowSessions.length === 0}
					<div class="flex flex-col items-center justify-center gap-2 py-16 text-center">
						<p class="text-lg font-semibold">
							Nothing starting in the next 6 hours at your cinemas.
						</p>
						<p class="text-sm text-muted-foreground">
							Try the <button
								class="underline underline-offset-4 hover:text-primary"
								onclick={() => (viewMode = 'schedule')}>full schedule</button
							>, or loosen your filters.
						</p>
					</div>
				{:else}
					{#if onNowSessions.length > 0}
						<section class="space-y-3">
							<h2
								class="flex items-center gap-2 text-sm font-black tracking-wider text-ov uppercase"
							>
								<span class="inline-block h-2 w-2 animate-pulse rounded-full bg-ov"></span>
								On now
							</h2>
							<div class="flex flex-col gap-2">
								{#each onNowSessions as item (item.session.cinemaId + item.session.showtime + item.movie.slug)}
									{@render sessionRow(item)}
								{/each}
							</div>
						</section>
					{/if}

					{#if soonSessions.length > 0}
						<section class="space-y-3">
							<h2 class="text-sm font-black tracking-wider text-muted-foreground uppercase">
								Starting soon
							</h2>
							<div class="flex flex-col gap-2">
								{#each soonSessions as item (item.session.cinemaId + item.session.showtime + item.movie.slug)}
									{@render sessionRow(item)}
								{/each}
							</div>
						</section>
					{/if}
				{/if}
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-12">
				{#each filteredSchedules as { cinemaKey, result, movies } (cinemaKey)}
					{#if !result.ok}
						<p class="text-muted-foreground italic">
							Could not load {cinemas.find((c) => c.key === cinemaKey)?.name ?? cinemaKey}.
						</p>
					{:else if movies.length > 0}
						{@const cinema = cinemas.find((c) => c.key === cinemaKey)}
						{@const detailCinema = getCinemaBySlug(cinemaKey)}
						{@const cinemaName =
							(result.ok && result.data[0]?.sessions[0]?.cinemaName) || cinema?.name || cinemaKey}
						<section class="flex flex-col gap-6">
							<div
								class="mb-2 flex flex-col items-center justify-between gap-4 border-b-2 border-primary/20 pb-4 sm:flex-row sm:items-end sm:gap-0"
							>
								<h2
									class="text-center text-3xl font-black tracking-tighter text-primary uppercase sm:text-left sm:text-4xl"
								>
									{#if detailCinema}
										<a
											href="/cinemas/{detailCinema.slug}"
											class="underline decoration-primary/30 decoration-2 underline-offset-4 transition-colors hover:text-primary/80 hover:decoration-primary/80"
										>
											{cinemaName}
										</a>
									{:else}
										{cinemaName}
									{/if}
								</h2>

								{#if cinema}
									<Button
										variant="outline"
										size="sm"
										class="group gap-2 border-input shadow-sm transition-all"
										href="https://cineplexx.at/cinemas/{cinema.slug}?date={selectedDate}"
										target="_blank"
									>
										<div
											class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cineplexx text-[10px] font-black tracking-tighter text-white"
										>
											C
										</div>
										<span class="font-bold">See on cineplexx</span>
										<ExternalLinkIcon class="h-3.5 w-3.5 opacity-70" />
									</Button>
								{/if}
							</div>

							<div
								class="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
							>
								{#each movies as movie (movie.title)}
									<MovieCard
										{movie}
										sessionsToDisplay={movie.filteredSessions}
										date={selectedDate}
									/>
								{/each}
							</div>
						</section>
					{/if}
				{/each}
			</div>

			{#if !hasMatches}
				<div class="flex flex-col items-center justify-center gap-4 py-16 text-center">
					{#if noFutureMatch}
						<p class="text-lg font-semibold">
							No upcoming date has anything matching these filters.
						</p>
						<p class="text-sm text-muted-foreground">
							Try removing a filter or selecting more cinemas.
						</p>
					{:else}
						<p class="text-lg font-semibold">Nothing matches these filters on this date.</p>
						<Button onclick={goToNextAvailableDate} disabled={searchingNextDate} class="gap-2">
							{searchingNextDate ? 'Searching…' : 'Go to next available date'}
						</Button>
					{/if}
				</div>
			{/if}
		{/if}
	{/if}
</div>

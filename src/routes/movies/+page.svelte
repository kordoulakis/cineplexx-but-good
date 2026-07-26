<script lang="ts">
	import type { CinemaSchedules } from '$lib/models/movie/CinemaSchedules';
	import { cinemas } from '$lib/data/cinemas';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import DateSelector from '$lib/components/DateSelector.svelte';
	import FilterControls from '$lib/components/FilterControls.svelte';
	import MovieCard from '$lib/components/MovieCard.svelte';
	import { Button } from '$lib/components/ui/button';
	import ClapperboardIcon from '@lucide/svelte/icons/clapperboard';
	import LayoutGridIcon from '@lucide/svelte/icons/layout-grid';
	import { parseFilters, buildFilterParams } from '$lib/utils/urlState';
	import { sessionMatchesFilters, matchesQuery, mergeMoviesBySlug } from '$lib/utils/filters';
	import { SvelteDate } from 'svelte/reactivity';

	const todayStr = new Date().toISOString().split('T')[0];

	// Seed filters from the URL (shared links restore exactly).
	const urlFilters = parseFilters(page.url.searchParams);

	let selectedDate = $state(urlFilters.date ?? todayStr);
	let selectedTechs = $state<string[]>(urlFilters.techs ?? []);
	let showOnlyOv = $state(urlFilters.showOnlyOv ?? true);
	let searchQuery = $state(urlFilters.query ?? '');

	const allCinemaKeys = cinemas.map((c) => c.key);

	// Shared with the homepage selector via the same localStorage key.
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

	let selectedCinemas = $state<string[]>(urlFilters.cinemas ?? loadSelectedCinemas());

	$effect(() => {
		localStorage.setItem('selectedCinemas', JSON.stringify(selectedCinemas));
	});

	// Mirror filter state into the URL (only non-defaults) so the view is shareable.
	$effect(() => {
		if (!browser) return;
		const params = buildFilterParams(
			{
				date: selectedDate,
				cinemas: selectedCinemas,
				techs: selectedTechs,
				showOnlyOv,
				query: searchQuery,
				view: 'schedule'
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

	let schedules = $state<CinemaSchedules>({});
	let loading = $state(true);
	let componentError = $state<string | null>(null);

	$effect(() => {
		const dateToFetch = selectedDate;
		const fetchData = async () => {
			loading = true;
			try {
				const response = await fetch(`/api/movies?date=${dateToFetch}`);
				if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
				schedules = await response.json();
				componentError = null;
			} catch (err) {
				console.error('Movies page fetch crashed:', err);
				componentError = 'Could not load showtimes. Please try again later.';
			} finally {
				loading = false;
			}
		};
		fetchData();
	});

	// Merge every selected cinema into one deduped list, then apply the active
	// session/search filters. Each surviving movie keeps the sessions that passed.
	function computeMovies(sched: CinemaSchedules) {
		const query = searchQuery.trim().toLowerCase();
		return mergeMoviesBySlug(sched, selectedCinemas)
			.map((movie) => ({
				...movie,
				filteredSessions: movie.sessions.filter((s) =>
					sessionMatchesFilters(s, { showOnlyOv, selectedTechs })
				)
			}))
			.filter((movie) => movie.filteredSessions.length > 0 && matchesQuery(movie, query));
	}

	const movies = $derived(computeMovies(schedules));

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
		const HORIZON_DAYS = 30;
		const probe = new SvelteDate(selectedDate);
		for (let i = 0; i < HORIZON_DAYS; i++) {
			probe.setDate(probe.getDate() + 1);
			const dateStr = probe.toISOString().split('T')[0];
			try {
				const res = await fetch(`/api/movies?date=${dateStr}`);
				if (!res.ok) continue;
				const schedule = (await res.json()) as CinemaSchedules;
				if (computeMovies(schedule).length > 0) {
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
</script>

<svelte:head>
	<title>All movies · Cineplexx but good</title>
</svelte:head>

<div class="flex w-full flex-1 flex-col items-center">
	<div class="flex w-full max-w-7xl flex-col items-center px-4 py-8">
		<header
			class="mb-12 flex w-full flex-col items-center justify-between gap-6 border-b-4 border-primary pb-4 md:flex-row md:items-end md:gap-0"
		>
			<a
				href="/"
				aria-label="Cineplexx but good — home"
				class="flex flex-col items-center gap-2 align-bottom transition-opacity hover:opacity-80 md:flex-row md:items-end"
			>
				<h1
					class="text-center text-5xl leading-none font-black tracking-tighter uppercase sm:text-6xl md:text-left"
				>
					Cineplexx
				</h1>
				<p class="text-sm font-light text-cineplexx uppercase sm:text-base">but good</p>
			</a>

			<div class="flex items-center gap-3">
				<Button href="/" variant="outline" size="sm" class="gap-2 border-input shadow-sm">
					<LayoutGridIcon class="h-4 w-4 text-cineplexx" />
					<span class="font-bold">By cinema</span>
				</Button>
				<Button href="/cinemas" variant="outline" size="sm" class="gap-2 border-input shadow-sm">
					<ClapperboardIcon class="h-4 w-4 text-cineplexx" />
					<span class="font-bold">Cinemas</span>
				</Button>
				<ThemeSwitcher />
			</div>
		</header>

		<main class="flex w-full flex-col items-center">
			<div class="flex flex-col items-center gap-1 text-center">
				<h2 class="text-2xl font-black tracking-tighter uppercase sm:text-3xl">All movies</h2>
				<p class="text-sm text-muted-foreground">
					Every film playing across your cinemas, with showtimes labelled by location.
				</p>
			</div>

			<div class="mt-6 flex w-full justify-center">
				<DateSelector bind:value={selectedDate} />
			</div>

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
						<FilterControls
							bind:selectedCinemas
							bind:selectedTechs
							bind:showOnlyOv
							bind:searchQuery
						/>
					</div>

					{#if movies.length > 0}
						<div
							class="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
						>
							{#each movies as movie (movie.slug)}
								<MovieCard
									{movie}
									sessionsToDisplay={movie.filteredSessions}
									date={selectedDate}
									showCinema
								/>
							{/each}
						</div>
					{:else if !componentError}
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
			</div>
		</main>
	</div>
</div>

<script lang="ts">
	import type { TrimmedMovie, FetchResult } from '../types/types.ts';
	import { cinemas } from '$lib/types/types';
	import MovieCard from '$lib/components/MovieCard.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';

	let { selectedDate = new Date().toISOString().split('T')[0] } = $props();

	let schedules = $state<Record<string, FetchResult<TrimmedMovie[]>>>({});
	let loading = $state(true);
	let componentError = $state<string | null>(null);

	const availableTechs = ['IMAX', '4DX', '3D', '2D', 'ATMOS', 'VIP', 'DBOX'];
	let selectedTechs = $state<string[]>([]);
	let showOnlyOv = $state(true);
	let searchQuery = $state('');

	const toggleTech = (tech: string) => {
		if (selectedTechs.includes(tech)) {
			selectedTechs = selectedTechs.filter((t) => t !== tech);
		} else {
			selectedTechs = [...selectedTechs, tech];
		}
	};

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
				console.error('Component fetch crashed:', err);
				componentError = err instanceof Error ? err.message : String(err);
			} finally {
				loading = false;
			}
		};

		fetchData();
	});
</script>

<div class="container mx-auto p-4 space-y-8">
	{#if loading}
		<div class="flex items-center justify-center min-h-50">
			<p class="text-lg animate-pulse">Loading showtimes...</p>
		</div>
	{:else}
		{#if componentError}
			<div class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
				<p class="font-bold">Critical Error</p>
				<p>{componentError}</p>
			</div>
		{/if}

		<div class="flex flex-col items-center gap-6 mb-8 w-full">
			<!-- Search Bar -->
			<div class="relative w-full max-w-md">
				<div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
				</div>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search movies..."
					class="w-full bg-background border border-muted-foreground/30 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/60"
				/>
				{#if searchQuery}
					<button aria-label="Clear search"
						onclick={() => searchQuery = ''}
						class="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-primary transition-colors"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
					</button>
				{/if}
			</div>

			<div class="flex flex-wrap gap-2 items-center justify-center">
				<span class="text-sm font-semibold uppercase tracking-wider text-muted-foreground mr-2 w-full text-center sm:w-auto">Filters:</span>

				<button
					onclick={() => showOnlyOv = !showOnlyOv}
					class="transition-all"
				>
					<Badge
						variant={showOnlyOv ? "default" : "outline"}
						class="px-3 py-1 cursor-pointer hover:bg-emerald-600 hover:text-white {showOnlyOv ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-background text-muted-foreground border-muted-foreground/30'}"
					>
						OV Only
					</Badge>
				</button>

				{#each availableTechs as tech (tech)}
					<button
						onclick={() => toggleTech(tech)}
						class="transition-all"
					>
						<Badge
							variant={selectedTechs.includes(tech) ? "default" : "outline"}
							class="px-3 py-1 cursor-pointer hover:bg-primary hover:text-primary-foreground {selectedTechs.includes(tech) ? '' : 'bg-background text-muted-foreground border-muted-foreground/30'}"
						>
							{tech}
						</Badge>
					</button>
				{/each}

				{#if selectedTechs.length > 0 || !showOnlyOv || searchQuery}
					<button
						onclick={() => { selectedTechs = []; showOnlyOv = true; searchQuery = ''; }}
						class="text-xs text-muted-foreground hover:text-primary underline underline-offset-4 ml-2"
					>
						Clear all
					</button>
				{/if}
			</div>
		</div>

		<div class="grid grid-cols-1 gap-12">
			{#each Object.entries(schedules) as [cinemaKey, result] (cinemaKey)}
				{@const filteredData = result.ok ? result.data.map(movie => {
					const filteredSessions = movie.sessions.filter(session => {
						// 1. Optional OV filter
						if (showOnlyOv && !session.isOv) return false;

						// 2. Applied Tech Filters
						if (selectedTechs.length > 0) {
							const sessionTechs = session.technologies.flat().map(t => t.toUpperCase());
							const matchesTech = selectedTechs.some(tech => 
								sessionTechs.includes(tech) || (tech === 'IMAX' && session.screenName.toUpperCase().includes('IMAX'))
							);
							if (!matchesTech) return false;
						}

						return true;
					});

					return { ...movie, filteredSessions };
				}).filter(movie => {
					// 0. Search Filter (Title)
					if (searchQuery && !movie.title.toLowerCase().includes(searchQuery.toLowerCase())) {
						return false;
					}

					// Only keep movie if it has sessions matching the filters
					return movie.filteredSessions.length > 0;
				}) : []}


				{#if filteredData.length > 0}
				{@const cinema = cinemas.find(c => c.key === cinemaKey)}
				<section class="flex flex-col gap-6">
					<div class="border-b-2 border-primary/20 pb-4 mb-2 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 sm:gap-0">
						<h2 class="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-primary text-center sm:text-left">
							{(result.ok && result.data[0]?.sessions[0]?.cinemaName) || cinema?.name || cinemaKey}
						</h2>

						{#if cinema}
							<Button
								variant="outline"
								size="sm"
								class="group gap-2 border-input transition-all shadow-sm"
								href="https://cineplexx.at/cinemas/{cinema.slug}?date={selectedDate}"
								target="_blank"
							>
								<div class="bg-cineplexx text-white rounded-full w-5 h-5 flex items-center justify-center font-black text-[10px] tracking-tighter shrink-0">C</div>
								<span class="font-bold">See on cineplexx</span>
								<ExternalLinkIcon class="w-3.5 h-3.5 opacity-70" />
							</Button>
						{/if}
					</div>

					{#if result.ok}
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
							{#each filteredData as movie (movie.title)}
								<MovieCard {movie} sessionsToDisplay={movie.filteredSessions} />
							{/each}
						</div>
					{:else}
						<p class="text-muted-foreground italic">Failed to load movies: {result.error}</p>
					{/if}
				</section>

				{/if}

			{/each}
		</div>
	{/if}
</div>
<script lang="ts">
	import { getMoviesForAllCinemas } from '$lib/api';
	import type { TrimmedMovie, FetchResult } from '../types/types.ts';
	import MovieCard from '$lib/components/MovieCard.svelte';
	import { Badge } from '$lib/components/ui/badge';

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
		// Track selectedDate at the top level of the effect
		const dateToFetch = selectedDate;
		const fetchData = async () => {
			loading = true;
			try {
				schedules = await getMoviesForAllCinemas(dateToFetch);
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

		<div class="flex flex-col gap-6 mb-8">
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

			<div class="flex flex-wrap gap-2 items-center">
				<span class="text-sm font-semibold uppercase tracking-wider text-muted-foreground mr-2">Filters:</span>
				
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
				{@const filteredMovies = result.ok ? result.data.filter(movie => {
					// 0. Search Filter (Title)
					if (searchQuery && !movie.title.toLowerCase().includes(searchQuery.toLowerCase())) {
						return false;
					}

					// 1. Optional OV filter
					if (showOnlyOv && !movie.sessions.some(s => s.isOv))
						return false;

					// 2. Applied Tech Filters
					if (selectedTechs.length === 0) return true;

					return movie.sessions.some(session => {
						// If we're showing ONLY OV, this session must be OV to count towards tech match
						if (showOnlyOv && !session.isOv) return false;

						const sessionTechs = session.technologies.flat().map(t => t.toUpperCase());
						return selectedTechs.some(tech => sessionTechs.includes(tech));
					});
				}) : []}

				{#if !result.ok || filteredMovies.length > 0}
				<section class="flex flex-col gap-6">
					<div class="border-b-2 border-primary/20 pb-4 mb-2">
						<h2 class="text-4xl font-black uppercase tracking-tighter text-primary">
							{(result.ok && result.data[0]?.sessions[0]?.cinemaName) || cinemaKey}
						</h2>
					</div>

					{#if result.ok}
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
							{#each filteredMovies as movie (movie)}
								<MovieCard {movie} />
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
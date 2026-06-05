<script lang="ts">
	import { getMoviesForAllCinemas } from '$lib/api';
	import type { TrimmedMovie, FetchResult } from '../types/types.ts';
	import MovieCard from '$lib/components/MovieCard.svelte';

	let { selectedDate = new Date().toISOString().split('T')[0] } = $props();
	let schedules = $state<Record<string, FetchResult<TrimmedMovie[]>>>({});
	let loading = $state(true);
	let componentError = $state<string | null>(null);

	$effect(() => {
		const fetchData = async () => {
			loading = true;
			try {
				schedules = await getMoviesForAllCinemas(selectedDate);
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
		<div class="flex items-center justify-center min-h-[200px]">
			<p class="text-lg animate-pulse">Loading showtimes...</p>
		</div>
	{:else}
		{#if componentError}
			<div class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
				<p class="font-bold">Critical Error</p>
				<p>{componentError}</p>
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-12">
			{#each Object.entries(schedules) as [cinemaKey, result] (cinemaKey)}
				{@const moviesWithOVSessions = result.ok ? result.data.filter(movie => 
					movie.sessions.some(session => 
						session.technologies.flat().some(t => t.toUpperCase() === 'OV')
					)
				) : []}

				{#if !result.ok || moviesWithOVSessions.length > 0}
				<section class="flex flex-col gap-6">
					<div class="border-b-2 border-primary/20 pb-4 mb-2">
						<h2 class="text-4xl font-black uppercase tracking-tighter text-primary">
							{(result.ok && result.data[0]?.sessions[0]?.cinemaName) || cinemaKey}
						</h2>
					</div>

					{#if result.ok}
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
							{#each moviesWithOVSessions as movie (movie)}
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
<script lang="ts">
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import CinemasAndMovies from '$lib/components/CinemasAndMovies.svelte';
	import DateSelector from '$lib/components/DateSelector.svelte';
	import { Button } from '$lib/components/ui/button';
	import ClapperboardIcon from '@lucide/svelte/icons/clapperboard';
	import FilmIcon from '@lucide/svelte/icons/film';
	import { page } from '$app/state';
	import { parseFilters, type ViewMode } from '$lib/utils/urlState';

	const today = new Date().toISOString().split('T')[0];
	const initialFilters = parseFilters(page.url.searchParams);
	let selectedDate = $state(initialFilters.date ?? today);
	let viewMode = $state<ViewMode>(initialFilters.view ?? 'schedule');
</script>

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
				<Button href="/movies" variant="outline" size="sm" class="gap-2 border-input shadow-sm">
					<FilmIcon class="h-4 w-4 text-cineplexx" />
					<span class="font-bold">All movies</span>
				</Button>
				<Button href="/cinemas" variant="outline" size="sm" class="gap-2 border-input shadow-sm">
					<ClapperboardIcon class="h-4 w-4 text-cineplexx" />
					<span class="font-bold">Cinemas</span>
				</Button>
				<ThemeSwitcher />
			</div>
		</header>

		<main class="flex w-full flex-col items-center">
			{#if viewMode !== 'now'}
				<div class="mt-4 flex w-full justify-center">
					<DateSelector bind:value={selectedDate} />
				</div>
			{/if}
			<CinemasAndMovies bind:selectedDate bind:viewMode />
		</main>
	</div>
</div>

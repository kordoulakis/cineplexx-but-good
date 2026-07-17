<script lang="ts">
	import { cinemaLocations, type CinemaLocation } from '$lib/data/cinemaLocations';
	import CinemaCard from '$lib/components/CinemaCard.svelte';
	import { Button } from '$lib/components/ui/button';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';

	const cinemaStats = (cinema: CinemaLocation) => {
		const screens = cinema.total_saals ?? cinema.saals.length;
		const seats = cinema.saals.reduce((sum, s) => sum + s.seats, 0);
		const biggestScreen = cinema.saals.reduce<number | null>(
			(max, s) => (s.screen_m2 != null && (max == null || s.screen_m2 > max) ? s.screen_m2 : max),
			null
		);
		return { screens, seats, biggestScreen };
	};

	type SortKey = 'screen' | 'seats' | 'screens' | 'name';
	const sortOptions: { value: SortKey; label: string }[] = [
		{ value: 'screen', label: 'Max screen size' },
		{ value: 'seats', label: 'Total seats' },
		{ value: 'screens', label: 'Number of screens' },
		{ value: 'name', label: 'Name (A–Z)' }
	];
	let sortBy = $state<SortKey>('screen');

	const sortedCinemas = $derived(
		[...cinemaLocations].sort((a, b) => {
			const sa = cinemaStats(a);
			const sb = cinemaStats(b);
			switch (sortBy) {
				case 'seats':
					return sb.seats - sa.seats;
				case 'screens':
					return sb.screens - sa.screens;
				case 'name':
					return a.name.localeCompare(b.name);
				case 'screen':
				default:
					// Descending by biggest screen; cinemas without a known size go last.
					return (sb.biggestScreen ?? -1) - (sa.biggestScreen ?? -1);
			}
		})
	);

	// Track which cinemas are expanded; default to all collapsed for a clean overview.
	let expanded = $state<Record<string, boolean>>({});
	const toggle = (slug: string) => (expanded[slug] = !expanded[slug]);
</script>

<svelte:head>
	<title>Cinemas · Cineplexx but good</title>
	<meta
		name="description"
		content="All Cineplexx cinemas in Vienna with screens, seats and screen technology."
	/>
</svelte:head>

<div class="flex w-full flex-1 flex-col items-center">
	<div class="flex w-full max-w-7xl flex-col items-center px-4 py-8">
		<header
			class="mb-12 flex w-full flex-col items-center justify-between gap-6 border-b-4 border-primary pb-4 md:flex-row md:items-end md:gap-0"
		>
			<div class="flex flex-col items-center gap-2 md:items-start">
				<Button
					href="/"
					variant="ghost"
					size="sm"
					class="-ml-2 gap-1.5 self-center text-muted-foreground hover:text-primary md:self-start"
				>
					<ArrowLeftIcon class="h-4 w-4" />
					Back to showtimes
				</Button>
				<div class="flex flex-col items-center gap-2 align-bottom md:flex-row md:items-end">
					<h1
						class="text-center text-5xl leading-none font-black tracking-tighter uppercase sm:text-6xl md:text-left"
					>
						Cinemas
					</h1>
					<p class="text-sm font-light text-cineplexx uppercase sm:text-base">in Vienna</p>
				</div>
			</div>

			<ThemeSwitcher />
		</header>

		<div class="mb-6 flex w-full items-center justify-end gap-2">
			<label
				for="sort-cinemas"
				class="text-sm font-semibold tracking-wider text-muted-foreground uppercase"
			>
				Order by
			</label>
			<select
				id="sort-cinemas"
				bind:value={sortBy}
				class="rounded-full border border-muted-foreground/30 bg-background py-2 pr-8 pl-4 text-sm font-semibold transition-all focus:ring-2 focus:ring-primary/50 focus:outline-none"
			>
				{#each sortOptions as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>

		<main class="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-2">
			{#each sortedCinemas as cinema (cinema.slug)}
				<CinemaCard
					{cinema}
					titleOpensModal={true}
					expanded={expanded[cinema.slug]}
					onToggle={() => toggle(cinema.slug)}
				/>
			{/each}
		</main>
	</div>
</div>

<script lang="ts">
	import { cinemaLocations, type CinemaLocation, type Saal } from '$lib/data/cinemaLocations';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import ArmchairIcon from '@lucide/svelte/icons/armchair';
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import MaximizeIcon from '@lucide/svelte/icons/maximize';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

	const cinemaStats = (cinema: CinemaLocation) => {
		const screens = cinema.total_saals ?? cinema.saals.length;
		const seats = cinema.saals.reduce((sum, s) => sum + s.seats, 0);
		const biggestScreen = cinema.saals.reduce<number | null>(
			(max, s) => (s.screen_m2 != null && (max == null || s.screen_m2 > max) ? s.screen_m2 : max),
			null
		);
		return { screens, seats, biggestScreen };
	};

	const saalLabel = (saal: Saal) => (typeof saal.id === 'number' ? `Saal ${saal.id}` : saal.id);

	const mapsUrl = (address: string) =>
		`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

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
	const toggle = (name: string) => (expanded[name] = !expanded[name]);
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
			{#each sortedCinemas as cinema (cinema.name)}
				{@const stats = cinemaStats(cinema)}
				<Card.Root class="flex flex-col border-muted">
					<Card.Header class="space-y-3">
						<div class="flex items-start justify-between gap-3">
							<Card.Title
								class="text-2xl leading-tight font-black tracking-tighter text-primary uppercase"
							>
								{cinema.name}
							</Card.Title>
							{#if cinema.notes}
								<Badge
									variant="outline"
									class="shrink-0 border-amber-500/30 bg-amber-500/10 text-[10px] font-medium text-amber-600 dark:text-amber-400"
								>
									{cinema.notes}
								</Badge>
							{/if}
						</div>

						<a
							href={mapsUrl(cinema.address)}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
						>
							<MapPinIcon class="h-4 w-4 shrink-0 text-cineplexx" />
							<span>{cinema.address}</span>
							<ExternalLinkIcon class="h-3 w-3 opacity-60" />
						</a>
					</Card.Header>

					<Card.Content class="flex flex-grow flex-col gap-4">
						<!-- Summary stats -->
						<div class="grid grid-cols-3 gap-2">
							<div
								class="flex flex-col items-center justify-center rounded-lg bg-muted/50 px-2 py-3"
							>
								<MonitorIcon class="mb-1 h-4 w-4 text-muted-foreground" />
								<span class="text-xl font-black tabular-nums">{stats.screens}</span>
								<span class="text-[10px] tracking-wider text-muted-foreground uppercase"
									>Screens</span
								>
							</div>
							<div
								class="flex flex-col items-center justify-center rounded-lg bg-muted/50 px-2 py-3"
							>
								<ArmchairIcon class="mb-1 h-4 w-4 text-muted-foreground" />
								<span class="text-xl font-black tabular-nums">{stats.seats.toLocaleString()}</span>
								<span class="text-[10px] tracking-wider text-muted-foreground uppercase">Seats</span
								>
							</div>
							<div
								class="flex flex-col items-center justify-center rounded-lg bg-muted/50 px-2 py-3"
							>
								<MaximizeIcon class="mb-1 h-4 w-4 text-muted-foreground" />
								<span class="text-xl font-black tabular-nums"
									>{stats.biggestScreen ? `${stats.biggestScreen}` : '—'}</span
								>
								<span class="text-[10px] tracking-wider text-muted-foreground uppercase"
									>Max m²</span
								>
							</div>
						</div>

						<!-- Halls toggle -->
						<button
							onclick={() => toggle(cinema.name)}
							class="mt-auto flex items-center justify-between gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase transition-colors hover:text-primary"
						>
							<span>{cinema.saals.length} halls</span>
							<span class="flex items-center gap-1">
								<span>{expanded[cinema.name] ? 'Hide' : 'Show'}</span>
								<ChevronDownIcon
									class="h-4 w-4 transition-transform duration-200 {expanded[cinema.name]
										? 'rotate-180'
										: ''}"
								/>
							</span>
						</button>

						{#if expanded[cinema.name]}
							<div class="flex flex-col gap-2 border-t border-muted pt-3">
								{#each cinema.saals as saal (saal.id)}
									<div class="flex flex-col gap-1.5 rounded-md bg-muted/30 p-3">
										<div class="flex flex-wrap items-center justify-between gap-2">
											<span class="text-sm font-bold">{saalLabel(saal)}</span>
											<div
												class="flex items-center gap-3 text-xs text-muted-foreground tabular-nums"
											>
												<span class="flex items-center gap-1">
													<ArmchairIcon class="h-3.5 w-3.5" />
													{saal.seats}
												</span>
												{#if saal.rows}
													<span>{saal.rows} rows</span>
												{/if}
												{#if saal.screen_m2 != null}
													<span class="flex items-center gap-1">
														<MaximizeIcon class="h-3.5 w-3.5" />
														{saal.screen_m2} m²
													</span>
												{/if}
											</div>
										</div>
										{#if saal.special.length > 0}
											<div class="flex flex-wrap gap-1">
												{#each saal.special as tech (tech)}
													<Badge
														variant="outline"
														class="border-primary/20 bg-primary/5 px-1.5 py-0 text-[10px] font-semibold tracking-wide text-primary/80"
													>
														{tech}
													</Badge>
												{/each}
											</div>
										{/if}
									</div>
								{/each}
								{#if cinema.total_saals && cinema.total_saals > cinema.saals.length}
									<p class="pt-1 text-center text-xs text-muted-foreground italic">
										+ {cinema.total_saals - cinema.saals.length} more (data unavailable)
									</p>
								{/if}
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			{/each}
		</main>
	</div>
</div>

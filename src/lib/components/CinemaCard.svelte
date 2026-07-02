<script lang="ts">
	import { type CinemaLocation, type Saal } from '$lib/data/cinemaLocations';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import ArmchairIcon from '@lucide/svelte/icons/armchair';
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import MaximizeIcon from '@lucide/svelte/icons/maximize';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

	let {
		cinema,
		expanded = false,
		titleHref = undefined,
		onToggle = undefined
	}: {
		cinema: CinemaLocation;
		/** Whether the halls list is shown. On the detail page this is always true. */
		expanded?: boolean;
		/** When set, the title becomes a link to this URL (used on the overview grid). */
		titleHref?: string;
		/** When set, a collapse/expand toggle is rendered; otherwise halls follow `expanded`. */
		onToggle?: () => void;
	} = $props();

	const stats = $derived.by(() => {
		const screens = cinema.total_saals ?? cinema.saals.length;
		const seats = cinema.saals.reduce((sum, s) => sum + s.seats, 0);
		const biggestScreen = cinema.saals.reduce<number | null>(
			(max, s) => (s.screen_m2 != null && (max == null || s.screen_m2 > max) ? s.screen_m2 : max),
			null
		);
		return { screens, seats, biggestScreen };
	});

	const saalLabel = (saal: Saal) => (typeof saal.id === 'number' ? `Saal ${saal.id}` : saal.id);

	const mapsUrl = (address: string) =>
		`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
</script>

<Card.Root class="flex flex-col border-muted">
	<Card.Header class="space-y-3">
		<div class="flex items-start justify-between gap-3">
			<Card.Title class="text-2xl leading-tight font-black tracking-tighter text-primary uppercase">
				{#if titleHref}
					<a
						href={titleHref}
						class="underline decoration-primary/30 decoration-2 underline-offset-4 transition-colors hover:text-primary/80 hover:decoration-primary/80"
					>
						{cinema.name}
					</a>
				{:else}
					{cinema.name}
				{/if}
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
			<div class="flex flex-col items-center justify-center rounded-lg bg-muted/50 px-2 py-3">
				<MonitorIcon class="mb-1 h-4 w-4 text-muted-foreground" />
				<span class="text-xl font-black tabular-nums">{stats.screens}</span>
				<span class="text-[10px] tracking-wider text-muted-foreground uppercase">Screens</span>
			</div>
			<div class="flex flex-col items-center justify-center rounded-lg bg-muted/50 px-2 py-3">
				<ArmchairIcon class="mb-1 h-4 w-4 text-muted-foreground" />
				<span class="text-xl font-black tabular-nums">{stats.seats.toLocaleString()}</span>
				<span class="text-[10px] tracking-wider text-muted-foreground uppercase">Seats</span>
			</div>
			<div class="flex flex-col items-center justify-center rounded-lg bg-muted/50 px-2 py-3">
				<MaximizeIcon class="mb-1 h-4 w-4 text-muted-foreground" />
				<span class="text-xl font-black tabular-nums"
					>{stats.biggestScreen ? `${stats.biggestScreen}` : '—'}</span
				>
				<span class="text-[10px] tracking-wider text-muted-foreground uppercase">Max m²</span>
			</div>
		</div>

		<!-- Halls toggle (only when a toggle handler is supplied) -->
		{#if onToggle}
			<button
				onclick={onToggle}
				class="mt-auto flex items-center justify-between gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase transition-colors hover:text-primary"
			>
				<span>{cinema.saals.length} halls</span>
				<span class="flex items-center gap-1">
					<span>{expanded ? 'Hide' : 'Show'}</span>
					<ChevronDownIcon
						class="h-4 w-4 transition-transform duration-200 {expanded ? 'rotate-180' : ''}"
					/>
				</span>
			</button>
		{:else}
			<h2 class="mt-auto text-sm font-semibold tracking-wider text-muted-foreground uppercase">
				{cinema.saals.length} halls
			</h2>
		{/if}

		{#if expanded}
			<div class="flex flex-col gap-2 border-t border-muted pt-3">
				{#each cinema.saals as saal (saal.id)}
					<div class="flex flex-col gap-1.5 rounded-md bg-muted/30 p-3">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<span class="text-sm font-bold">{saalLabel(saal)}</span>
							<div class="flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
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

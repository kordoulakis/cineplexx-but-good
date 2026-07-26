<script lang="ts">
	import type { TrimmedMovie } from '$lib/models/movie/TrimmedMovie';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import FilmIcon from '@lucide/svelte/icons/film';
	import PlayIcon from '@lucide/svelte/icons/play';
	import CalendarDaysIcon from '@lucide/svelte/icons/calendar-days';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import { getCleanTech, formatTime, cinemaShortName } from '$lib/utils/sessions';

	let {
		movie,
		sessionsToDisplay,
		date,
		showCinema = false
	}: {
		movie: TrimmedMovie;
		sessionsToDisplay?: typeof movie.sessions;
		date?: string;
		showCinema?: boolean;
	} = $props();

	const detailHref = $derived(`/movies/${movie.slug}${date ? `?date=${date}` : ''}`);

	let expanded = $state(false);

	const displaySessions = $derived(
		sessionsToDisplay ?? (movie.isOv ? movie.sessions.filter((s) => s.isOv) : movie.sessions)
	);

	// When this card aggregates several cinemas (the /movies page), group the
	// showtimes by cinema so each one is labelled — the inline reverse lookup.
	const sessionsByCinema = $derived.by(() => {
		const map = new Map<string, typeof displaySessions>();
		for (const s of displaySessions) {
			const name = cinemaShortName(s.cinemaId, s.cinemaName);
			const list = map.get(name) ?? [];
			list.push(s);
			map.set(name, list);
		}
		return [...map.entries()]
			.map(([name, list]) => ({
				name,
				sessions: [...list].sort(
					(a, b) => new Date(a.showtime).getTime() - new Date(b.showtime).getTime()
				)
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	});

	const isEnglishOV = $derived(movie.isOv);

	const movieTechs = $derived(
		[...new Set(displaySessions.flatMap((s) => getCleanTech(s.technologies, s.screenName)))].sort(
			(a, b) => {
				const priority: Record<string, number> = { IMAX: 1, '4DX': 2, '3D': 3, '2D': 4 };
				return (priority[a] || 99) - (priority[b] || 99);
			}
		)
	);

	const formattedDate = $derived(
		movie.startDate
			? new Date(movie.startDate).toLocaleDateString(undefined, {
					month: 'short',
					day: 'numeric'
				})
			: null
	);

	const showStartsAt = $derived(
		formattedDate && movie.startDate && new Date(movie.startDate) > new Date()
	);

	const hasDetails = $derived(
		movie.runTime ||
			movie.genres.length > 0 ||
			movie.directors.length > 0 ||
			movie.actors.length > 0 ||
			movie.rating ||
			movie.descriptionShort ||
			movie.trailerUrl
	);
</script>

{#snippet showtimeButton(session: (typeof displaySessions)[number])}
	{@const techs = getCleanTech(session.technologies, session.screenName)}
	<Button
		variant="outline"
		class="flex h-auto flex-col items-center gap-1 border-input px-3.5 py-2 font-mono text-sm hover:bg-accent hover:text-accent-foreground"
		onclick={(e) => e.stopPropagation()}
	>
		<span class="font-bold">{formatTime(session.showtime)}</span>
		<span class="font-sans text-[10px] text-muted-foreground">{session.screenName}</span>

		{#if techs.length > 0 || session.isOv}
			<div class="mt-1 flex flex-wrap justify-center gap-1">
				{#if session.isOv}
					<Badge
						variant="default"
						class="h-3.5 border-none bg-ov px-1.5 py-0 text-[9px] leading-none font-black text-ov-foreground uppercase hover:bg-ov/90"
					>
						OV
					</Badge>
				{/if}
				{#each techs as tech (tech)}
					{#if tech !== 'OV'}
						<Badge
							variant="outline"
							class="h-3.5 border-primary/20 bg-primary/5 px-1.5 py-0 text-[9px] leading-none font-black text-primary/80 uppercase"
						>
							{tech}
						</Badge>
					{/if}
				{/each}
			</div>
		{/if}
	</Button>
{/snippet}

<Card.Root
	class="group relative flex w-full flex-col overflow-hidden border-muted transition-all hover:shadow-lg {hasDetails
		? 'cursor-pointer'
		: ''}"
	onclick={hasDetails ? () => (expanded = !expanded) : undefined}
	role={hasDetails ? 'button' : undefined}
	tabindex={hasDetails ? 0 : undefined}
	onkeydown={hasDetails
		? (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					expanded = !expanded;
				}
			}
		: undefined}
>
	<!-- Background Poster with Overlay -->
	<div class="absolute inset-0 z-0 transition-transform duration-500 group-hover:scale-105">
		{#if movie.posterImage?.startsWith('https://')}
			<img src={movie.posterImage} alt="" class="h-full w-full object-cover" />
		{/if}
		<div
			class="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/40"
		></div>
	</div>

	<Card.Header class="relative z-10 space-y-2 p-4 pb-2">
		<div class="flex items-start justify-between gap-2">
			<h3
				class="flex-1 text-center text-lg leading-tight font-bold tracking-tight text-card-foreground sm:text-left"
				title={movie.title}
			>
				<a
					href={detailHref}
					onclick={(e) => e.stopPropagation()}
					class="underline-offset-4 transition-colors hover:text-primary hover:underline"
				>
					{movie.title}
				</a>
			</h3>
			{#if hasDetails}
				<ChevronDownIcon
					class="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 {expanded
						? 'rotate-180'
						: ''}"
				/>
			{/if}
		</div>
		<div class="flex items-center justify-center gap-2 sm:items-start sm:justify-between">
			<div class="flex shrink-0 flex-wrap justify-center gap-1 pt-0.5 sm:justify-start">
				{#if isEnglishOV}
					<Badge
						variant="default"
						class="bg-ov px-1.5 py-0 text-[10px] font-semibold tracking-wider text-ov-foreground uppercase hover:bg-ov/90"
					>
						OV
					</Badge>
				{/if}
				{#if movie.comingSoon}
					<Badge
						variant="secondary"
						class="border-amber-500/20 bg-amber-500/10 px-1.5 py-0 text-[10px] font-medium text-amber-600 dark:text-amber-400"
					>
						Soon
					</Badge>
				{/if}
				{#if movie.rating}
					<Badge
						variant="outline"
						class="border-muted-foreground/20 px-1.5 py-0 text-[10px] font-medium text-muted-foreground"
					>
						{movie.rating}
					</Badge>
				{/if}
				{#each movieTechs as tech (tech)}
					{#if tech !== 'OV'}
						<Badge
							variant="outline"
							class="border-primary/20 bg-primary/5 px-1.5 py-0 text-[10px] font-semibold tracking-wider text-primary/80 uppercase"
						>
							{tech}
						</Badge>
					{/if}
				{/each}
			</div>
		</div>

		{#if movie.titleOriginalCalculated && movie.titleOriginalCalculated !== movie.title}
			<p class="line-clamp-1 text-center text-xs text-muted-foreground italic sm:text-left">
				{movie.titleOriginalCalculated}
			</p>
		{/if}
	</Card.Header>

	<Card.Content class="relative z-10 flex flex-grow flex-col justify-between gap-3 p-4 pt-0 pb-3">
		{#if showStartsAt}
			<div
				class="flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:justify-start"
			>
				<CalendarIcon class="h-3.5 w-3.5 text-muted-foreground/70" />
				<span>Starts {formattedDate}</span>
			</div>
		{/if}

		<div class="space-y-2">
			<div
				class="flex items-center justify-center gap-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:justify-start"
			>
				<ClockIcon class="h-3.5 w-3.5" />
				<span>Showtimes</span>
			</div>

			{#if !displaySessions || displaySessions.length === 0}
				<p class="text-center text-xs text-muted-foreground italic sm:text-left">
					No screenings matching filters listed for this date.
				</p>
			{:else if showCinema}
				<div class="space-y-2.5">
					{#each sessionsByCinema as group (group.name)}
						<div class="space-y-1.5">
							<div
								class="flex items-center gap-1 text-[10px] font-bold tracking-wider text-muted-foreground/80 uppercase"
							>
								<MapPinIcon class="h-3 w-3 shrink-0" />
								{group.name}
							</div>
							<div class="no-scrollbar flex flex-nowrap justify-start gap-1.5 overflow-x-auto pb-1">
								{#each group.sessions as session (session)}
									{@render showtimeButton(session)}
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div
					class="no-scrollbar flex flex-nowrap justify-start gap-1.5 overflow-x-auto pb-2 sm:justify-start"
				>
					{#each displaySessions as session (session)}
						{@render showtimeButton(session)}
					{/each}
				</div>
			{/if}
		</div>

		{#if expanded && hasDetails}
			<div
				class="mt-1 space-y-2.5 border-t border-muted pt-3 text-sm"
				onclick={(e) => e.stopPropagation()}
			>
				{#if movie.runTime || movie.genres.length > 0}
					<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
						{#if movie.runTime}
							<span class="flex items-center gap-1">
								<FilmIcon class="h-3 w-3" />
								{movie.runTime} min
							</span>
						{/if}
						{#if movie.genres.length > 0}
							<span>{movie.genres.join(', ')}</span>
						{/if}
					</div>
				{/if}

				{#if movie.directors.length > 0}
					<p class="text-xs text-muted-foreground">
						<span class="font-semibold text-foreground/70">Dir.</span>
						{movie.directors.join(', ')}
					</p>
				{/if}

				{#if movie.actors.length > 0}
					<p class="text-xs text-muted-foreground">
						<span class="font-semibold text-foreground/70">Cast</span>
						{movie.actors.slice(0, 4).join(', ')}{movie.actors.length > 4 ? '…' : ''}
					</p>
				{/if}

				{#if movie.descriptionShort}
					<p class="line-clamp-4 text-xs leading-relaxed text-muted-foreground italic">
						{movie.descriptionShort}
					</p>
				{/if}

				{#if movie.trailerUrl}
					<a
						href={movie.trailerUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
						onclick={(e) => e.stopPropagation()}
					>
						<PlayIcon class="h-3.5 w-3.5" />
						Watch trailer
					</a>
				{/if}
			</div>
		{/if}

		<a
			href={detailHref}
			onclick={(e) => e.stopPropagation()}
			class="mt-auto inline-flex items-center justify-center gap-1.5 rounded-md border border-input bg-background/70 px-3 py-1.5 text-xs font-bold text-foreground/80 transition-colors hover:border-primary/50 hover:text-primary"
		>
			<CalendarDaysIcon class="h-3.5 w-3.5" />
			All showtimes &amp; dates
			<ArrowUpRightIcon class="h-3 w-3 opacity-60" />
		</a>
	</Card.Content>
</Card.Root>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>

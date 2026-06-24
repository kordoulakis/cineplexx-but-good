<script lang="ts">
	import type { TrimmedMovie } from '$lib/types/types';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import ClockIcon from '@lucide/svelte/icons/clock';

	// Svelte 5 component props contract
	let { movie, sessionsToDisplay }: { movie: TrimmedMovie, sessionsToDisplay?: typeof movie.sessions } = $props();

	// Pure data derivations
	const displaySessions = $derived(
		sessionsToDisplay ?? (movie.isOv ? movie.sessions.filter(s => s.isOv) : movie.sessions)
	);

	const isEnglishOV = $derived(movie.isOv);

	const movieTechs = $derived(
		[...new Set(displaySessions.flatMap((s) => getCleanTech(s.technologies, s.screenName)))].sort((a, b) => {
			const priority: Record<string, number> = { IMAX: 1, '4DX': 2, '3D': 3, '2D': 4 };
			return (priority[a] || 99) - (priority[b] || 99);
		})
	);

	const formattedDate = $derived(
		movie.startDate ? new Date(movie.startDate).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric'
		}) : null
	);

	const showStartsAt = $derived(formattedDate && movie.startDate && new Date(movie.startDate) > new Date());

	const getCleanTech = (techMatrix: string[][], screenName: string): string[] => {
		const flattened = techMatrix.flat().map((t) => t.toUpperCase());
		if (screenName.toUpperCase().includes('IMAX')) {
			flattened.push('IMAX');
		}
		// Filter down to notable highlights so the UI stays tidy
		const targets = ['IMAX', '2D', '3D', '4DX', 'ATMOS', 'OV', 'VIP', 'DBOX'];
		return [...new Set(flattened.filter((t) => targets.includes(t)))];
	};

	const formatTime = (isoString: string) => {
		return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
	};
</script>

<Card.Root class="group relative flex flex-col w-full h-full overflow-hidden transition-all hover:shadow-lg border-muted">
	<!-- Background Poster with Overlay -->
	<div class="absolute inset-0 z-0 transition-transform duration-500 group-hover:scale-105">
		{#if movie.posterImage?.startsWith('https://kf-cineplexx.sf.apa.at/')}
			<img
				src={movie.posterImage}
				alt=""
				class="w-full h-full object-cover"
			/>
		{/if}
		<div class="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/40"></div>
	</div>

	<Card.Header class="relative z-10 p-4 pb-2 space-y-2">
		<h3 class="font-bold text-lg leading-tight tracking-tight text-card-foreground text-center sm:text-left" title={movie.title}>
			{movie.title}
		</h3>
		<div class="flex items-center sm:items-start justify-center sm:justify-between gap-2">


			<div class="flex flex-wrap justify-center sm:justify-start gap-1 shrink-0 pt-0.5">
				{#if isEnglishOV}
					<Badge variant="default" class="bg-ov text-ov-foreground hover:bg-ov/90 text-[10px] px-1.5 py-0 font-semibold tracking-wider uppercase">
						OV
					</Badge>
				{/if}
				{#if movie.comingSoon}
					<Badge variant="secondary" class="text-[10px] px-1.5 py-0 font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
						Soon
					</Badge>
				{/if}
				{#each movieTechs as tech (tech)}
					{#if tech !== 'OV'}
						<Badge variant="outline" class="text-[10px] px-1.5 py-0 font-semibold tracking-wider uppercase border-primary/20 bg-primary/5 text-primary/80">
							{tech}
						</Badge>
					{/if}
				{/each}
			</div>
		</div>

		{#if movie.titleOriginalCalculated && movie.titleOriginalCalculated !== movie.title}
			<p class="text-xs text-muted-foreground italic line-clamp-1 text-center sm:text-left">
				{movie.titleOriginalCalculated}
			</p>
		{/if}
	</Card.Header>

	<Card.Content class="relative z-10 p-4 pt-0 pb-3 flex-grow flex flex-col justify-between gap-3">
		{#if showStartsAt}
			<div class="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-muted-foreground">
				<CalendarIcon class="w-3.5 h-3.5 text-muted-foreground/70" />
				<span>Starts {formattedDate}</span>
			</div>
		{/if}

		<div class="space-y-2">
			<div class="flex items-center justify-center sm:justify-start gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
				<ClockIcon class="w-3.5 h-3.5" />
				<span>Showtimes</span>
			</div>

			{#if !displaySessions || displaySessions.length === 0}
				<p class="text-xs text-muted-foreground italic text-center sm:text-left">No screenings matching filters listed for this date.</p>
			{:else}
				<div class="flex flex-nowrap gap-1.5 overflow-x-auto pb-2 no-scrollbar justify-start sm:justify-start">
					{#each displaySessions as session (session)}
						{@const techs = getCleanTech(session.technologies, session.screenName)}

						<Button
							variant="outline"
							class="h-auto py-2 px-3.5 flex flex-col items-center gap-1 font-mono text-sm border-input hover:bg-accent hover:text-accent-foreground"
						>
							<span class="font-bold">{formatTime(session.showtime)}</span>
							<span class="text-[10px] text-muted-foreground font-sans">{session.screenName}</span>

							{#if techs.length > 0 || session.isOv}
								<div class="flex flex-wrap gap-1 justify-center mt-1">
									{#if session.isOv}
										<Badge 
											variant="default" 
											class="text-[9px] px-1.5 py-0 leading-none h-3.5 bg-ov text-ov-foreground hover:bg-ov/90 font-black uppercase border-none"
										>
											OV
										</Badge>
									{/if}
									{#each techs as tech (tech)}
										{#if tech !== 'OV'}
											<Badge 
												variant="outline" 
												class="text-[9px] px-1.5 py-0 leading-none h-3.5 border-primary/20 bg-primary/5 text-primary/80 font-black uppercase"
											>
												{tech}
											</Badge>
										{/if}
									{/each}
								</div>
							{/if}
						</Button>
					{/each}
				</div>
			{/if}
		</div>
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
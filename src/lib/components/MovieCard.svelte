<script lang="ts">
	import type { TrimmedMovie } from '$lib/types/types';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import ClockIcon from '@lucide/svelte/icons/clock';

	// Svelte 5 component props contract
	let { movie }: { movie: TrimmedMovie } = $props();

	// Pure data derivations
	const ovSessions = $derived(
		movie.sessions.filter((session) =>
			session.technologies.flat().some((t) => t.toUpperCase() === 'OV')
		)
	);

	const isEnglishOV = $derived(
		movie.availableVersCMS.some(v => v.DescriptionEN.toLowerCase().includes('ov (english)'))
	);

	const formattedDate = $derived(
		movie.startDate ? new Date(movie.startDate).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric'
		}) : null
	);

	const showStartsAt = $derived(formattedDate && movie.startDate && new Date(movie.startDate) > new Date());

	const getCleanTech = (techMatrix: string[][]): string[] => {
		const flattened = techMatrix.flat().map(t => t.toUpperCase());
		// Filter down to notable highlights so the UI stays tidy
		const targets = ['IMAX', '3D', '4DX', 'ATMOS', 'OV'];
		return [...new Set(flattened.filter(t => targets.includes(t)))];
	};

	const formatTime = (isoString: string) => {
		return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};
</script>

<Card.Root class="flex flex-col w-full h-full overflow-hidden transition-all hover:shadow-md border-muted">
	<Card.Header class="p-4 pb-2 space-y-1">
		<div class="flex items-start justify-between gap-2">
			<h3 class="font-bold text-base leading-tight tracking-tight text-card-foreground line-clamp-2" title={movie.title}>
				{movie.title}
			</h3>

			<div class="flex gap-1 shrink-0 pt-0.5">
				{#if isEnglishOV}
					<Badge variant="default" class="bg-emerald-600 hover:bg-emerald-700 text-[10px] px-1.5 py-0 font-semibold tracking-wider uppercase">
						OV
					</Badge>
				{/if}
				{#if movie.comingSoon}
					<Badge variant="secondary" class="text-[10px] px-1.5 py-0 font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
						Soon
					</Badge>
				{/if}
			</div>
		</div>

		{#if movie.titleOriginalCalculated && movie.titleOriginalCalculated !== movie.title}
			<p class="text-xs text-muted-foreground italic line-clamp-1">
				{movie.titleOriginalCalculated}
			</p>
		{/if}
	</Card.Header>

	<Card.Content class="p-4 pt-0 pb-3 flex-grow flex flex-col justify-between gap-3">
		{#if formattedDate}
			<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
				<CalendarIcon class="w-3.5 h-3.5 text-muted-foreground/70" />
				<span>Starts {formattedDate}</span>
			</div>
		{/if}

		<div class="space-y-2">
			<div class="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
				<ClockIcon class="w-3.5 h-3.5" />
				<span>Today's Sessions</span>
			</div>

			{#if !ovSessions || ovSessions.length === 0}
				<p class="text-xs text-muted-foreground italic">No OV screenings listed for this date.</p>
			{:else}
				<div class="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1">
					{#each ovSessions as session (session)}
						{@const techs = getCleanTech(session.technologies)}

						<Button
							variant="outline"
							size="sm"
							class="h-auto py-1 px-2.5 flex flex-col items-center gap-0.5 font-mono text-xs border-input hover:bg-accent hover:text-accent-foreground"
						>
							<span class="font-bold">{formatTime(session.showtime)}</span>

							{#if techs.length > 0}
                <span class="text-[9px] font-sans font-black tracking-tighter text-primary/80 uppercase">
                  {techs.join('+')}
                </span>
							{/if}
						</Button>
					{/each}
				</div>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
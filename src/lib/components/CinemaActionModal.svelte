<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { cinemas } from '$lib/types/types';
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';
	import ClapperboardIcon from '@lucide/svelte/icons/clapperboard';
	import InfoIcon from '@lucide/svelte/icons/info';

	let {
		cinemaName,
		slug,
		onViewShowtimes = undefined,
		triggerClass = undefined
	}: {
		/** Display name shown as the trigger and in the modal title. */
		cinemaName: string;
		/** Detail-page slug; for schedule cinemas this equals the cinema key. */
		slug: string;
		/** Overrides the default navigation to `/?cinemas={slug}` (used on the homepage to filter in place). */
		onViewShowtimes?: () => void;
		triggerClass?: string;
	} = $props();

	let open = $state(false);

	// Only cinemas in the schedule list have showtimes data.
	const hasShowtimes = $derived(cinemas.some((c) => c.key === slug));

	function viewShowtimes() {
		open = false;
		if (onViewShowtimes) onViewShowtimes();
		else goto(`/?cinemas=${slug}`);
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger
		class={cn(
			'cursor-pointer underline decoration-primary/30 decoration-2 underline-offset-4 transition-colors hover:text-primary/80 hover:decoration-primary/80',
			triggerClass
		)}
	>
		{cinemaName}
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header class="border-b-4 border-primary pb-3">
			<Dialog.Title class="pr-6 text-3xl font-black tracking-tighter text-primary uppercase">
				{cinemaName}
			</Dialog.Title>
			<Dialog.Description>Where do you want to go?</Dialog.Description>
		</Dialog.Header>

		<div class="flex flex-col gap-3">
			<Button
				size="lg"
				class="w-full gap-2 rounded-full font-bold"
				disabled={!hasShowtimes}
				onclick={viewShowtimes}
			>
				<ClapperboardIcon class="h-4 w-4" />
				View showtimes
			</Button>
			{#if !hasShowtimes}
				<p class="-mt-1 text-center text-xs text-muted-foreground italic">
					Showtimes are not tracked for this cinema.
				</p>
			{/if}
			<Button
				variant="outline"
				size="lg"
				class="w-full gap-2 rounded-full font-bold"
				href="/cinemas/{slug}"
				onclick={() => (open = false)}
			>
				<InfoIcon class="h-4 w-4" />
				Cinema details
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>

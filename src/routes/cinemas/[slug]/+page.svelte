<script lang="ts">
	import { page } from '$app/state';
	import { getCinemaBySlug } from '$lib/data/cinemaLocations';
	import CinemaCard from '$lib/components/CinemaCard.svelte';
	import { Button } from '$lib/components/ui/button';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';

	const slug = $derived(page.params.slug ?? '');
	const cinema = $derived(getCinemaBySlug(slug));
</script>

<svelte:head>
	<title>{cinema?.name ?? 'Cinema not found'} · Cineplexx but good</title>
	{#if cinema}
		<meta
			name="description"
			content="{cinema.name} — {cinema.address}. Screens, seats and technology."
		/>
	{/if}
</svelte:head>

<div class="flex w-full flex-1 flex-col items-center">
	<div class="flex w-full max-w-2xl flex-col px-4 py-8">
		<header
			class="mb-8 flex w-full items-center justify-between gap-4 border-b-4 border-primary pb-4"
		>
			<Button
				href="/cinemas"
				variant="ghost"
				size="sm"
				class="-ml-2 gap-1.5 text-muted-foreground hover:text-primary"
			>
				<ArrowLeftIcon class="h-4 w-4" />
				All cinemas
			</Button>
			<ThemeSwitcher />
		</header>

		{#if cinema}
			<CinemaCard {cinema} expanded={true} />
		{:else}
			<div class="flex flex-col items-center justify-center gap-4 py-16 text-center">
				<p class="text-lg font-semibold">We couldn't find that cinema.</p>
				<Button href="/cinemas" class="gap-2">
					<ArrowLeftIcon class="h-4 w-4" />
					Back to all cinemas
				</Button>
			</div>
		{/if}
	</div>
</div>

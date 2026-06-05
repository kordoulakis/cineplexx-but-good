<script lang="ts">
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import CinemasAndMovies from '$lib/components/CinemasAndMovies.svelte';
	import DateSelector from '$lib/components/DateSelector.svelte';

	let selectedDate = $state(new Date().toISOString().split('T')[0]);
</script>

<div class="min-h-screen w-full flex flex-col items-center">
	<div class="w-full max-w-7xl flex flex-col items-center py-8 px-4">
		<header class="w-full flex justify-between items-end mb-12 border-b-4 border-primary pb-4">
			<div class="flex flex-col gap-2">
				<h1 class="text-6xl font-black uppercase tracking-tighter leading-none">Cineplexx</h1>
			</div>
			<ThemeSwitcher />
		</header>

		<main class="w-full">
			<div class="mt-4">
				<DateSelector bind:value={selectedDate} />
			</div>
			<CinemasAndMovies {selectedDate} />
		</main>
	</div>
</div>
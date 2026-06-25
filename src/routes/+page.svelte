<script lang="ts">
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import CinemasAndMovies from '$lib/components/CinemasAndMovies.svelte';
	import DateSelector from '$lib/components/DateSelector.svelte';

	let selectedDate = $state(new Date().toISOString().split('T')[0]);
</script>

<div class="min-h-screen w-full flex flex-col items-center">
	<div class="w-full max-w-7xl flex flex-col items-center py-8 px-4">
		<header class="w-full flex flex-col md:flex-row justify-between items-center md:items-end mb-12 border-b-4 border-primary pb-4 gap-6 md:gap-0">
			<div class="flex flex-col items-center md:items-end md:flex-row align-bottom gap-2">
					<h1 class="text-5xl sm:text-6xl font-black uppercase tracking-tighter leading-none text-center md:text-left">Cineplexx</h1>
					 <p class="font-light uppercase text-sm sm:text-base text-cineplexx">but good</p>
			</div>

			<ThemeSwitcher />
		</header>

		<main class="w-full flex flex-col items-center">
			<div class="mt-4 w-full flex justify-center">
				<DateSelector bind:value={selectedDate} />
			</div>
			<CinemasAndMovies bind:selectedDate />
		</main>
	</div>
</div>
<script lang="ts">
	import ThemeSwitcher from '$lib/components/themeSwitcher.svelte';
	import CinemasAndMovies from '$lib/components/CinemasAndMovies.svelte';

	let selectedDate = $state(new Date().toISOString().split('T')[0]);
</script>

<div class="min-h-screen w-full flex flex-col items-center">
	<div class="w-full max-w-7xl flex flex-col items-center py-8 px-4">
		<header class="w-full flex justify-between items-end mb-12 border-b-4 border-primary pb-4">
			<div class="flex flex-col gap-2">
				<h1 class="text-6xl font-black uppercase tracking-tighter leading-none">Cineplexx</h1>
				<div class="flex items-center gap-3 mt-4">
					<label for="date-picker" class="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Date</label>
					<input 
						id="date-picker"
						type="date" 
						bind:value={selectedDate}
						class="bg-background border-2 border-primary/20 rounded-md px-3 py-1 text-sm font-bold focus:outline-none focus:border-primary transition-colors cursor-pointer"
					/>
				</div>
			</div>
			<ThemeSwitcher />
		</header>

		<main class="w-full">
			<CinemasAndMovies {selectedDate} />
		</main>
	</div>
</div>
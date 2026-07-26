<script lang="ts">
	import { cinemas } from '$lib/data/cinemas';
	import { Badge } from '$lib/components/ui/badge';
	import { AVAILABLE_TECHS } from '$lib/utils/urlState';

	let {
		selectedCinemas = $bindable(),
		selectedTechs = $bindable(),
		showOnlyOv = $bindable(),
		searchQuery = $bindable()
	}: {
		selectedCinemas: string[];
		selectedTechs: string[];
		showOnlyOv: boolean;
		searchQuery: string;
	} = $props();

	const availableTechs = AVAILABLE_TECHS;

	const toggleCinema = (key: string) => {
		if (selectedCinemas.includes(key)) {
			if (selectedCinemas.length === 1) return; // keep at least one
			selectedCinemas = selectedCinemas.filter((k) => k !== key);
		} else {
			selectedCinemas = [...selectedCinemas, key];
		}
	};

	const toggleTech = (tech: string) => {
		if (selectedTechs.includes(tech)) {
			selectedTechs = selectedTechs.filter((t) => t !== tech);
		} else {
			selectedTechs = [...selectedTechs, tech];
		}
	};
</script>

<!-- Cinema Selector -->
<div class="flex flex-wrap items-center justify-center gap-2">
	<span
		class="mr-2 w-full text-center text-sm font-semibold tracking-wider text-muted-foreground uppercase sm:w-auto"
		>Cinemas:</span
	>
	{#each cinemas as cinema (cinema.key)}
		<button onclick={() => toggleCinema(cinema.key)} class="transition-all">
			<Badge
				variant={selectedCinemas.includes(cinema.key) ? 'default' : 'outline'}
				class="cursor-pointer px-3 py-1 hover:bg-primary hover:text-primary-foreground {selectedCinemas.includes(
					cinema.key
				)
					? ''
					: 'border-muted-foreground/30 bg-background text-muted-foreground'}"
			>
				{cinema.name}
			</Badge>
		</button>
	{/each}
</div>

<!-- Search Bar -->
<div class="relative w-full max-w-md">
	<div class="pointer-events-none absolute inset-y-0 left-3 flex items-center">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="text-muted-foreground"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
		>
	</div>
	<input
		type="text"
		bind:value={searchQuery}
		placeholder="Search movies..."
		class="w-full rounded-full border border-muted-foreground/30 bg-background py-2.5 pr-4 pl-10 text-sm transition-all placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/50 focus:outline-none"
	/>
	{#if searchQuery}
		<button
			aria-label="Clear search"
			onclick={() => (searchQuery = '')}
			class="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-primary"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
			>
		</button>
	{/if}
</div>

<div class="flex flex-wrap items-center justify-center gap-2">
	<span
		class="mr-2 w-full text-center text-sm font-semibold tracking-wider text-muted-foreground uppercase sm:w-auto"
		>Filters:</span
	>

	<button onclick={() => (showOnlyOv = !showOnlyOv)} class="transition-all">
		<Badge
			variant={showOnlyOv ? 'default' : 'outline'}
			class="cursor-pointer px-3 py-1 hover:bg-ov hover:text-ov-foreground {showOnlyOv
				? 'border-ov bg-ov text-ov-foreground'
				: 'border-muted-foreground/30 bg-background text-muted-foreground'}"
		>
			OV Only
		</Badge>
	</button>

	{#each availableTechs as tech (tech)}
		<button onclick={() => toggleTech(tech)} class="transition-all">
			<Badge
				variant={selectedTechs.includes(tech) ? 'default' : 'outline'}
				class="cursor-pointer px-3 py-1 hover:bg-primary hover:text-primary-foreground {selectedTechs.includes(
					tech
				)
					? ''
					: 'border-muted-foreground/30 bg-background text-muted-foreground'}"
			>
				{tech}
			</Badge>
		</button>
	{/each}

	{#if selectedTechs.length > 0 || !showOnlyOv || searchQuery}
		<button
			onclick={() => {
				selectedTechs = [];
				showOnlyOv = true;
				searchQuery = '';
			}}
			class="ml-2 text-xs text-muted-foreground underline underline-offset-4 hover:text-primary"
		>
			Clear all
		</button>
	{/if}
</div>

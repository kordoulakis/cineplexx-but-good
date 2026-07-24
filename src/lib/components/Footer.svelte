<script lang="ts">
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';

	const year = new Date().getFullYear();
</script>

<footer class="w-full border-t-4 border-primary/80 bg-background">
	<div class="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-10 text-center">
		<!-- Wordmark echo -->
		<div class="flex items-baseline gap-1.5">
			<span class="text-2xl font-black tracking-tighter uppercase">Cineplexx</span>
			<span class="text-xs font-light text-cineplexx uppercase">but good</span>
		</div>

		<!-- The credit -->
		<p class="flex flex-wrap items-center justify-center gap-1.5 text-sm text-muted-foreground">
			Made with
			<span
				class="inline-block transition-transform duration-200 hover:-translate-y-0.5 hover:rotate-12"
				title="freshly popped"
				aria-hidden="true">🍿</span
			>
			by
			<a
				href="https://github.com/kordoulakis"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1.5 font-bold text-foreground transition-colors hover:text-primary"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="h-4 w-4"
					aria-hidden="true"
				>
					<path
						d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.333-1.724-1.333-1.724-1.089-.731.083-.716.083-.716 1.205.082 1.84 1.215 1.84 1.215 1.07 1.793 2.809 1.275 3.495.975.108-.758.42-1.275.762-1.568-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.295-.54-1.485.105-3.097 0 0 1.005-.31 3.3 1.209a11.6 11.6 0 0 1 3.003-.395c1.02.005 2.045.135 3.003.395 2.28-1.519 3.285-1.209 3.285-1.209.645 1.612.24 2.802.12 3.097.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.561C20.565 21.917 24 17.5 24 12.292 24 5.78 18.63.5 12 .5Z"
					/>
				</svg>
				Ilias Kordoulas
			</a>
		</p>

		<!-- Links -->
		<div
			class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-semibold text-muted-foreground"
		>
			<a
				href="https://github.com/kordoulakis/cineplexx-but-good/"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1 transition-colors hover:text-primary"
			>
				GitHub <ExternalLinkIcon class="h-3 w-3 opacity-60" />
			</a>
			<span class="text-muted-foreground/40">·</span>
			<a
				href="https://www.cineplexx.at"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1 transition-colors hover:text-primary"
			>
				The “original” Cineplexx <ExternalLinkIcon class="h-3 w-3 opacity-60" />
			</a>
		</div>

		<p class="text-[11px] text-muted-foreground/50">
			© {year} Ilias Kordoulas · Not affiliated with Cineplexx Kinobetriebe GmbH.
		</p>
	</div>
</footer>

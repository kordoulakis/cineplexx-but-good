<script lang="ts">
	import type { TrimmedMovie, FetchResult } from '$lib/types/types';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import DateSelector from '$lib/components/DateSelector.svelte';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { getCleanTech, formatTime } from '$lib/utils/sessions';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import FilmIcon from '@lucide/svelte/icons/film';
	import PlayIcon from '@lucide/svelte/icons/play';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';

	const today = new Date().toISOString().split('T')[0];
	const slug = $derived(page.params.id ?? '');

	const dateParam = page.url.searchParams.get('date');
	let selectedDate = $state(dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : today);

	// Keep the chosen date in the URL so the page is shareable / reload-safe.
	$effect(() => {
		if (!browser) return;
		const target = selectedDate === today ? '' : `?date=${selectedDate}`;
		const current = page.url.search;
		if ((target || '') !== (current || '')) {
			goto(`/movies/${slug}${target}`, { replaceState: true, keepFocus: true, noScroll: true });
		}
	});

	let schedules = $state<Record<string, FetchResult<TrimmedMovie[]>>>({});
	let loading = $state(true);
	let error = $state<string | null>(null);

	let searchingNextDate = $state(false);
	let noFutureMatch = $state(false);

	function buildDetail(sched: Record<string, FetchResult<TrimmedMovie[]>>) {
		let meta: TrimmedMovie | null = null;
		const sessions: TrimmedMovie['sessions'] = [];
		for (const result of Object.values(sched)) {
			if (!result.ok) continue;
			for (const m of result.data) {
				if (m.slug !== slug) continue;
				if (!meta) meta = m;
				sessions.push(...m.sessions);
			}
		}
		const byCinema = new Map<string, TrimmedMovie['sessions']>();
		for (const s of sessions) {
			const list = byCinema.get(s.cinemaName) ?? [];
			list.push(s);
			byCinema.set(s.cinemaName, list);
		}
		const groups = [...byCinema.entries()]
			.map(([cinemaName, list]) => ({
				cinemaName,
				sessions: [...list].sort(
					(a, b) => new Date(a.showtime).getTime() - new Date(b.showtime).getTime()
				)
			}))
			.sort((a, b) => a.cinemaName.localeCompare(b.cinemaName));
		return { meta, groups, count: sessions.length };
	}

	const detail = $derived(buildDetail(schedules));
	const fallbackTitle = $derived(slug.replace(/-/g, ' '));

	async function probeSlugOnDate(dateStr: string): Promise<boolean> {
		const res = await fetch(`/api/movies?date=${dateStr}`);
		if (!res.ok) return false;
		const sched = (await res.json()) as Record<string, FetchResult<TrimmedMovie[]>>;
		return buildDetail(sched).count > 0;
	}

	async function goToNextScreening() {
		searchingNextDate = true;
		noFutureMatch = false;
		const probe = new Date(selectedDate);
		for (let i = 0; i < 60; i++) {
			probe.setDate(probe.getDate() + 1);
			const dateStr = probe.toISOString().split('T')[0];
			try {
				if (await probeSlugOnDate(dateStr)) {
					selectedDate = dateStr;
					searchingNextDate = false;
					return;
				}
			} catch {
				// keep probing
			}
		}
		searchingNextDate = false;
		noFutureMatch = true;
	}

	$effect(() => {
		const dateToFetch = selectedDate;
		noFutureMatch = false;
		const run = async () => {
			loading = true;
			try {
				const res = await fetch(`/api/movies?date=${dateToFetch}`);
				if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
				schedules = await res.json();
				error = null;
			} catch (err) {
				console.error('Movie detail fetch crashed:', err);
				error = 'Could not load showtimes. Please try again later.';
			} finally {
				loading = false;
			}
		};
		run();
	});

	const formattedStart = $derived(
		detail.meta?.startDate
			? new Date(detail.meta.startDate).toLocaleDateString(undefined, {
					day: 'numeric',
					month: 'long',
					year: 'numeric'
				})
			: null
	);
</script>

<svelte:head>
	<title>{detail.meta?.title ?? fallbackTitle} · Cineplexx but good</title>
</svelte:head>

<div class="flex min-h-screen w-full flex-col items-center">
	<div class="flex w-full max-w-5xl flex-col px-4 py-8">
		<header
			class="mb-8 flex w-full items-center justify-between gap-4 border-b-4 border-primary pb-4"
		>
			<a
				href="/"
				class="flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
			>
				<ArrowLeftIcon class="h-4 w-4" />
				<span>All showtimes</span>
			</a>
			<ThemeSwitcher />
		</header>

		{#if loading}
			<div class="flex min-h-50 items-center justify-center">
				<p class="animate-pulse text-lg">Loading…</p>
			</div>
		{:else}
			{#if error}
				<div
					class="mb-6 rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-destructive"
				>
					<p class="font-bold">Critical Error</p>
					<p>{error}</p>
				</div>
			{/if}

			<!-- Movie header -->
			<div class="flex flex-col gap-6 sm:flex-row">
				{#if detail.meta?.posterImage?.startsWith('https://')}
					<img
						src={detail.meta.posterImage}
						alt=""
						class="mx-auto h-72 w-48 shrink-0 rounded-lg object-cover shadow-lg sm:mx-0"
					/>
				{/if}
				<div class="flex flex-1 flex-col gap-3">
					<h1
						class="text-center text-4xl leading-none font-black tracking-tighter uppercase sm:text-left sm:text-5xl"
					>
						{detail.meta?.title ?? fallbackTitle}
					</h1>
					{#if detail.meta && detail.meta.titleOriginalCalculated && detail.meta.titleOriginalCalculated !== detail.meta.title}
						<p class="text-center text-sm text-muted-foreground italic sm:text-left">
							{detail.meta.titleOriginalCalculated}
						</p>
					{/if}

					{#if detail.meta}
						<div class="flex flex-wrap justify-center gap-2 sm:justify-start">
							{#if detail.meta.isOv}
								<Badge
									variant="default"
									class="bg-ov px-1.5 py-0 text-[10px] font-semibold tracking-wider text-ov-foreground uppercase hover:bg-ov/90"
									>OV</Badge
								>
							{/if}
							{#if detail.meta.rating}
								<Badge
									variant="outline"
									class="border-muted-foreground/20 px-1.5 py-0 text-[10px] font-medium text-muted-foreground"
									>{detail.meta.rating}</Badge
								>
							{/if}
							{#if detail.meta.runTime}
								<Badge
									variant="outline"
									class="flex items-center gap-1 border-muted-foreground/20 px-1.5 py-0 text-[10px] font-medium text-muted-foreground"
								>
									<FilmIcon class="h-3 w-3" />{detail.meta.runTime} min
								</Badge>
							{/if}
						</div>

						<div class="space-y-1.5 text-sm text-muted-foreground">
							{#if detail.meta.genres.length > 0}
								<p>{detail.meta.genres.join(', ')}</p>
							{/if}
							{#if detail.meta.directors.length > 0}
								<p>
									<span class="font-semibold text-foreground/70">Dir.</span>
									{detail.meta.directors.join(', ')}
								</p>
							{/if}
							{#if detail.meta.actors.length > 0}
								<p>
									<span class="font-semibold text-foreground/70">Cast</span>
									{detail.meta.actors.slice(0, 6).join(', ')}{detail.meta.actors.length > 6
										? '…'
										: ''}
								</p>
							{/if}
							{#if formattedStart}
								<p>
									<span class="font-semibold text-foreground/70">Release</span>
									{formattedStart}
								</p>
							{/if}
						</div>

						{#if detail.meta.descriptionShort}
							<p class="text-sm leading-relaxed text-muted-foreground italic">
								{detail.meta.descriptionShort}
							</p>
						{/if}

						{#if detail.meta.trailerUrl}
							<a
								href={detail.meta.trailerUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
							>
								<PlayIcon class="h-4 w-4" /> Watch trailer
							</a>
						{/if}
					{/if}
				</div>
			</div>

			<!-- Date picker -->
			<div class="mt-10 flex flex-col items-center gap-2">
				<span
					class="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
				>
					<ClockIcon class="h-3.5 w-3.5" /> Showtimes
				</span>
				<DateSelector bind:value={selectedDate} />
			</div>

			<!-- Showtimes by cinema -->
			{#if detail.groups.length > 0}
				<div class="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
					{#each detail.groups as group (group.cinemaName)}
						<section class="space-y-3">
							<h2
								class="flex items-center gap-1.5 border-b-2 border-primary/20 pb-2 text-lg font-black tracking-tighter text-primary uppercase"
							>
								<MapPinIcon class="h-4 w-4 shrink-0" />
								{group.cinemaName}
							</h2>
							<div class="flex flex-wrap gap-2">
								{#each group.sessions as session (session.cinemaId + session.showtime)}
									{@const techs = getCleanTech(session.technologies, session.screenName)}
									<div
										class="flex flex-col items-center gap-1 rounded-md border border-input bg-card/60 px-3.5 py-2"
									>
										<span class="font-mono text-sm font-bold tabular-nums"
											>{formatTime(session.showtime)}</span
										>
										<span class="font-sans text-[10px] text-muted-foreground"
											>{session.screenName}</span
										>
										{#if techs.length > 0 || session.isOv}
											<div class="mt-1 flex flex-wrap justify-center gap-1">
												{#if session.isOv}
													<Badge
														variant="default"
														class="h-3.5 border-none bg-ov px-1.5 py-0 text-[9px] leading-none font-black text-ov-foreground uppercase hover:bg-ov/90"
														>OV</Badge
													>
												{/if}
												{#each techs as tech (tech)}
													{#if tech !== 'OV'}
														<Badge
															variant="outline"
															class="h-3.5 border-primary/20 bg-primary/5 px-1.5 py-0 text-[9px] leading-none font-black text-primary/80 uppercase"
															>{tech}</Badge
														>
													{/if}
												{/each}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</section>
					{/each}
				</div>
			{:else}
				<div class="mt-10 flex flex-col items-center justify-center gap-4 py-12 text-center">
					{#if noFutureMatch}
						<p class="text-lg font-semibold">No upcoming date has a screening for this film.</p>
						<p class="text-sm text-muted-foreground">It may have left the schedule.</p>
					{:else}
						<p class="text-lg font-semibold">No showtimes for this film on this date.</p>
						<Button onclick={goToNextScreening} disabled={searchingNextDate} class="gap-2">
							{searchingNextDate ? 'Searching…' : 'Find next screening'}
						</Button>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
</div>

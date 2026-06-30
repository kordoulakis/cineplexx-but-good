<script lang="ts">
	import type { TrimmedMovie, FetchResult } from '$lib/types/types';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { untrack } from 'svelte';
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

	type Schedules = Record<string, FetchResult<TrimmedMovie[]>>;

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

	// Per-date cache: a date is fetched at most once and reused, so switching dates
	// is instant. Nearby dates are prefetched in the background.
	const PREFETCH_DAYS = 7;
	let cache = $state<Record<string, Schedules>>({});
	const inflight = new Map<string, Promise<Schedules>>();
	let error = $state<string | null>(null);

	let searchingNextDate = $state(false);
	let noFutureMatch = $state(false);

	function loadDate(dateStr: string): Promise<Schedules> {
		const cached = untrack(() => cache[dateStr]);
		if (cached) return Promise.resolve(cached);
		const existing = inflight.get(dateStr);
		if (existing) return existing;
		const promise = (async () => {
			const res = await fetch(`/api/movies?date=${dateStr}`);
			if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
			const data = (await res.json()) as Schedules;
			cache = { ...cache, [dateStr]: data };
			return data;
		})().finally(() => inflight.delete(dateStr));
		inflight.set(dateStr, promise);
		return promise;
	}

	function buildDetail(sched: Schedules) {
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

	const currentSchedules = $derived(cache[selectedDate]);
	const detail = $derived(buildDetail(currentSchedules ?? {}));
	const schedulesLoading = $derived(currentSchedules === undefined);
	const fallbackTitle = $derived(slug.replace(/-/g, ' '));

	// Sticky metadata: once we've loaded this film's details keep showing them, even
	// while a new date fetches or on a date where the film isn't playing. Reset when
	// navigating to a different film.
	let stickyMeta = $state<TrimmedMovie | null>(null);
	$effect(() => {
		slug;
		untrack(() => (stickyMeta = null));
	});
	$effect(() => {
		if (detail.meta) stickyMeta = detail.meta;
	});
	const displayMeta = $derived(detail.meta ?? stickyMeta);

	// Load the selected date (instant if cached) and prefetch the coming week.
	$effect(() => {
		const base = selectedDate;
		untrack(() => {
			error = null;
			noFutureMatch = false;
			loadDate(base).catch((err) => {
				console.error('Movie detail fetch crashed:', err);
				if (selectedDate === base) error = 'Could not load showtimes. Please try again later.';
			});
			const d = new Date(base);
			for (let i = 1; i <= PREFETCH_DAYS; i++) {
				d.setDate(d.getDate() + 1);
				loadDate(d.toISOString().split('T')[0]).catch(() => {});
			}
		});
	});

	async function goToNextScreening() {
		searchingNextDate = true;
		noFutureMatch = false;
		const probe = new Date(selectedDate);
		for (let i = 0; i < 60; i++) {
			probe.setDate(probe.getDate() + 1);
			const dateStr = probe.toISOString().split('T')[0];
			try {
				const data = await loadDate(dateStr);
				if (buildDetail(data).count > 0) {
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

	const formattedStart = $derived(
		displayMeta?.startDate
			? new Date(displayMeta.startDate).toLocaleDateString(undefined, {
					day: 'numeric',
					month: 'long',
					year: 'numeric'
				})
			: null
	);
</script>

<svelte:head>
	<title>{displayMeta?.title ?? fallbackTitle} · Cineplexx but good</title>
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

		<!-- Movie header (persists across date changes) -->
		<div class="flex flex-col gap-6 sm:flex-row">
			{#if displayMeta?.posterImage?.startsWith('https://')}
				<img
					src={displayMeta.posterImage}
					alt=""
					class="mx-auto h-72 w-48 shrink-0 rounded-lg object-cover shadow-lg sm:mx-0"
				/>
			{/if}
			<div class="flex flex-1 flex-col gap-3">
				<h1
					class="text-center text-4xl leading-none font-black tracking-tighter uppercase sm:text-left sm:text-5xl"
				>
					{displayMeta?.title ?? fallbackTitle}
				</h1>
				{#if displayMeta && displayMeta.titleOriginalCalculated && displayMeta.titleOriginalCalculated !== displayMeta.title}
					<p class="text-center text-sm text-muted-foreground italic sm:text-left">
						{displayMeta.titleOriginalCalculated}
					</p>
				{/if}

				{#if displayMeta}
					<div class="flex flex-wrap justify-center gap-2 sm:justify-start">
						{#if displayMeta.isOv}
							<Badge
								variant="default"
								class="bg-ov px-1.5 py-0 text-[10px] font-semibold tracking-wider text-ov-foreground uppercase hover:bg-ov/90"
								>OV</Badge
							>
						{/if}
						{#if displayMeta.rating}
							<Badge
								variant="outline"
								class="border-muted-foreground/20 px-1.5 py-0 text-[10px] font-medium text-muted-foreground"
								>{displayMeta.rating}</Badge
							>
						{/if}
						{#if displayMeta.runTime}
							<Badge
								variant="outline"
								class="flex items-center gap-1 border-muted-foreground/20 px-1.5 py-0 text-[10px] font-medium text-muted-foreground"
							>
								<FilmIcon class="h-3 w-3" />{displayMeta.runTime} min
							</Badge>
						{/if}
					</div>

					<div class="space-y-1.5 text-sm text-muted-foreground">
						{#if displayMeta.genres.length > 0}
							<p>{displayMeta.genres.join(', ')}</p>
						{/if}
						{#if displayMeta.directors.length > 0}
							<p>
								<span class="font-semibold text-foreground/70">Dir.</span>
								{displayMeta.directors.join(', ')}
							</p>
						{/if}
						{#if displayMeta.actors.length > 0}
							<p>
								<span class="font-semibold text-foreground/70">Cast</span>
								{displayMeta.actors.slice(0, 6).join(', ')}{displayMeta.actors.length > 6
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

					{#if displayMeta.descriptionShort}
						<p class="text-sm leading-relaxed text-muted-foreground italic">
							{displayMeta.descriptionShort}
						</p>
					{/if}

					{#if displayMeta.trailerUrl}
						<a
							href={displayMeta.trailerUrl}
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

		<!-- Showtimes by cinema (only this section reacts to fetching) -->
		{#if error}
			<div
				class="mt-8 rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-destructive"
			>
				<p class="font-bold">Critical Error</p>
				<p>{error}</p>
			</div>
		{:else if schedulesLoading}
			<div class="mt-8 flex min-h-40 items-center justify-center">
				<p class="animate-pulse text-lg">Loading showtimes…</p>
			</div>
		{:else if detail.groups.length > 0}
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
	</div>
</div>

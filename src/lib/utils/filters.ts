/**
 * Shared movie/session filtering used by both the per-cinema schedule
 * (CinemasAndMovies) and the aggregated "all movies" page (/movies), so the
 * OV / tech / search semantics stay identical across both views.
 */
import type { TrimmedMovie, TrimmedSession, FetchResult } from '$lib/types/types';

export interface SessionFilterOptions {
	showOnlyOv: boolean;
	selectedTechs: string[];
}

/** Does a single session pass the active OV + technology filters? */
export function sessionMatchesFilters(
	session: TrimmedSession,
	{ showOnlyOv, selectedTechs }: SessionFilterOptions
): boolean {
	if (showOnlyOv && !session.isOv) return false;
	if (selectedTechs.length > 0) {
		const sessionTechs = session.technologies.flat().map((t) => t.toUpperCase());
		const matchesAllTechs = selectedTechs.every(
			(tech) =>
				sessionTechs.includes(tech) ||
				(tech === 'IMAX' && session.screenName.toUpperCase().includes('IMAX'))
		);
		if (!matchesAllTechs) return false;
	}
	return true;
}

/** Title / original-title search. `query` is expected to be lower-cased + trimmed. */
export function matchesQuery(movie: TrimmedMovie, query: string): boolean {
	if (!query) return true;
	const haystack = `${movie.title} ${movie.titleOriginalCalculated ?? ''}`.toLowerCase();
	return haystack.includes(query);
}

/**
 * Collapse the per-cinema schedule into one deduplicated movie list. A film
 * playing at several cinemas appears once, with the sessions from every
 * selected cinema concatenated. Metadata is taken from the first cinema that
 * lists the film. Sorted by title.
 */
export function mergeMoviesBySlug(
	schedules: Record<string, FetchResult<TrimmedMovie[]>>,
	selectedCinemas: string[]
): TrimmedMovie[] {
	const bySlug = new Map<string, TrimmedMovie>();
	for (const [cinemaKey, result] of Object.entries(schedules)) {
		if (!selectedCinemas.includes(cinemaKey) || !result.ok) continue;
		for (const movie of result.data) {
			const existing = bySlug.get(movie.slug);
			if (existing) {
				existing.sessions = [...existing.sessions, ...movie.sessions];
			} else {
				bySlug.set(movie.slug, { ...movie, sessions: [...movie.sessions] });
			}
		}
	}
	return [...bySlug.values()].sort((a, b) => a.title.localeCompare(b.title));
}

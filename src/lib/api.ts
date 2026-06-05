import type { Cinema, FetchResult, RawMovie, TrimmedMovie } from './types/types.ts';
import { retryFetch } from './async.ts';

const cinemas: Cinema[] = [
	{ id: 1001, key: 'apollo', name: 'Apollo' },
	{ id: 1003, key: 'donauzentrum', name: 'Donauzentrum' },
	{ id: 1004, key: 'millennium', name: 'Millennium' },
	{ id: 1016, key: 'scs', name: 'SCS' }
];

const BASE = 'https://app.cineplexx.at/api/v1/cinemasweb';

function mapToTrimmedMovies(raw: RawMovie[]): TrimmedMovie[] {
	return (raw || []).map((movie) => ({
		title: movie.title,
		titleOriginalCalculated: movie.titleOriginalCalculated,
		startDate: movie.startDate,
		comingSoon: movie.comingSoon,
		availableVersCMS: (movie.availableVersCMS || []).map((v) => ({
			id: v.id,
			Description: v.Description,
			DescriptionEN: v.DescriptionEN
		})),
		sessions: (movie.sessions || []).map((s) => ({
			cinemaId: s.cinemaId,
			cinemaName: s.cinemaName,
			technologies: s.technologies,
			showtime: s.showtime
		}))
	}));
}

export async function getMoviesForAllCinemas(
	date: string,
	options?: { retries?: number; timeoutMs?: number }
): Promise<Record<string, FetchResult<TrimmedMovie[]>>> {
	const retries = options?.retries ?? 2;
	const timeoutMs = options?.timeoutMs ?? 8000;

	// Map each cinema to an async operation
	const promises = cinemas.map(async (cinema) => {
		const url = `${BASE}/${cinema.id}/movies?date=${encodeURIComponent(date)}`;
		try {
			const rawData = await retryFetch<RawMovie[]>(url, retries, timeoutMs);
			console.log(`Fetched cinema ${cinema.name} with ${rawData.length} movies`);
			return { key: cinema.key, result: { ok: true, data: mapToTrimmedMovies(rawData) } as const };
		} catch (err) {
			const error = err instanceof Error ? err.message : String(err);
			console.error(`Error fetching cinema ${cinema.name}: ${error}`);
			return { key: cinema.key, result: { ok: false, error } as const };
		}
	});

	// Fire all 4 requests concurrently
	const responses = await Promise.all(promises);

	// Re-assemble into the final dictionary object
	return responses.reduce(
		(acc, curr) => {
			acc[curr.key] = curr.result;
			return acc;
		},
		{} as Record<string, FetchResult<TrimmedMovie[]>>
	);
}

import type { Cinema, FetchResult, RawMovie, TrimmedMovie } from './types/types.ts';
import { retryFetch } from './async.ts';

export const cinemas: Cinema[] = [
	{ id: 1003, key: 'donauzentrum', name: 'Donauzentrum', slug: 'Cineplexx-Donau-Zentrum' },
	{ id: 1001, key: 'apollo', name: 'Apollo', slug: 'Apollo-Das-Kino' },
	{ id: 1004, key: 'millennium', name: 'Millennium', slug: 'Cineplexx-Millennium-City' },
	{ id: 1016, key: 'scs', name: 'SCS', slug: 'Cineplexx-Westfield-SCS' }
];

const BASE = 'https://app.cineplexx.at/api/v1/cinemasweb';

function mapToTrimmedMovies(raw: RawMovie[]): TrimmedMovie[] {
	return (raw || []).map((movie) => {
		const sessions = (movie.sessions || []).map((s) => {
			const isOvSession =
				s.technologies
					.flat()
					.some(
						(technology) =>
							technology.toUpperCase().includes('OV') || technology.toUpperCase().includes('OMU')
					) ||
				s.screenName?.toLowerCase().includes('ov') ||
				s.screenName?.toLowerCase().includes('omu') ||
				s.screenName?.toLowerCase().includes('englisch');
			return {
				cinemaId: s.cinemaId,
				cinemaName: s.cinemaName,
				screenName: s.screenName,
				technologies: s.technologies,
				showtime: s.showtime,
				isOv: isOvSession
			};
		});

		const hasOVTech = sessions.some((session) => session.isOv);
		const isOvMovie = hasOVTech || 
			[movie.titleOriginalCalculated, movie.title].some(t => 
				t?.toUpperCase().includes('(OV)') || 
				t?.toUpperCase().includes(' OV') ||
				t?.toUpperCase().includes('(OMU)') || 
				t?.toUpperCase().includes(' OMU')
			);

		const hasIMAXTech = sessions.some((session) =>
			session.technologies.flat().some((t) => t.toUpperCase() === 'IMAX') ||
			session.screenName.toUpperCase().includes('IMAX')
		);

		return {
			title: movie.title.replace("*", ""),
			titleOriginalCalculated: movie.titleOriginalCalculated,
			startDate: movie.startDate,
			comingSoon: movie.comingSoon,
			posterImage: movie.posterImage,
			availableVersCMS: (movie.availableVersCMS || []).map((v) => ({
				id: v.id,
				Description: v.Description,
				DescriptionEN: v.DescriptionEN
			})),
			sessions,
			isOv: isOvMovie,
			isImax: hasIMAXTech
		};
	});
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

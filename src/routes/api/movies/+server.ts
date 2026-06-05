import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import type { RawMovie, TrimmedMovie, FetchResult } from '$lib/types/types';
import { cinemas } from '$lib/types/types';

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

async function fetchWithTimeout<T>(url: string, timeoutMs: number): Promise<T> {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(url, { signal: controller.signal });
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return await response.json() as T;
	} finally {
		clearTimeout(id);
	}
}

async function retryFetch<T>(url: string, attempts: number, timeoutMs: number): Promise<T> {
	let lastError: unknown;
	for (let i = 0; i <= attempts; i++) {
		try {
			return await fetchWithTimeout<T>(url, timeoutMs);
		} catch (err) {
			lastError = err;
			if (i < attempts) await new Promise((res) => setTimeout(res, 300 * Math.pow(2, i)));
		}
	}
	throw lastError;
}

export const GET: RequestHandler = async ({ url }) => {
	const date = url.searchParams.get('date');
	if (!date) {
		return json({ error: 'Date parameter is required' }, { status: 400 });
	}

	const promises = cinemas.map(async (cinema) => {
		const fetchUrl = `${BASE}/${cinema.id}/movies?date=${encodeURIComponent(date)}`;
		try {
			const rawData = await retryFetch<RawMovie[]>(fetchUrl, 2, 8000);
			return { key: cinema.key, result: { ok: true, data: mapToTrimmedMovies(rawData) } as const };
		} catch (err) {
			const error = err instanceof Error ? err.message : String(err);
			console.error(`Error fetching cinema ${cinema.name}: ${error}`);
			return { key: cinema.key, result: { ok: false, error } as const };
		}
	});

	const responses = await Promise.all(promises);
	const schedules = responses.reduce(
		(acc, curr) => {
			acc[curr.key] = curr.result;
			return acc;
		},
		{} as Record<string, FetchResult<TrimmedMovie[]>>
	);

	return json(schedules);
};

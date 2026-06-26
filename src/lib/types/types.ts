export interface MovieVersion {
	id: string;
	Description: string;
	DescriptionEN: string;
}

export interface TrimmedSession {
	cinemaId: string;
	cinemaName: string;
	screenName: string;
	technologies: string[][];
	showtime: string;
	isOv: boolean;
}

export interface TrimmedMovie {
	title: string;
	titleOriginalCalculated: string;
	startDate: string;
	comingSoon: boolean;
	availableVersCMS: MovieVersion[];
	sessions: TrimmedSession[];
	isOv: boolean;
	isImax: boolean;
	posterImage: string;
	runTime: number | null;
	genres: string[];
	directors: string[];
	actors: string[];
	rating: string | null;
	descriptionShort: string | null;
	trailerUrl: string | null;
	trailerKeyframe: string | null;
}

// Strict mapping shapes for incoming un-trimmed API data
export interface RawMovieVersion {
	id: string;
	Description: string;
	DescriptionEN: string;
	[key: string]: unknown;
}

export interface RawSession {
	cinemaId: string;
	cinemaName: string;
	screenName: string;
	technologies: string[][];
	showtime: string;
	conceptAttributesNames?: string[];
	[key: string]: unknown;
}

export interface RawMovie {
	title: string;
	titleOriginalCalculated: string;
	startDate: string;
	comingSoon: boolean;
	posterImage: string;
	availableVersCMS?: RawMovieVersion[];
	sessions?: RawSession[];
	runTime?: number;
	genres?: string[];
	directors?: string[];
	actors?: string[];
	rating?: string;
	descriptionShortCalculated?: string;
	trailers?: Array<{ videoUrl?: string; keyframeUrl?: string; universalPlayerUrl?: string }>;
	[key: string]: unknown;
}

export type Cinema = { id: number; key: string; name: string; slug: string };
export type FetchResult<T> = { ok: true; data: T } | { ok: false; error: string };

export const cinemas: Cinema[] = [
	{ id: 1003, key: 'donauzentrum', name: 'Donauzentrum', slug: 'Cineplexx-Donau-Zentrum' },
	{ id: 1001, key: 'apollo', name: 'Apollo', slug: 'Apollo-Das-Kino' },
	{ id: 1004, key: 'millennium', name: 'Millennium', slug: 'Cineplexx-Millennium-City' },
	{ id: 1016, key: 'scs', name: 'SCS', slug: 'Cineplexx-Westfield-SCS' }
];

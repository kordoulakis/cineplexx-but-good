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
	[key: string]: unknown;
}

export type Cinema = { id: number; key: string; name: string; slug: string };
export type FetchResult<T> = { ok: true; data: T } | { ok: false; error: string };

/** Strict mapping shape for incoming un-trimmed API data. */
export interface RawSession {
	cinemaId: string;
	cinemaName: string;
	screenName: string;
	technologies: string[][];
	showtime: string;
	conceptAttributesNames?: string[];
	[key: string]: unknown;
}

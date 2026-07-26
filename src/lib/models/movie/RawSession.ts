/** Strict mapping shape for incoming un-trimmed API data. */
export interface RawSession {
	id: string;
	cinemaId: string;
	cinemaName: string;
	screenName: string;
	technologies: string[][];
	showtime: string;
	conceptAttributesNames?: string[];
	salesChannels?: string;
	status?: string;
	[key: string]: unknown;
}

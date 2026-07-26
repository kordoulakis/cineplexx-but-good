/** Strict mapping shape for incoming un-trimmed API data. */
export interface RawMovieVersion {
	id: string;
	Description: string;
	DescriptionEN: string;
	[key: string]: unknown;
}

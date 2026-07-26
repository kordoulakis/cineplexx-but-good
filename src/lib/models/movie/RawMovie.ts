import type { RawMovieVersion } from './RawMovieVersion';
import type { RawSession } from './RawSession';

/** Strict mapping shape for incoming un-trimmed API data. */
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

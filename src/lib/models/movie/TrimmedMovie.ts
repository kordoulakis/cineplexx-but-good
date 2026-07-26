import type { MovieVersion } from './MovieVersion';
import type { TrimmedSession } from './TrimmedSession';

export interface TrimmedMovie {
	title: string;
	titleOriginalCalculated: string;
	slug: string;
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

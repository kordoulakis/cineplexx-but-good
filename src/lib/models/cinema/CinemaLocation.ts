import type { Screen } from './Screen';

export interface CinemaLocation {
	/** URL-friendly id used for the /cinemas/[slug] detail route. For cinemas that
	 *  also appear in the showtime schedule, this matches their key in
	 *  `cinemas` (src/lib/data/cinemas.ts) so the two data sources line up. */
	slug: string;
	name: string;
	address: string;
	notes?: string;
	total_screens?: number;
	screens: Screen[];
}

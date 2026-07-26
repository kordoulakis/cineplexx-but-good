import type { TrimmedMovie } from './TrimmedMovie';

/** A single session surfaced in the "Now & Soon" view, with its parent movie and start time. */
export interface NowItem {
	movie: TrimmedMovie;
	session: TrimmedMovie['sessions'][number];
	t: number;
}

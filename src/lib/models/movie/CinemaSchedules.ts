import type { FetchResult } from '../api/FetchResult';
import type { TrimmedMovie } from './TrimmedMovie';

/** A day's schedule, keyed by cinema key, as returned by `/api/movies`. */
export type CinemaSchedules = Record<string, FetchResult<TrimmedMovie[]>>;

/**
 * Shared helpers for rendering movie sessions (showtimes).
 * Used by MovieCard, the movie detail page, and the "Now & Soon" view so the
 * tech-badge and time formatting logic stays identical everywhere.
 */

import { cinemas } from '$lib/data/cinemas';

const TECH_TARGETS = ['IMAX', '2D', '3D', '4DX', 'ATMOS', 'OV', 'VIP', 'DBOX'];

/**
 * Resolve a session's numeric cinemaId to the short cinema name (e.g. "Apollo",
 * "SCS"). Used when showtimes from multiple cinemas share a card and each one
 * needs a compact label. Falls back to the provided name if the id is unknown.
 */
export function cinemaShortName(cinemaId: string, fallback = ''): string {
	return cinemas.find((c) => String(c.id) === cinemaId)?.name ?? fallback;
}

/**
 * Reduce a session's raw technology matrix + screen name to a clean, de-duped
 * list of the badges we care about (e.g. ['IMAX', 'ATMOS']). IMAX is also
 * inferred from the screen name.
 */
export function getCleanTech(techMatrix: string[][], screenName: string): string[] {
	const flattened = techMatrix.flat().map((t) => t.toUpperCase());
	if (screenName.toUpperCase().includes('IMAX')) {
		flattened.push('IMAX');
	}
	return [...new Set(flattened.filter((t) => TECH_TARGETS.includes(t)))];
}

/** Format an ISO datetime string as a 24h HH:MM local time. */
export function formatTime(isoString: string): string {
	return new Date(isoString).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});
}

/** Build the direct link to the ticket purchase wizard for a given session id. */
export function purchaseUrl(sessionId: string): string {
	return `https://cineplexx.at/purchase/wizard/${sessionId}`;
}

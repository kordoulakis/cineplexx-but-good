/**
 * Shared helpers for rendering movie sessions (showtimes).
 * Used by MovieCard, the movie detail page, and the "Now & Soon" view so the
 * tech-badge and time formatting logic stays identical everywhere.
 */

const TECH_TARGETS = ['IMAX', '2D', '3D', '4DX', 'ATMOS', 'OV', 'VIP', 'DBOX'];

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

/**
 * Serialize / deserialize the homepage filter state to and from URL query
 * params, so a filtered view is shareable, bookmarkable, and survives reload.
 *
 * Only non-default values are written, keeping URLs short. Param names:
 *   date    YYYY-MM-DD
 *   cinemas comma-separated cinema keys
 *   techs   comma-separated tech tags
 *   ov      "0" when the (default-on) OV filter is turned off
 *   q       search query
 *   view    "now" for the "Now & Soon" view
 */
import { cinemas } from '$lib/data/cinemas';
import type { FilterState } from '$lib/models/filter/FilterState';

export const AVAILABLE_TECHS = ['IMAX', '4DX', '3D', '2D', 'ATMOS', 'VIP', 'DBOX'];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const allCinemaKeys = cinemas.map((c) => c.key);

/** Parse whatever filter params are present in the URL. Absent/invalid keys are omitted. */
export function parseFilters(searchParams: URLSearchParams): Partial<FilterState> {
	const out: Partial<FilterState> = {};

	const date = searchParams.get('date');
	if (date && DATE_RE.test(date)) out.date = date;

	const cinemasParam = searchParams.get('cinemas');
	if (cinemasParam) {
		const keys = cinemasParam.split(',').filter((k) => allCinemaKeys.includes(k));
		if (keys.length > 0) out.cinemas = keys;
	}

	const techsParam = searchParams.get('techs');
	if (techsParam) {
		const techs = techsParam
			.split(',')
			.map((t) => t.toUpperCase())
			.filter((t) => AVAILABLE_TECHS.includes(t));
		if (techs.length > 0) out.techs = techs;
	}

	const ov = searchParams.get('ov');
	if (ov === '0') out.showOnlyOv = false;
	else if (ov === '1') out.showOnlyOv = true;

	const q = searchParams.get('q');
	if (q) out.query = q;

	if (searchParams.get('view') === 'now') out.view = 'now';

	return out;
}

/**
 * Build a URLSearchParams holding only the filter values that differ from the
 * defaults (OV on, all cinemas, no techs, no search, schedule view, today).
 */
export function buildFilterParams(state: FilterState, today: string): URLSearchParams {
	const params = new URLSearchParams();

	if (state.date && state.date !== today) params.set('date', state.date);

	if (state.cinemas.length > 0 && state.cinemas.length !== allCinemaKeys.length) {
		params.set('cinemas', state.cinemas.join(','));
	}

	if (state.techs.length > 0) params.set('techs', state.techs.join(','));

	if (!state.showOnlyOv) params.set('ov', '0');

	const q = state.query.trim();
	if (q) params.set('q', q);

	if (state.view === 'now') params.set('view', 'now');

	return params;
}

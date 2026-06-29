/**
 * Build a URL-safe slug from a movie title.
 * Lowercases, strips diacritics, turns runs of non-alphanumerics into single
 * hyphens, and trims leading/trailing hyphens.
 */
export function slugify(input: string): string {
	return (input || '')
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '') // strip combining marks
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

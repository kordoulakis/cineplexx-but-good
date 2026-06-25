import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set(
		'Content-Security-Policy',
		"img-src 'self' https://kf-cineplexx.sf.apa.at data:; " +
			"connect-src 'self'; " +
			"frame-ancestors 'none';"
	);
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	if (event.url.pathname.startsWith('/api/')) {
		response.headers.set('Access-Control-Allow-Origin', event.url.origin);
		response.headers.set('Access-Control-Allow-Methods', 'GET');
	}

	return response;
};

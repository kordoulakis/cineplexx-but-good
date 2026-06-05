export const wait = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms));

export async function fetchWithTimeout<T>(url: string, timeoutMs: number): Promise<T> {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(url, { signal: controller.signal });
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return await response.json() as T;
	} finally {
		clearTimeout(id);
	}
}

export async function retryFetch<T>(url: string, attempts: number, timeoutMs: number): Promise<T> {
	let lastError: unknown;
	for (let i = 0; i <= attempts; i++) {
		try {
			return await fetchWithTimeout<T>(url, timeoutMs);
		} catch (err) {
			lastError = err;
			if (i < attempts) await wait(300 * Math.pow(2, i));
		}
	}
	throw lastError;
}
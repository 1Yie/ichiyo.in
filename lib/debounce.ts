/* eslint-disable @typescript-eslint/no-explicit-any */
export function debouncePromise<T extends (...args: any[]) => Promise<any>>(
	fn: T,
	delay: number
) {
	let timer: NodeJS.Timeout;
	let pendingReject: ((reason?: any) => void) | null = null;

	return (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
		if (pendingReject) {
			pendingReject('Debounced');
			pendingReject = null;
		}

		return new Promise((resolve, reject) => {
			if (timer) clearTimeout(timer);

			pendingReject = reject;

			timer = setTimeout(async () => {
				try {
					const result = await fn(...args);
					resolve(result as Awaited<ReturnType<T>>);
				} catch (err) {
					reject(err);
				} finally {
					pendingReject = null;
				}
			}, delay);
		});
	};
}

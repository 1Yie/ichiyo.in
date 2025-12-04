export const baseUrl =
	process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export async function request<T>(
	input: RequestInfo | URL,
	init?: RequestInit & {
		params?: Record<string, string | number | boolean | undefined>;
	}
): Promise<T> {
	let url: URL;
	try {
		if (input instanceof URL) {
			url = new URL(input.toString());
		} else if (typeof input === 'string') {
			url = new URL(input, input.startsWith('http') ? undefined : baseUrl);
		} else {
			throw new Error('不支持的input类型');
		}
	} catch (urlError) {
		throw new Error(
			`请求失败：无效的请求地址。详细信息：${
				urlError instanceof Error ? urlError.message : urlError
			}`
		);
	}

	if (init?.params) {
		Object.entries(init.params).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				url.searchParams.append(key, String(value));
			}
		});
	}

	let res: Response;
	try {
		res = await fetch(url.toString(), {
			headers: {
				...(init?.headers || {}),
				...(init?.method && init.method !== 'GET'
					? { 'Content-Type': 'application/json' }
					: {}),
			},
			cache: init?.cache || 'no-store',
			...init,
		});
	} catch (fetchError) {
		throw new Error(
			`请求失败：网络错误或无法连接到服务器。详细信息：${
				fetchError instanceof Error ? fetchError.message : fetchError
			}`
		);
	}

	if (!res.ok) {
		const errorText = await res.text();

		throw new Error(`请求失败：${res.status} ${res.statusText}\n${errorText}`);
	}

	try {
		return (await res.json()) as T;
	} catch (jsonError) {
		throw new Error(
			`请求失败：响应内容解析失败。详细信息：${
				jsonError instanceof Error ? jsonError.message : jsonError
			}`
		);
	}
}

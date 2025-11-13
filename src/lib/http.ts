import {FetchError, HttpError, toError} from './errors';

export async function http(url: string | URL, init?: RequestInit) {
	try {
		const r = await fetch(url, init).then(HttpError.test);
		return r;
	} catch (e) {
		if (e instanceof TypeError) {
			throw new FetchError(url, e);
		}

		throw toError(e);
	}
}

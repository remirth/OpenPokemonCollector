import {FetchError, HttpError, toError} from './errors';

type HttpRetryOptions = {
	retries?: number; // total attempts = retries + 1
	timeoutMs?: number; // per-attempt timeout
	backoffBaseMs?: number; // initial backoff
	backoffFactor?: number; // multiplier per attempt
	jitter?: boolean; // add small randomization
	retryOnMethods?: string[]; // uppercased
	retryOnHttpStatus?: number[]; // e.g., [408, 429, 500, 502, 503, 504]
};

const defaultRetryOptions: Required<HttpRetryOptions> = {
	retries: 2,
	timeoutMs: 10000,
	backoffBaseMs: 250,
	backoffFactor: 2,
	jitter: true,
	retryOnMethods: ['GET', 'HEAD', 'OPTIONS'],
	retryOnHttpStatus: [408, 429, 500, 502, 503, 504],
};

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		if (signal?.aborted)
			return reject(new DOMException('Aborted', 'AbortError'));
		const t = setTimeout(resolve, ms);
		signal?.addEventListener(
			'abort',
			() => {
				clearTimeout(t);
				reject(new DOMException('Aborted', 'AbortError'));
			},
			{once: true},
		);
	});
}

function computeBackoffMs(
	attempt: number, // 0-based attempt index
	base: number,
	factor: number,
	jitter: boolean,
): number {
	const ms = Math.min(60_000, Math.floor(base * factor ** attempt));
	if (!jitter) return ms;
	// Full jitter
	return Math.floor(Math.random() * (ms + 1));
}

function mergeSignals(
	parent?: AbortSignal,
	child?: AbortSignal,
): AbortSignal | undefined {
	if (!parent && !child) return undefined;
	if (!parent) return child;
	if (!child) return parent;
	const controller = new AbortController();
	const onAbort = () => controller.abort();
	parent.addEventListener('abort', onAbort, {once: true});
	child.addEventListener('abort', onAbort, {once: true});
	if (parent.aborted || child.aborted) controller.abort();
	return controller.signal;
}

function shouldRetry({
	err,
	res,
	method,
	retryOnMethods,
	retryOnHttpStatus,
}: {
	err: unknown;
	res: Response | null;
	method: string;
	retryOnMethods: string[];
	retryOnHttpStatus: number[];
}): boolean {
	const m = method.toUpperCase();
	if (!retryOnMethods.includes(m)) return false;

	// Network or timeout errors typically appear as TypeError or AbortError
	if (err) {
		// AbortError or TypeError (failed fetch) are retryable
		if (
			(err instanceof DOMException && err.name === 'AbortError') ||
			err instanceof TypeError
		) {
			return true;
		}
	}

	if (res) {
		return retryOnHttpStatus.includes(res.status);
	}

	return false;
}

// You can thread options through `init` via a custom field `retry`
// without mutating the Fetch API types (TS will allow indexing).
type HttpInit = RequestInit & {retry?: HttpRetryOptions; timeoutMs?: number};

export async function http(url: string | URL, init?: HttpInit) {
	const {
		retry: retryOptsInput,
		timeoutMs: timeoutOverride, // alias sugar
		signal: outerSignal,
		...restInit
	} = init ?? {};

	const opts: Required<HttpRetryOptions> = {
		...defaultRetryOptions,
		...(retryOptsInput || {}),
		timeoutMs:
			retryOptsInput?.timeoutMs ??
			timeoutOverride ??
			defaultRetryOptions.timeoutMs,
	};

	const method = (restInit.method || 'GET').toUpperCase();

	let lastError: unknown;

	for (let attempt = 0; attempt <= opts.retries; attempt++) {
		const attemptController = new AbortController();
		const timeoutId = setTimeout(
			() => attemptController.abort(),
			opts.timeoutMs,
		);

		// Merge the caller's signal with our per-attempt controller
		const signal = mergeSignals(
			outerSignal ?? undefined,
			attemptController.signal,
		);

		try {
			const r = await fetch(url, {...restInit, signal}).then(HttpError.test);

			// Success path
			clearTimeout(timeoutId);
			return r;
		} catch (e) {
			clearTimeout(timeoutId);
			lastError = e;

			// On last attempt, break immediately
			if (attempt === opts.retries) break;

			// If outer signal aborted, stop retrying
			if (outerSignal?.aborted) break;

			// If not retryable, stop
			// Note: we do not have a Response here if fetch threw, so pass null
			const retry = shouldRetry({
				err: e,
				res: null,
				method,
				retryOnMethods: opts.retryOnMethods,
				retryOnHttpStatus: opts.retryOnHttpStatus,
			});

			if (!retry) break;

			// Backoff before next attempt
			const backoff = computeBackoffMs(
				attempt,
				opts.backoffBaseMs,
				opts.backoffFactor,
				opts.jitter,
			);

			try {
				await sleep(backoff, outerSignal ?? undefined);
			} catch {
				// Aborted during backoff
				break;
			}
		}
	}

	// If we reached here, either retries exhausted or non-retryable error
	const e = lastError;
	if (e instanceof TypeError) {
		throw new FetchError(url, e);
	}
	if (e instanceof DOMException && e.name === 'AbortError') {
		// Normalize abort errors through FetchError for consistency
		throw new FetchError(url, e);
	}
	throw toError(e);
}

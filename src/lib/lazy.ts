const cache = new Map<string, Promise<unknown>>();
const loaded = new Map<string, boolean>();
export function lazyLoaded<T>(key: string, loader: () => Promise<T>) {
	if (!cache.has(key)) {
		loaded.set(key, false);
		const task = loader();
		onDone(task, () => loaded.set(key, true));
		cache.set(key, task);
	}

	return cache.get(key) as Promise<T>;
}

async function onDone(task: Promise<unknown>, cb: () => void) {
	await task;
	cb();
}

export function lazyLoadCompleted(key: string) {
	return Boolean(loaded.get(key));
}

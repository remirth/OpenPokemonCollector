const cache = new Map<string, Promise<unknown>>();
export function lazyLoaded<T>(key: string, loader: () => Promise<T>) {
	if (!cache.has(key)) {
		cache.set(key, loader());
	}

	return cache.get(key) as Promise<T>;
}

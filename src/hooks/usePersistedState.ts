import type {Type} from 'arktype';
import {useEffect, useState} from 'react';
import {NotInitializedError} from '~/lib/errors';

function resolve<T>(v: T | (() => T)): T {
	return typeof v === 'function' ? (v as () => T)() : v;
}

export function usePersistedState<T>(
	key: string,
	schema: Type<T>,
	initial: T | (() => T),
	onChange?: (v: T) => void,
) {
	const [value, set] = useState<T>(() => {
		try {
			const value = localStorage.getItem(key);
			NotInitializedError.assert(key, value);

			return schema.assert(JSON.parse(value)) as T;
		} catch (e) {
			if (typeof window !== 'undefined') {
				console.warn({message: `Could not load key: ${key}`, error: e});
				localStorage.removeItem(key);
			}
			return resolve(initial);
		}
	});

	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(value));
		onChange?.(value);
	}, [value, onChange, key]);

	return [value, set] as const;
}

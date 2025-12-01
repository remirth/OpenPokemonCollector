import type {Type} from 'arktype';
import {type Dispatch, type SetStateAction, useCallback, useState} from 'react';
import {NotInitializedError} from '~/lib/errors';

function resolve<T>(v: T | (() => T)): T {
	return typeof v === 'function' ? (v as () => T)() : v;
}

export function usePersistedState<T>(
	key: string,
	schema: Type<T>,
	initial: T | (() => T),
) {
	const [value, set] = useState<T>(() => {
		try {
			const value = localStorage.getItem(key);
			NotInitializedError.assert(key, value);

			return schema.assert(JSON.parse(value)) as T;
		} catch (e) {
			console.error(e);
			localStorage.removeItem(key);
			return resolve(initial);
		}
	});

	const setter: Dispatch<SetStateAction<T>> = useCallback(
		(v) => {
			set(v);
			localStorage.setItem(key, JSON.stringify(v));
		},
		[key],
	);

	return [value, setter] as const;
}

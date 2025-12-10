import {useEffect, useState} from 'react';

const query = '(prefers-color-scheme: dark)' as const;

export function usePrefersDark(): boolean {
	const [state, setState] = useState(false);

	useEffect(() => {
		const mql = window.matchMedia(query);
		if (!mql) {
			setState(false);
			return;
		}

		const handler = (e: MediaQueryListEvent) => {
			setState(e.matches);
		};

		setState(mql.matches);
		// Modern addEventListener with fallback
		if (typeof mql.addEventListener === 'function') {
			const abortCtrl = new AbortController();
			mql.addEventListener('change', handler, {signal: abortCtrl.signal});
			return () => abortCtrl.abort();
		} else {
			// Older Safari
			mql.addListener(handler);
			return () => mql.removeListener(handler);
		}
	}, []);

	return state;
}

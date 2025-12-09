import {type ReactNode, useEffect, useState} from 'react';

type ClientOnlyProps = {
	children: ReactNode;
	fallback?: ReactNode;
};

function isPrerender(): boolean {
	return (
		typeof window !== 'undefined' &&
		// biome-ignore lint/suspicious/noExplicitAny: Check prerender flag set by Puppeteer
		(window as any).__PRERENDER__ === true
	);
}

export function ClientOnly({children, fallback = null}: ClientOnlyProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		// Only mount if not in prerender mode
		if (!isPrerender()) {
			setMounted(true);
		}
	}, []);

	// During prerender or before mount, return fallback
	if (isPrerender() || !mounted) {
		return fallback;
	}

	return children;
}

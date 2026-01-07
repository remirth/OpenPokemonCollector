import {type ReactNode, useEffect, useState} from 'react';

type ClientOnlyProps = {
	children: ReactNode;
	fallback?: ReactNode;
};

export function ClientOnly({children, fallback = null}: ClientOnlyProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		// Only mount if not in prerender mode
		setMounted(true);
	}, []);

	// During prerender or before mount, return fallback
	if (!mounted) {
		return fallback;
	}

	return children;
}

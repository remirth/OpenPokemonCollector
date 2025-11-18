import {useCallback, useEffect, useMemo, useState} from 'react';

type LengthUnit =
	| 'px'
	| 'em'
	| 'rem'
	| 'vh'
	| 'vw'
	| 'vmin'
	| 'vmax'
	| 'ch'
	| 'ex';

type ResolutionUnit = 'dpi' | 'dppx' | 'dpcm';

// A curated set of media features you can extend as needed.
type MediaFeatures = {
	// width/height
	minWidth?: `${number}${LengthUnit}`;
	maxWidth?: `${number}${LengthUnit}`;
	width?: `${number}${LengthUnit}`;

	minHeight?: `${number}${LengthUnit}`;
	maxHeight?: `${number}${LengthUnit}`;
	height?: `${number}${LengthUnit}`;

	// color
	color?: number;
	minColor?: number;
	maxColor?: number;

	// color-gamut
	colorGamut?: 'srgb' | 'p3' | 'rec2020';

	// prefers-reduced-motion / prefers-color-scheme / contrast
	prefersReducedMotion?: 'no-preference' | 'reduce';
	prefersColorScheme?: 'light' | 'dark';
	prefersContrast?: 'no-preference' | 'more' | 'less' | 'custom';

	// orientation
	orientation?: 'portrait' | 'landscape';

	// hover / pointer
	hover?: 'none' | 'hover';
	anyHover?: 'none' | 'hover';
	pointer?: 'none' | 'coarse' | 'fine';
	anyPointer?: 'none' | 'coarse' | 'fine';

	// resolution
	resolution?: `${number}${ResolutionUnit}`;
	minResolution?: `${number}${ResolutionUnit}`;
	maxResolution?: `${number}${ResolutionUnit}`;

	// aspect-ratio
	aspectRatio?: `${number}/${number}`;
	minAspectRatio?: `${number}/${number}`;
	maxAspectRatio?: `${number}/${number}`;
};

type QueryInput =
	| string
	| (MediaFeatures & {
			/** Add "not" to invert the entire query */
			not?: boolean;
			/** Media type like "screen", "print", or "all" */
			type?: 'all' | 'screen' | 'print';
			/** Combine multiple feature objects with "and". This lets you build complex queries. */
			and?: MediaFeatures[];
	  });

function buildFeature(key: string, value: unknown): string {
	// Map TS keys to actual CSS feature names
	const map: Record<string, string> = {
		minWidth: 'min-width',
		maxWidth: 'max-width',
		width: 'width',
		minHeight: 'min-height',
		maxHeight: 'max-height',
		height: 'height',
		color: 'color',
		minColor: 'min-color',
		maxColor: 'max-color',
		colorGamut: 'color-gamut',
		prefersReducedMotion: 'prefers-reduced-motion',
		prefersColorScheme: 'prefers-color-scheme',
		prefersContrast: 'prefers-contrast',
		orientation: 'orientation',
		hover: 'hover',
		anyHover: 'any-hover',
		pointer: 'pointer',
		anyPointer: 'any-pointer',
		resolution: 'resolution',
		minResolution: 'min-resolution',
		maxResolution: 'max-resolution',
		aspectRatio: 'aspect-ratio',
		minAspectRatio: 'min-aspect-ratio',
		maxAspectRatio: 'max-aspect-ratio',
	};

	const feature = map[key] ?? key;

	// Some features are keywords (no parentheses) when used as media type or modifiers,
	// but for feature-value pairs we use (feature: value).
	// We special-case the "prefers-*" and similar that require values.
	if (typeof value === 'boolean') {
		// Not expected here; ignore
		return '';
	}

	if (typeof value === 'number') {
		return `(${feature}: ${value})`;
	}

	if (typeof value === 'string') {
		// If already a parenthesized constraint, pass through
		if (value.startsWith('(') && value.endsWith(')')) return value;
		return `(${feature}: ${value})`;
	}

	return '';
}

function buildQuery(input: QueryInput): string {
	if (typeof input === 'string') return input;

	const {not, type = 'all', and = [], ...features} = input;

	const parts: string[] = [];

	// media type
	parts.push(type);

	// primary features
	for (const [k, v] of Object.entries(features)) {
		if (v == null) continue;
		parts.push(buildFeature(k, v));
	}

	// additional groups combined with "and"
	for (const group of and) {
		for (const [k, v] of Object.entries(group)) {
			if (v == null) continue;
			parts.push(buildFeature(k, v));
		}
	}

	// filter empties and join with " and "
	const body = parts.filter(Boolean).join(' and ');
	return not ? `not ${body}` : body;
}

type UseMediaQueryResult = {
	matches: boolean;
	query: string;
	mql: MediaQueryList | null;
};

export function useMediaQuery(input: QueryInput): UseMediaQueryResult {
	const query = useMemo(() => buildQuery(input), [input]);
	const getMql = useCallback(
		() =>
			typeof window !== 'undefined' && 'matchMedia' in window
				? window.matchMedia(query)
				: null,
		[query],
	);

	const [state, setState] = useState<UseMediaQueryResult>(() => {
		const mql = getMql();
		return {matches: mql ? mql.matches : false, query, mql};
	});

	useEffect(() => {
		const mql = getMql();
		if (!mql) {
			setState({matches: false, query, mql: null});
			return;
		}

		const handler = (e: MediaQueryListEvent) =>
			setState({matches: e.matches, query, mql});

		// Modern addEventListener with fallback
		if (typeof mql.addEventListener === 'function') {
			const abortCtrl = new AbortController();
			mql.addEventListener('change', handler, {signal: abortCtrl.signal});
			setState({matches: mql.matches, query, mql});
			return () => abortCtrl.abort();
		} else {
			// Older Safari
			mql.addListener(handler);
			setState({matches: mql.matches, query, mql});
			return () => mql.removeListener(handler);
		}
	}, [query, getMql]);

	return state;
}

const query = '(prefers-color-scheme: dark)' as const;

export function usePrefersDark(): boolean {
	const [state, setState] = useState(() => window.matchMedia(query).matches);

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

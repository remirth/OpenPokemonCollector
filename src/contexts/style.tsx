import {createContext, useContext, useEffect, useMemo, useState} from 'react';

export const STYLES = [
	{value: 'default', name: 'Default'},
	{value: 'rose', name: 'Rose'},
] as const;
export type Style = (typeof STYLES)[number]['value'];

type StyleProviderProps = {
	children: React.ReactNode;
	defaultStyle?: Style;
	storageKey?: string;
};

type StyleProviderState = {
	style: Style;
	setStyle: (style: Style) => void;
};

const initialState: StyleProviderState = {
	style: 'default',
	setStyle: () => null,
};

const StyleProviderContext = createContext<StyleProviderState>(initialState);

export function StyleProvider({
	children,
	defaultStyle = 'default',
	storageKey = '__current_style',
	...props
}: StyleProviderProps) {
	const [style, setStyle] = useState<Style>(() => {
		const stored = localStorage.getItem(storageKey);
		return STYLES.find((s) => s.value === stored)?.value ?? defaultStyle;
	});

	useEffect(() => {
		const root = window.document.documentElement;
		root.setAttribute('data-theme', style);
	}, [style]);

	const value = useMemo(
		() => ({
			style,
			setStyle: (style: Style) => {
				localStorage.setItem(storageKey, style);
				setStyle(style);
			},
		}),
		[style, storageKey],
	);

	return (
		<StyleProviderContext.Provider {...props} value={value}>
			{children}
		</StyleProviderContext.Provider>
	);
}

export const useStyle = () => {
	const context = useContext(StyleProviderContext);

	if (context === undefined)
		throw new Error('useStyle must be used within a StyleProvider');

	return context;
};

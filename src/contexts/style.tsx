import {type} from 'arktype';
import {createContext, useContext, useEffect, useMemo} from 'react';
import {usePersistedState} from '~/hooks/usePersistedState';

export const StyleSchema = type("'default'|'rose'");
export type Style = typeof StyleSchema.infer;
export const STYLES = [
	{value: 'default', name: 'Default'},
	{value: 'rose', name: 'Rose'},
] satisfies Array<{value: Style; name: string}>;

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
	const [style, setStyle] = usePersistedState(
		storageKey,
		StyleSchema,
		defaultStyle,
	);

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
		[style, storageKey, setStyle],
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

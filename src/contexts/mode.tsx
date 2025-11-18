import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {usePrefersDark} from '~/hooks/useMediaQuery';

export const MODES = [
	{value: 'light', name: 'Light'},
	{value: 'dark', name: 'Dark'},
	{value: 'system', name: 'System'},
] as const;
export type Mode = (typeof MODES)[number]['value'];

type ModeProviderProps = {
	children: React.ReactNode;
	defaultMode?: Mode;
	storageKey?: string;
};

type ModeProviderState = {
	theme: Mode;
	setMode: (theme: Mode) => void;
};

const initialState: ModeProviderState = {
	theme: 'system',
	setMode: () => null,
};

const ModeProviderContext = createContext<ModeProviderState>(initialState);

export function ModeProvider({
	children,
	defaultMode = 'system',
	storageKey = '__current_mode',
	...props
}: ModeProviderProps) {
	const [theme, setMode] = useState<Mode>(() => {
		const stored = localStorage.getItem(storageKey);
		return MODES.find((m) => m.value === stored)?.value ?? defaultMode;
	});

	const systemIsDark = usePrefersDark();

	useEffect(() => {
		const root = window.document.documentElement;

		const isDark = (theme === 'system' && systemIsDark) || theme === 'dark';
		root.classList.toggle('light', !isDark);
		root.classList.toggle('dark', isDark);
	}, [theme, systemIsDark]);

	const value = useMemo(
		() => ({
			theme,
			setMode: (theme: Mode) => {
				localStorage.setItem(storageKey, theme);
				setMode(theme);
			},
		}),
		[theme, storageKey],
	);

	return (
		<ModeProviderContext.Provider {...props} value={value}>
			{children}
		</ModeProviderContext.Provider>
	);
}

export const useMode = () => {
	const context = useContext(ModeProviderContext);

	if (context === undefined)
		throw new Error('useMode must be used within a ModeProvider');

	return context;
};

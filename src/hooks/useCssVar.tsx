import {useEffect, useState} from 'react';

export function useCssVar(name: string) {
	const [value, setValue] = useState<string>('');
	useEffect(() => {
		const read = () => {
			const v = getComputedStyle(document.documentElement)
				.getPropertyValue(name)
				.trim();

			setValue(v);
		};

		read();
		const mo = new MutationObserver(read);
		mo.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class', 'style', 'data-theme'],
		});

		return () => mo.disconnect();
	}, [name]);
	return value || '#29d';
}

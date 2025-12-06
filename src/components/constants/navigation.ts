import type {Link} from '@tanstack/react-router';
import {IdCard, type LucideIcon} from 'lucide-react';
import {PokeballIcon} from '../Icons';

export type NavigationLink = {
	icon?: LucideIcon | typeof PokeballIcon;
	id: string;
	text: string;
	props?: Parameters<typeof Link>[0];
};

export const NAVIGATION_LINKS: Array<NavigationLink> = [
	{
		id: 'sidebar_header',
		text: 'Collector',
	},
	{
		id: 'sidebar_pokedex_link',
		text: 'Pokedex',
		icon: PokeballIcon,
		props: {
			to: '/',
		},
	},
	{
		id: 'sidebar_cards_link',
		text: 'Cards',
		icon: IdCard,
		props: {
			to: '/cards/',
		},
	},
];

/** Navigation links that have a route (excludes headers and other non-link items) */
export const NAVIGABLE_LINKS = NAVIGATION_LINKS.filter(
	(
		link,
	): link is NavigationLink & {props: NonNullable<NavigationLink['props']>} =>
		link.props != null,
);

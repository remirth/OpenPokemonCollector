'use client';

import type * as React from 'react';
import {Link} from '@tanstack/react-router';

import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from '~/components/ui/navigation-menu';
import {cn} from '~/lib/utils';
import {ThemeToggle} from './Theme';

export default function Header() {
	return (
		<NavigationMenu className='z-5 h-[70px] bg-secondary-background'>
			<NavigationMenuList className='w-screen'>
				<NavigationMenuItem className=''>
					<ThemeToggle />
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}

function ListItem({
	className,
	title,
	children,
	...props
}: React.ComponentProps<'a'>) {
	return (
		<li>
			<NavigationMenuLink asChild>
				<a
					className={cn(
						'hover:bg-accent block text-main-foreground select-none space-y-1 rounded-base border-2 border-transparent p-3 leading-none no-underline outline-hidden transition-colors hover:border-border',
						className,
					)}
					{...props}
				>
					<div className='text-base font-heading leading-none'>{title}</div>
					<p className='font-base line-clamp-2 text-sm leading-snug'>
						{children}
					</p>
				</a>
			</NavigationMenuLink>
		</li>
	);
}
ListItem.displayName = 'ListItem';

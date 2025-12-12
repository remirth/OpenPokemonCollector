// biome-ignore-all lint/suspicious/noExplicitAny: We need to cast as any

import {Link} from '@tanstack/react-router';
import {ChevronLeft, ChevronRight, MoreHorizontal} from 'lucide-react';

import type * as React from 'react';

import {buttonVariants} from '~/components/ui/button';

import {cn} from '~/lib/utils';

function Pagination({className, ...props}: React.ComponentProps<'nav'>) {
	return (
		<nav
			data-slot='pagination'
			aria-label='pagination'
			className={cn('mx-auto flex w-full justify-center', className)}
			{...props}
		/>
	);
}

function PaginationContent({className, ...props}: React.ComponentProps<'ul'>) {
	return (
		<ul
			data-slot='pagination-content'
			className={cn('flex flex-row items-center gap-1', className)}
			{...props}
		/>
	);
}

function PaginationItem({className, ...props}: React.ComponentProps<'li'>) {
	return (
		<li data-slot='pagination-item' className={cn('', className)} {...props} />
	);
}

type PaginationLinkProps = Omit<React.ComponentProps<typeof Link>, 'search'> & {
	search?: unknown;
	isActive?: boolean;
	size?: 'default' | 'sm' | 'lg' | 'icon';
	disabled?: boolean;
};

function PaginationLink({
	className,
	isActive,
	size = 'icon',
	disabled,
	...props
}: PaginationLinkProps) {
	return (
		<Link
			data-slot='pagination-link'
			aria-current={isActive ? 'page' : undefined}
			aria-disabled={disabled || undefined}
			className={cn(
				buttonVariants({
					variant: 'noShadow',
					size,
				}),
				className,
				disabled && 'bg-secondary-background cursor-not-allowed',
				isActive && 'bg-black text-white',
			)}
			{...(props as any)}
		/>
	);
}

function PaginationPrevious({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			data-slot='pagination-previous'
			aria-label='Go to previous page'
			size='default'
			className={cn('gap-1 px-2.5', className)}
			{...props}
		>
			<ChevronLeft className='size-4' />
		</PaginationLink>
	);
}

function PaginationNext({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			data-slot='pagination-next'
			aria-label='Go to next page'
			size='default'
			className={cn('gap-1 px-2.5', className)}
			{...props}
		>
			<ChevronRight className='size-4' />
		</PaginationLink>
	);
}

function PaginationEllipsis({
	className,
	...props
}: React.ComponentProps<'span'>) {
	return (
		<span
			data-slot='pagination-ellipsis'
			aria-hidden
			className={cn('flex size-9 items-center justify-center', className)}
			{...props}
		>
			<MoreHorizontal className='size-4' />
			<span className='sr-only'>More pages</span>
		</span>
	);
}

export {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
};

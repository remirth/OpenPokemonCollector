import {Link} from '@tanstack/react-router';
import {cn} from '~/lib/utils';
import {NAVIGABLE_LINKS} from './constants/navigation';

export function AppTabs({className}: {className?: string}) {
	return (
		<nav
			className={cn(
				'z-50 bg-secondary-background border-t-4 border-border',
				className,
			)}
		>
			<div className='flex justify-around items-center'>
				{NAVIGABLE_LINKS.map((item) => {
					const Icon = item.icon;
					return (
						<Link
							key={item.id}
							{...item.props}
							className={cn(
								'flex flex-1 flex-col items-center justify-center gap-1 py-3 px-2',
								'text-sm font-base text-foreground/90',
								'hover:bg-main/70 hover:text-main-foreground',
								'data-[status=active]:bg-main data-[status=active]:text-main-foreground',
								'border-r-4 border-border last:border-r-0',
							)}
						>
							{Icon && <Icon className='size-5' />}
						</Link>
					);
				})}
			</div>
		</nav>
	);
}

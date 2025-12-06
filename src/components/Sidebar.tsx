import {Link} from '@tanstack/react-router';
import {cn} from '~/lib/utils';
import {NAVIGATION_LINKS} from './constants/navigation';

export function AppSidebar({className}: {className?: string}) {
	return (
		<aside
			className={cn(
				'scrollbar bg-secondary-background h-full overflow-y-auto border-r-4 border-border',
				className,
			)}
		>
			{NAVIGATION_LINKS.map((item) => {
				return item?.props == null ? (
					<div
						key={item.id}
						className='block border-b-4 border-r-4 border-border p-4 text-xl font-heading'
					>
						{item.text}
					</div>
				) : (
					<Link
						key={item.id}
						{...item.props}
						className={cn(
							'block border-b-4 border-r-4 border-border p-4 pl-7 text-lg font-base text-foreground/90 hover:bg-main/70 hover:text-main-foreground ',
							'data-[status=active]:bg-main data-[status=active]:text-main-foreground data-[status=active]:hover:bg-main flex flex-row gap-2',
						)}
					>
						<span>{item.text}</span>
					</Link>
				);
			})}
		</aside>
	);
}

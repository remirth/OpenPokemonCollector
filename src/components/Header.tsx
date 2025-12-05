import {Link} from '@tanstack/react-router';
import {Star} from 'lucide-react';
import pkg from '~/../package.json';
import {Button} from '~/components/ui/button';
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuList,
} from '~/components/ui/navigation-menu';
import {useIsMobile} from '~/hooks/use-mobile';
import {useGitHubStars} from '~/hooks/useGitHubStars';
import {cn} from '~/lib/utils';
import {GithubIcon, PokeballIcon} from './Icons';
import {ToggleMode} from './ToggleMode';
import {ToggleStyle} from './ToggleStyle';

export function Header({className}: {className?: string}) {
	const isMobile = useIsMobile();
	const {data: stars, isLoading} = useGitHubStars(!isMobile);

	return (
		<NavigationMenu
			className={cn(
				'z-5 h-full w-full bg-secondary-background rounded-none',
				className,
			)}
		>
			<NavigationMenuList className='w-screen justify-between px-6'>
				<NavigationMenuItem className='flex items-center space-x-4'>
					<Button variant='noShadow' size='icon' asChild>
						<Link to='/' aria-label='Home'>
							<PokeballIcon />
						</Link>
					</Button>
					<span className='text-sm text-muted-foreground sm:block hidden'>
						v{pkg.version}
					</span>
				</NavigationMenuItem>
				<NavigationMenuItem className='flex items-center space-x-4'>
					<span className='text-sm text-muted-foreground md:block hidden'>
						Track Your Personal Pokémon Collection
					</span>
					<Button variant='neutral' asChild>
						<a
							href='https://github.com/remirth/OpenPokemonCollector'
							target='_blank'
							rel='noopener noreferrer'
							aria-label='GitHub Repository'
							className='flex items-center justify-center md:gap-2 px-3! md:px-4 py-2'
						>
							<GithubIcon className='size-4' />
							<div className='items-center justify-center gap-0.5 hidden md:flex'>
								<span className='text-xs font-medium leading-none'>
									{isLoading ? '...' : stars ? stars.toLocaleString() : '0'}
								</span>
								<Star className='size-2.5 -mt-0.5' />
							</div>
						</a>
					</Button>
					<ToggleStyle />
					<ToggleMode />
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}

Header.displayName = 'Header';

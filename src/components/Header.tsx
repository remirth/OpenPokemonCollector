import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuList,
} from '~/components/ui/navigation-menu';
import {ToggleMode} from './ToggleMode';

export function Header() {
	return (
		<NavigationMenu className='z-5 h-[70px] bg-secondary-background'>
			<NavigationMenuList className='w-screen'>
				<NavigationMenuItem className=''>
					<ToggleMode />
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}

Header.displayName = 'Header';

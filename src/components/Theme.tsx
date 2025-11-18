import {Moon, Sun} from 'lucide-react';

import {Button} from '~/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {useTheme} from '~/contexts/theme';

export function ThemeToggle() {
	const {setTheme} = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='neutral' size='icon'>
					<Sun className='h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
					<Moon className='absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
					<span className='sr-only'>Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='bg-secondary-background'>
				<DropdownMenuItem
					className='bg-secondary-background text-black dark:text-white'
					onClick={() => setTheme('light')}
				>
					Light
				</DropdownMenuItem>
				<DropdownMenuItem
					className='bg-secondary-background text-black dark:text-white'
					onClick={() => setTheme('dark')}
				>
					Dark
				</DropdownMenuItem>
				<DropdownMenuItem
					className='bg-secondary-background text-black dark:text-white'
					onClick={() => setTheme('system')}
				>
					System
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

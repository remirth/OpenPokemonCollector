import {Moon, Sun} from 'lucide-react';

import {Button} from '~/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {MODES, useMode} from '~/contexts/mode';

export function ToggleMode() {
	const {setMode} = useMode();

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
				{MODES.map((mode) => (
					<DropdownMenuItem
						key={mode.value}
						className='bg-secondary-background text-black dark:text-white'
						onClick={() => setMode(mode.value)}
					>
						{mode.name}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

ToggleMode.displayName = 'ToggleMode';

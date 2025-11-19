import {PaintBucket} from 'lucide-react';

import {Button} from '~/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {STYLES, useStyle} from '~/contexts/style';

export function ToggleStyle() {
	const {setStyle} = useStyle();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='neutral' size='icon'>
					<PaintBucket className='h-[1.2rem] w-[1.2rem]' />
					<span className='sr-only'>Toggle style</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='bg-secondary-background'>
				{STYLES.map((styleOption) => (
					<DropdownMenuItem
						key={styleOption.value}
						className='bg-secondary-background text-black dark:text-white'
						onClick={() => setStyle(styleOption.value)}
					>
						{styleOption.name}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

ToggleStyle.displayName = 'ToggleStyle';

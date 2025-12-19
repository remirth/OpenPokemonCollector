import {CheckIcon, ChevronsUpDown} from 'lucide-react';
import * as React from 'react';

import {Button} from '~/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '~/components/ui/command';
import {Popover, PopoverContent, PopoverTrigger} from '~/components/ui/popover';
import {cn} from '~/lib/utils';

export type MultiSelectOption = {
	value: string;
	label: string;
};

export type MultiSelectProps = {
	options: MultiSelectOption[];
	value?: string[];
	defaultValue?: string[];
	onValueChange?: (values: string[]) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyLabel?: string;
	className?: string;
	buttonClassName?: string;
	commandClassName?: string;
	searchable?: boolean;
	disabled?: boolean;
	buttonProps?: React.ComponentProps<typeof Button>;
};

export function MultiSelect({
	options,
	value,
	defaultValue,
	onValueChange,
	placeholder = 'Select items...',
	searchPlaceholder = 'Search...',
	emptyLabel = 'No results found.',
	searchable = true,
	commandClassName,
	className,
	buttonClassName,
	buttonProps,
	disabled,
}: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);
	const isControlled = value !== undefined;
	const [internal, setInternal] = React.useState<string[]>(defaultValue ?? []);

	const selectedValues = isControlled && value != null ? value : internal;

	const toggleValue = React.useCallback(
		(v: string) => {
			const exists = selectedValues.includes(v);
			const next = exists
				? selectedValues.filter((x) => x !== v)
				: [...selectedValues, v];

			if (!isControlled) setInternal(next);
			onValueChange?.(next);
		},
		[isControlled, onValueChange, selectedValues],
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					{...buttonProps}
					role='combobox'
					aria-expanded={open}
					disabled={disabled}
					className={cn('w-fit min-w-70 justify-between', buttonClassName)}
				>
					{selectedValues.length > 0
						? `${selectedValues.length} selected`
						: placeholder}
					<ChevronsUpDown className='text-muted-foreground' />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className={cn('w-75 p-0 border-0', className)}
				align='start'
			>
				<Command className='**:data-[slot=command-input-wrapper]:h-11'>
					{searchable && (
						<CommandInput
							placeholder={searchPlaceholder}
							className={commandClassName}
						/>
					)}
					<CommandList>
						<CommandEmpty>{emptyLabel}</CommandEmpty>
						<CommandGroup
							className={cn(
								'p-2 **:[[cmdk-group-items]]:flex **:[[cmdk-group-items]]:flex-col **:[[cmdk-group-items]]:gap-1',
								commandClassName,
							)}
						>
							{options.map((opt) => {
								const isSelected = selectedValues.includes(opt.value);
								return (
									<CommandItem
										key={opt.value}
										value={opt.value}
										className='text-current'
										onSelect={(currentValue) => toggleValue(currentValue)}
									>
										<div
											className='border-border pointer-events-none size-5 shrink-0 rounded-base border-2 transition-all select-none *:[svg]:opacity-0 data-[selected=true]:*:[svg]:opacity-100'
											data-selected={isSelected}
										>
											<CheckIcon className='size-4 text-current' />
										</div>
										{opt.label}
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

MultiSelect.displayName = 'MultiSelect';

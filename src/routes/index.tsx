import {debounce} from '@tanstack/react-pacer';
import {createFileRoute, redirect, useNavigate} from '@tanstack/react-router';
import {scope} from 'arktype';
import {pascalCase} from 'change-case';
import {ChevronDown, Filter} from 'lucide-react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {truncate} from 'remeda';
import {Button} from '~/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import ImageCard from '~/components/ui/image-card';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';
import {MultiSelect} from '~/components/ui/multi-select';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '~/components/ui/pagination';
import {Skeleton} from '~/components/ui/skeleton';
import type {SelectEntity} from '~/db/schema';
import {Entities} from '~/hooks/useEntities';
import {AssertionError} from '~/lib/errors';
import {cn, useQCFromCtx} from '~/lib/utils';

const s = scope({
	kind: "'pokemon'|'trainer'|'energy'",
	kindArray: 'kind[]',
	search: {
		'page?': 'number.integer >= 0',
		'pageSize?': 'number.integer >= 0',
		'kind?': 'kind[] | kind',
		'q?': 'string',
	},
});

const pokedexSearchSchema = s.export('search').search;
const kindArraySchema = s.export('kindArray').kindArray;
type PokedexSearch = typeof pokedexSearchSchema.infer;
type KindArray = typeof kindArraySchema.infer;

export const Route = createFileRoute('/')({
	component: HomeComponent,
	validateSearch: (s: PokedexSearch): PokedexSearch =>
		pokedexSearchSchema.assert(s),
	loader: async (ctx) => {
		const queryClient = useQCFromCtx(ctx);
		const search = pokedexSearchSchema.assert(ctx.location.search);
		const props: Entities.UseEntitiesProps = {
			query: search.q,
			page: search.page ?? 0,
			pageSize: search.pageSize ?? 50,
			kind: search.kind
				? kindArraySchema.assert(
						Array.isArray(search.kind) ? search.kind : [search.kind],
					)
				: undefined,
		};

		const count = await Entities.loadCount(queryClient, props);
		if (props.page * props.pageSize > count) {
			throw redirect({
				to: '/',
				search: {
					q: props.query,
					pageSize: props.pageSize,
					kind: props.kind,
					page: Math.floor(count / props.pageSize),
				},
			});
		}

		await Entities.loadEntities(queryClient, props);
	},
});

const api = Route;

const MULTI_SELECT_OPTIONS = [
	{label: 'Pokémon', value: 'pokemon'},
	{label: 'Trainer', value: 'trainer'},
	{label: 'Energy', value: 'energy'},
];

function usePokedexForm() {
	const nav = api.useNavigate();

	return useMemo(
		() => ({
			inputChanged: debounce(
				(e: React.ChangeEvent<HTMLInputElement>) => {
					nav({search: (prev) => ({...prev, q: e.target.value})});
				},
				{key: 'navigate', wait: 300},
			),
			multiSelectChanged: debounce(
				(lst: string[]) => {
					const kind = kindArraySchema.assert(lst);
					nav({search: (prev) => ({...prev, kind})});
				},
				{key: 'navigate', wait: 300},
			),
		}),
		[nav],
	);
}

const ALL_ENTITY_KINDS: KindArray = ['pokemon', 'energy', 'trainer'];

function HomeComponent() {
	const search = api.useSearch();

	const pageProps: Entities.UseEntitiesProps = useMemo(
		() => ({
			page: search.page ?? 0,
			pageSize: search.pageSize ?? 50,
			query: search.q,
			kind: search.kind
				? kindArraySchema.assert(
						Array.isArray(search.kind) ? search.kind : [search.kind],
					)
				: undefined,
		}),
		[search.page, search.pageSize, search.q, search.kind],
	);

	const entities = Entities.useEntities(pageProps);
	const count = Entities.useEntityCount(pageProps);

	const items = useMemo(
		() => Array.from({length: pageProps.pageSize}).fill(0),
		[pageProps.pageSize],
	);

	const [lastLength, updateLastLength] = useState(pageProps.pageSize);
	useEffect(() => {
		entities.data?.length != null && updateLastLength(entities.data.length);
	}, [entities.data?.length]);

	return (
		<section className='grid grid-rows-12 h-full w-full md:p-8 md:gap-4'>
			<PokedexFilter
				id='large_screen_filter'
				className='[@media(min-height:900px)]:md:row-span-2 [@media(min-height:900px)]:md:flex hidden md:max-w-fit'
				pageProps={pageProps}
			/>
			<Card className='flex flex-col gap-4 w-full [@media(min-height:900px)]:md:flex:row-span-10 row-span-12 min-h-full'>
				<CardHeader className='md:flex border-b hidden pb-4!'>
					<CardNav
						id='card_header_navigation'
						pageProps={pageProps}
						page={pageProps.page}
						pageSize={pageProps.pageSize}
						length={entities.data?.length}
						maxCount={count.data}
					/>
				</CardHeader>
				<CardContent className='flex flex-row flex-wrap gap-4 align-middle w-full h-full pb-16 overflow-y-auto scrollbar content-start'>
					{items.map((_, i) => {
						return (
							<EntityCard
								// biome-ignore lint/suspicious/noArrayIndexKey: We want to avoid full repaint
								key={i}
								entity={entities.data?.[i]}
								isLoading={entities.isLoading}
								index={i}
								className={cn(
									i >= lastLength && 'hidden',
									'max-w-32 [@media(min-height:900px)]:max-w-44 h-fit',
								)}
							/>
						);
					})}
					{lastLength === 0 && (
						<p className='w-full text-center font-light'>
							Search yielded no results.
						</p>
					)}
				</CardContent>

				<CardFooter className='flex border-t md:hidden'>
					<CardNav
						id='card_footer_navigation'
						pageProps={pageProps}
						page={pageProps.page}
						pageSize={pageProps.pageSize}
						length={entities.data?.length}
						maxCount={count.data}
					/>
				</CardFooter>
			</Card>
		</section>
	);
}
type EntityProps = {
	entity?: SelectEntity & {id: number};
	index: number;
	isLoading: boolean;
};
function EntityCard({
	entity,
	isLoading,
	index,
	className,
	...props
}: EntityProps & Partial<React.ComponentProps<typeof ImageCard>>) {
	const label = useMemo(() => {
		if (entity?.pokedexNumber) return String(entity.pokedexNumber);
		else if (entity?.entityKind) return pascalCase(entity.entityKind);
		return undefined;
	}, [entity?.pokedexNumber, entity?.entityKind]);

	return (
		<Button className={cn(className, 'p-0')}>
			<ImageCard
				{...props}
				aspectRatio='4/3'
				figCaptionProps={{className: 'h-18 min-h-fit'}}
				className={'shadow-none drop-shadow-none border-none'}
				isLoading={isLoading || entity == null}
				imageUrl={entity?.imageUrl}
				backupUrl={entity?.backupImageUrl}
				label={label}
				alt={entity?.name ?? 'Loading'}
				caption={<Caption entity={entity} />}
			/>
		</Button>
	);
}

function Caption({entity}: {entity?: SelectEntity}) {
	if (!entity) {
		return <Skeleton className='w-full h-4' />;
	}

	return (
		<span className='w-full h-full items-start flex text-wrap text-left text-[1.0rem]'>
			{truncate(entity.name, 30, {omission: '...'})}
		</span>
	);
}

const PokedexPagination = ({
	hasMore,
	...props
}: {hasMore: boolean} & React.ComponentProps<'nav'>) => {
	const search = api.useSearch();
	const page = search.page ?? 0;
	const displayPage = page + 1;

	return (
		<Pagination {...props}>
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious
						preload='viewport'
						disabled={page === 0}
						to={api.path}
						search={{...search, page: page > 0 ? page - 1 : page}}
					/>
				</PaginationItem>
				<PaginationItem>
					<PaginationLink
						preload='viewport'
						to={api.path}
						search={{...search, page}}
						isActive
					>
						{displayPage}
					</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationNext
						preload='viewport'
						disabled={!hasMore}
						to={api.path}
						search={{...search, page: page + 1}}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
};

function CardNav(props: {
	pageSize: number;
	maxCount?: number;
	length?: number;
	page: number;
	id: string;
	pageProps: Entities.UseEntitiesProps;
}) {
	const offset = props.page * props.pageSize;
	const offsetPlusLength = offset + (props.length ?? props.pageSize);
	const hasMore = props.maxCount != null && props.maxCount > offsetPlusLength;

	return (
		<section className='flex flex-row justify-between w-full'>
			<CardTitle className='font-light xs:block hidden'>
				{offset} — {offsetPlusLength} out of {props.maxCount ?? '...'}
			</CardTitle>
			<CardDescription className='flex flex-row flex-wrap gap-2'>
				<Dialog>
					<DialogTrigger asChild>
						<Button
							className='px-2.5 block [@media(min-height:900px)]:md:hidden'
							variant='noShadow'
						>
							<Filter className='size-4' />
						</Button>
					</DialogTrigger>

					<DialogContent className='p-3'>
						<DialogHeader>
							<DialogTitle>Pokedex</DialogTitle>
							<DialogDescription>
								Query the Pokedex here using a free text search or filter based
								on Supertypes.
							</DialogDescription>
						</DialogHeader>

						<PokedexFilter
							pageProps={props.pageProps}
							className='w-full'
							id={`${props.id}_filter`}
						/>
					</DialogContent>
				</Dialog>
				<PokedexPageSize pageSize={props.pageSize} />
				<PokedexPagination className='mx-0 w-fit' hasMore={hasMore} />
			</CardDescription>
		</section>
	);
}

function PokedexPageSize({
	pageSize,
	...props
}: {pageSize: number} & React.ComponentProps<typeof DropdownMenu>) {
	const navigate = useNavigate();
	const update = useCallback(
		(value: string) => {
			const size = Number.parseInt(value, 10);
			AssertionError.isNotNaN('Selected page size', size);

			navigate({search: (prev) => ({...prev, pageSize: size}) as never});
		},
		[navigate],
	);
	return (
		<DropdownMenu {...props}>
			<DropdownMenuTrigger asChild>
				<Button className='bg-background text-foreground' variant='noShadow'>
					{pageSize}
					<ChevronDown />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align='start'
				className='w-20 bg-background text-foreground'
			>
				<DropdownMenuLabel inset>Page Size</DropdownMenuLabel>
				<DropdownMenuGroup>
					<DropdownMenuRadioGroup
						value={String(pageSize)}
						onValueChange={update}
					>
						<DropdownMenuRadioItem value='50'>50</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value='100'>100</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value='150'>150</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

type PokedexFilterProps = {
	pageProps: Entities.UseEntitiesProps;
	id: string;
} & React.ComponentProps<typeof Card>;

function PokedexFilter({
	pageProps,
	className,
	id,
	...rest
}: PokedexFilterProps) {
	const {inputChanged, multiSelectChanged} = usePokedexForm();

	return (
		<Card className={cn('h-full  w-full gap-4', className)} id={id} {...rest}>
			<CardHeader className='hidden [@media(min-height:1000px)]:block'>
				<CardTitle>Pokedex</CardTitle>
			</CardHeader>
			<CardContent className='[@media(min-height:800px)]:mx-8 flex flex-col md:gap-2 gap-0.5 h-full flex-wrap md:pb-2 w-fit items-left content-center'>
				<div className='flex flex-col gap-1 shrink w-fit max-w-60'>
					<Label
						className='ml-1'
						htmlFor={`${id}_search`}
						id={`${id}_search_label`}
					>
						Name
					</Label>
					<Input
						aria-labelledby={`${id}_search_label`}
						id={`${id}_search`}
						name='search'
						defaultValue={pageProps.query}
						className=''
						placeholder='Search...'
						onChange={inputChanged}
					/>
				</div>
				<div className='flex flex-col gap-1'>
					<Label
						className='ml-1'
						id={`${id}_entity_kind_label`}
						htmlFor={`${id}_entity_kind`}
					>
						Supertypes
					</Label>
					<MultiSelect
						buttonProps={{
							variant: 'noShadow',
							id: `${id}_entity_kind`,
							'aria-labelledby': `${id}_entity_kind_label`,
						}}
						searchable={false}
						onValueChange={multiSelectChanged}
						buttonClassName='max-w-60 min-w-40 bg-neutral text-foreground'
						commandClassName='bg-background text-foreground'
						className='max-w-40'
						options={MULTI_SELECT_OPTIONS}
						defaultValue={pageProps.kind ?? ALL_ENTITY_KINDS}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

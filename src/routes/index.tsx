import {debounce} from '@tanstack/react-pacer';
import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {scope} from 'arktype';
import {pascalCase} from 'change-case';
import {ChevronDown} from 'lucide-react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {Button} from '~/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/ui/card';
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

export const Route = createFileRoute('/')({
	component: HomeComponent,
	validateSearch: (s: PokedexSearch): PokedexSearch =>
		pokedexSearchSchema.assert(s),
	loader: async (ctx) => {
		const queryClient = useQCFromCtx(ctx);
		const search = pokedexSearchSchema.assert(ctx.location.search);

		await Entities.load(queryClient, {
			query: search.q,
			page: search.page ?? 0,
			pageSize: search.pageSize ?? 50,
			kind: search.kind
				? kindArraySchema.assert(
						Array.isArray(search.kind) ? search.kind : [search.kind],
					)
				: ['pokemon', 'energy', 'trainer'],
		});
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
				{key: 'navigate', wait: 1000},
			),
		}),
		[nav],
	);
}

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
				: ['pokemon', 'energy', 'trainer'],
		}),
		[search.page, search.pageSize, search.q, search.kind],
	);
	const state = Entities.useEntities(pageProps);
	const count = Entities.useEntityCount(pageProps);

	const items = useMemo(
		() => Array.from({length: pageProps.pageSize}).fill(0),
		[pageProps.pageSize],
	);

	const {inputChanged, multiSelectChanged} = usePokedexForm();
	const [lastLength, updateLastLength] = useState(pageProps.pageSize);
	useEffect(() => {
		state.data?.length != null && updateLastLength(state.data.length);
	}, [state.data?.length]);

	return (
		<section className='grid grid-rows-12 h-full w-full p-8 gap-4'>
			<Card className='row-span-2 max-w-fit gap-4'>
				<CardHeader>
					<CardTitle>Pokedex</CardTitle>
				</CardHeader>
				<CardContent className='mx-8 max-w-80 flex flex-col gap-2 w-80'>
					<Input
						defaultValue={search.q}
						placeholder='Search Query...'
						onChange={inputChanged}
					/>
					<MultiSelect
						searchable={false}
						onValueChange={multiSelectChanged}
						buttonClassName='max-w-60 min-w-40 bg-neutral text-foreground'
						commandClassName='bg-background text-foreground'
						className='max-w-40'
						buttonVariant='noShadow'
						options={MULTI_SELECT_OPTIONS}
						defaultValue={pageProps.kind}
					/>
				</CardContent>
			</Card>
			<Card className='flex flex-col gap-4  overflow-y-auto w-full row-span-10 min-h-full'>
				<CardHeader className='flex flex-row justify-between border-b'>
					<CardTitle className='font-light'>
						{pageProps.page * pageProps.pageSize} —{' '}
						{pageProps.page * pageProps.pageSize +
							(state.data?.length ?? pageProps.pageSize)}{' '}
						out of {count.data ?? '...'}
					</CardTitle>
					<CardDescription className='flex flex-row gap-2'>
						<PokedexPageSize pageSize={pageProps.pageSize} />
						<PokedexPagination
							className='mx-0 w-fit'
							hasMore={(state.data?.length ?? 0) >= pageProps.pageSize}
						/>
					</CardDescription>
				</CardHeader>
				<CardContent className='flex flex-row flex-wrap gap-4 align-middle w-full h-fit pb-16'>
					{items.map((_, i) => {
						return (
							<EntityCard
								// biome-ignore lint/suspicious/noArrayIndexKey: We want to avoid full repaint
								key={i}
								entity={state.data?.[i]}
								isLoading={state.isLoading}
								index={i}
								className={cn(i >= lastLength && 'hidden')}
							/>
						);
					})}
				</CardContent>
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
	return (
		<ImageCard
			{...props}
			className={cn('max-w-44', className)}
			isLoading={isLoading || entity == null}
			imageUrl={entity?.imageUrl}
			alt={entity?.name ?? 'Loading'}
			caption={<Caption entity={entity} />}
		/>
	);
}

function Caption({entity}: {entity?: SelectEntity}) {
	if (!entity) {
		return <Skeleton className='w-full h-6' />;
	}

	return (
		<span className='flex justify-between flex-wrap gap-2'>
			<span>{entity.pokedexNumber ?? pascalCase(entity.entityKind)}</span>{' '}
			{entity.name}
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
						search={{...search, page: page > 0 ? page - 1 : page} as unknown}
					/>
				</PaginationItem>
				<PaginationItem>
					<PaginationLink
						preload='viewport'
						to={api.path}
						search={{...search, page} as unknown}
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
						search={{...search, page: page + 1} as unknown}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
};

export default function PokedexPageSize({
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

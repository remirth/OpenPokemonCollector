import {debounce} from '@tanstack/react-pacer';
import {createFileRoute, redirect, useNavigate} from '@tanstack/react-router';
import {scope} from 'arktype';
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
import {Artists} from '~/hooks/useArtists';
import {Cards} from '~/hooks/useCards';
import {Rarities} from '~/hooks/useRarities';
import {Sets} from '~/hooks/useSets';
import {AssertionError} from '~/lib/errors';
import {cn, useQCFromCtx} from '~/lib/utils';

const s = scope({
	numberArray: 'number.integer[]',
	search: {
		'page?': 'number.integer >= 0',
		'pageSize?': 'number.integer >= 0',
		'sets?': 'number.integer[] | number.integer',
		'artists?': 'number.integer[] | number.integer',
		'rarities?': 'number.integer[] | number.integer',
		'entities?': 'number.integer[] | number.integer',
		'q?': 'string',
	},
});

const cardSearchSchema = s.export('search').search;
export const numberArraySchema = s.export('numberArray').numberArray;
export type CardSearch = typeof cardSearchSchema.infer;
export type NumberArray = typeof numberArraySchema.infer;

export const Route = createFileRoute('/cards/')({
	component: CardComponent,
	validateSearch: (s: CardSearch): CardSearch => cardSearchSchema.assert(s),
	loader: async (ctx) => {
		const queryClient = useQCFromCtx(ctx);
		const search = cardSearchSchema.assert(ctx.location.search);
		const props = Cards.propsFromCardSearch(search);

		await Promise.all([
			Sets.loadSets(queryClient),
			Artists.loadArtists(queryClient),
			Rarities.loadRarities(queryClient),
		]);

		await Cards.runLoader(queryClient, props, (count) => {
			throw redirect({
				to: '/cards',
				search: {
					q: props.query,
					pageSize: props.pageSize,
					sets: props.sets,
					artists: props.artists,
					rarities: props.rarities,
					entities: props.entities,
					page: Math.floor(count / props.pageSize),
				},
			});
		});
	},
});

const api = Route;

function useCardsForm() {
	const nav = api.useNavigate();

	return useMemo(
		() => ({
			inputChanged: debounce(
				(e: React.ChangeEvent<HTMLInputElement>) => {
					nav({search: (prev) => ({...prev, q: e.target.value})});
				},
				{key: 'navigate', wait: 300},
			),
			setsChanged: debounce(
				(lst: string[]) => {
					const sets = numberArraySchema.assert(lst.map(Number));
					nav({search: (prev) => ({...prev, sets})});
				},
				{key: 'navigate', wait: 300},
			),
			artistsChanged: debounce(
				(lst: string[]) => {
					const artists = numberArraySchema.assert(lst.map(Number));
					nav({search: (prev) => ({...prev, artists})});
				},
				{key: 'navigate', wait: 300},
			),
			raritiesChanged: debounce(
				(lst: string[]) => {
					const rarities = numberArraySchema.assert(lst.map(Number));
					nav({search: (prev) => ({...prev, rarities})});
				},
				{key: 'navigate', wait: 300},
			),
			entitiesChanged: debounce(
				(lst: string[]) => {
					const entities = numberArraySchema.assert(lst.map(Number));
					nav({search: (prev) => ({...prev, entities})});
				},
				{key: 'navigate', wait: 300},
			),
		}),
		[nav],
	);
}

function CardComponent() {
	const search = api.useSearch();

	const pageProps: Cards.UseCardsProps = useMemo(
		() =>
			Cards.propsFromCardSearch({
				q: search.q,
				page: search.page,
				pageSize: search.pageSize,
				sets: search.sets,
				artists: search.artists,
				rarities: search.rarities,
				entities: search.entities,
			}),
		[
			search.page,
			search.pageSize,
			search.q,
			search.sets,
			search.artists,
			search.rarities,
			search.entities,
		],
	);

	const cards = Cards.useCards(pageProps);
	const count = Cards.useCardCount(pageProps);

	const items = useMemo(
		() => Array.from({length: pageProps.pageSize}).fill(0),
		[pageProps.pageSize],
	);

	const [lastLength, updateLastLength] = useState(pageProps.pageSize);
	useEffect(() => {
		cards.data?.length != null && updateLastLength(cards.data.length);
	}, [cards.data?.length]);

	return (
		<section className='grid grid-rows-12 h-full w-full md:p-8 md:gap-4'>
			<CardsFilter
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
						length={cards.data?.length}
						maxCount={count.data}
					/>
				</CardHeader>
				<CardContent className='flex flex-row flex-wrap gap-4 align-middle w-full h-full pb-16 overflow-y-auto scrollbar content-start'>
					{items.map((_, i) => {
						return (
							<CardCard
								// biome-ignore lint/suspicious/noArrayIndexKey: We want to avoid full repaint
								key={i}
								card={cards.data?.[i]}
								isLoading={cards.isLoading}
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
						length={cards.data?.length}
						maxCount={count.data}
					/>
				</CardFooter>
			</Card>
		</section>
	);
}

type CardCardProps = {
	card?: {
		cards: {
			id: number;
			name: string;
			numberInSet: string | null;
			imageUrl: string;
			backupImageUrl: string;
		};
	};
	index: number;
	isLoading: boolean;
};

function CardCard({
	card,
	isLoading,
	index,
	className,
	...props
}: CardCardProps & Partial<React.ComponentProps<typeof ImageCard>>) {
	const label = useMemo(() => {
		if (card?.cards.numberInSet) return card.cards.numberInSet;
		return undefined;
	}, [card?.cards.numberInSet]);

	return (
		<Button className={cn(className, 'p-0')}>
			<ImageCard
				{...props}
				aspectRatio='4/6'
				figCaptionProps={{className: 'h-18 min-h-fit'}}
				className={'shadow-none drop-shadow-none border-none'}
				isLoading={isLoading || card == null}
				imageUrl={card?.cards.imageUrl}
				backupUrl={card?.cards.backupImageUrl}
				label={label}
				alt={card?.cards.name ?? 'Loading'}
				caption={<Caption card={card?.cards} />}
			/>
		</Button>
	);
}

function Caption({
	card,
}: {
	card?:
		| {
				id: number;
				name: string;
				numberInSet: string | null;
				imageUrl: string;
				backupImageUrl: string;
		  }
		| undefined;
}) {
	if (!card) {
		return <Skeleton className='w-full h-4' />;
	}

	return (
		<span className='w-full h-full items-start flex text-wrap text-left text-[1.0rem]'>
			{truncate(card.name, 30, {omission: '...'})}
		</span>
	);
}

const CardsPagination = ({
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
	pageProps: Cards.UseCardsProps;
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
							<DialogTitle>Cards</DialogTitle>
							<DialogDescription>
								Search and filter cards by name, set, artist, rarity, or
								Pokémon.
							</DialogDescription>
						</DialogHeader>

						<CardsFilter
							pageProps={props.pageProps}
							className='w-full'
							id={`${props.id}_filter`}
						/>
					</DialogContent>
				</Dialog>
				<CardsPageSize pageSize={props.pageSize} />
				<CardsPagination className='mx-0 w-fit' hasMore={hasMore} />
			</CardDescription>
		</section>
	);
}

function CardsPageSize({
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

type CardsFilterProps = {
	pageProps: Cards.UseCardsProps;
	id: string;
} & React.ComponentProps<typeof Card>;

function CardsFilter({pageProps, className, id, ...rest}: CardsFilterProps) {
	const {
		inputChanged,
		setsChanged,
		artistsChanged,
		raritiesChanged,
		entitiesChanged,
	} = useCardsForm();

	const sets = Sets.useSets();
	const artists = Artists.useArtists();
	const rarities = Rarities.useRarities();

	const setsOptions = useMemo(
		() =>
			sets.data?.map((s) => ({
				label: s.name,
				value: String(s.id),
			})) ?? [],
		[sets.data],
	);

	const artistsOptions = useMemo(
		() =>
			artists.data?.map((a) => ({
				label: a.name,
				value: String(a.id),
			})) ?? [],
		[artists.data],
	);

	const raritiesOptions = useMemo(
		() =>
			rarities.data?.map((r) => ({
				label: r.name,
				value: String(r.id),
			})) ?? [],
		[rarities.data],
	);

	const defaultSets = useMemo(
		() => pageProps.sets?.map(String) ?? [],
		[pageProps.sets],
	);

	const defaultArtists = useMemo(
		() => pageProps.artists?.map(String) ?? [],
		[pageProps.artists],
	);

	const defaultRarities = useMemo(
		() => pageProps.rarities?.map(String) ?? [],
		[pageProps.rarities],
	);

	return (
		<Card className={cn('h-full w-full gap-4', className)} id={id} {...rest}>
			<CardHeader className='hidden [@media(min-height:1000px)]:block'>
				<CardTitle>Cards</CardTitle>
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
						id={`${id}_sets_label`}
						htmlFor={`${id}_sets`}
					>
						Sets
					</Label>
					<MultiSelect
						buttonProps={{
							variant: 'noShadow',
							id: `${id}_sets`,
							'aria-labelledby': `${id}_sets_label`,
						}}
						searchable={true}
						onValueChange={setsChanged}
						buttonClassName='max-w-60 min-w-40 bg-neutral text-foreground'
						commandClassName='bg-background text-foreground'
						className='max-w-40'
						options={setsOptions}
						defaultValue={defaultSets}
					/>
				</div>
				<div className='flex flex-col gap-1'>
					<Label
						className='ml-1'
						id={`${id}_artists_label`}
						htmlFor={`${id}_artists`}
					>
						Artists
					</Label>
					<MultiSelect
						buttonProps={{
							variant: 'noShadow',
							id: `${id}_artists`,
							'aria-labelledby': `${id}_artists_label`,
						}}
						searchable={true}
						onValueChange={artistsChanged}
						buttonClassName='max-w-60 min-w-40 bg-neutral text-foreground'
						commandClassName='bg-background text-foreground'
						className='max-w-40'
						options={artistsOptions}
						defaultValue={defaultArtists}
					/>
				</div>
				<div className='flex flex-col gap-1'>
					<Label
						className='ml-1'
						id={`${id}_rarities_label`}
						htmlFor={`${id}_rarities`}
					>
						Rarities
					</Label>
					<MultiSelect
						buttonProps={{
							variant: 'noShadow',
							id: `${id}_rarities`,
							'aria-labelledby': `${id}_rarities_label`,
						}}
						searchable={true}
						onValueChange={raritiesChanged}
						buttonClassName='max-w-60 min-w-40 bg-neutral text-foreground'
						commandClassName='bg-background text-foreground'
						className='max-w-40'
						options={raritiesOptions}
						defaultValue={defaultRarities}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

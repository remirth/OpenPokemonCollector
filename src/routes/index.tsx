import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {type} from 'arktype';
import {pascalCase} from 'change-case';
import {ChevronDown} from 'lucide-react';
import {useCallback, useMemo} from 'react';
import {Button} from '~/components/ui/button';
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
import {useQCFromCtx} from '~/lib/utils';

const pokedexSearchSchema = type({
	'page?': 'number.integer >= 0',
	'pageSize?': 'number.integer >= 0',
});

type PokedexSearch = typeof pokedexSearchSchema.infer;

export const Route = createFileRoute('/')({
	component: HomeComponent,
	validateSearch: (s: PokedexSearch): PokedexSearch =>
		pokedexSearchSchema.assert(s),
	loader: async (ctx) => {
		const queryClient = useQCFromCtx(ctx);
		const search = pokedexSearchSchema.assert(ctx.location.search);

		await Entities.load(queryClient, {
			page: search.page ?? 0,
			pageSize: search.pageSize ?? 50,
		});
	},
});

const api = Route;

function HomeComponent() {
	const search = api.useSearch();

	const pageSize = search.pageSize ?? 50;
	const state = Entities.useEntities({
		page: search.page ?? 0,
		pageSize,
	});

	const items = useMemo(
		() => Array.from({length: state.data?.length ?? pageSize}).fill(0),
		[state.data?.length, pageSize],
	);

	return (
		<div className='w-full max-w-fit flex flex-col p-4 gap-2 relative'>
			<div className='flex flex-row gap-2'>
				<PokedexPageSize pageSize={pageSize} />
				<PokedexPagination
					className='mx-0 w-fit'
					hasMore={(state.data?.length ?? 0) >= pageSize}
				/>
			</div>
			<div className='flex flex-row flex-wrap gap-2 align-middle w-full h-fit pb-16 max-w-fit'>
				{items.map((_, i) => {
					return (
						<EntityCard
							key={state.data?.[i]?.id ?? i}
							entity={state.data?.[i]}
							isLoading={state.isLoading}
							index={i}
						/>
					);
				})}
			</div>
		</div>
	);
}
type EntityProps = {
	entity?: SelectEntity & {id: number};
	index: number;
	isLoading: boolean;
};
function EntityCard({entity, isLoading}: EntityProps) {
	return (
		<ImageCard
			className='max-w-44'
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
				<Button
					variant='noShadow'
					className='bg-secondary-background text-black dark:text-white'
				>
					{pageSize}
					<ChevronDown />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='start' className='w-56'>
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

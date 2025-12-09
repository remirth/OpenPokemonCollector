import {createFileRoute} from '@tanstack/react-router';
import {type} from 'arktype';
import {pascalCase} from 'change-case';
import {useMemo} from 'react';
import ImageCard from '~/components/ui/image-card';
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '~/components/ui/pagination';
import {Skeleton} from '~/components/ui/skeleton';
import type {SelectEntity} from '~/db/schema';
import {Entities} from '~/hooks/useEntities';
import {useQCFromCtx} from '~/lib/utils';

const pokedexSearchSchema = type({
	'page?': 'number.integer',
	'pageSize?': 'number.integer',
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
		<div className='flex flex-row flex-wrap gap-2 align-middle w-full h-fit p-4 pb-16'>
			<PokedexPagination hasMore={(state.data?.length ?? 0) >= pageSize} />
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
	);
}
type EntityProps = {
	entity?: SelectEntity & {id: number};
	index: number;
	isLoading: boolean;
};
function EntityCard({entity, isLoading}: EntityProps) {
	const image = Entities.useEntityImage({
		id: entity?.id,
		imageUrl: entity?.imageUrl,
	});

	return (
		<ImageCard
			className='max-w-44'
			isLoading={isLoading || image.isLoading || !image.data}
			imageUrl={image.data ?? ''}
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

const PokedexPagination = ({hasMore}: {hasMore: boolean}) => {
	const search = api.useSearch();
	const page = search.page ?? 0;
	const displayPage = page + 1;

	return (
		<Pagination>
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
						disabled={page === 0}
						to={api.path}
						search={{...search, page: page > 0 ? page - 1 : page} as unknown}
					>
						{displayPage - 1}
					</PaginationLink>
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
				<div className='items-center md:flex hidden'>
					<PaginationItem>
						<PaginationLink
							preload='viewport'
							disabled={!hasMore}
							to={api.path}
							search={{...search, page: page + 1} as unknown}
						>
							{displayPage + 1}
						</PaginationLink>
					</PaginationItem>
					<PaginationItem>
						<PaginationEllipsis />
					</PaginationItem>
				</div>
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

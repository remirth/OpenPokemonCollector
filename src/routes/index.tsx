import {createFileRoute} from '@tanstack/react-router';
import {type} from 'arktype';
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
import {useEntities} from '~/hooks/useEntities';

const pokedexSearchSchema = type({
	'page?': 'number.integer',
	'pageSize?': 'number.integer',
});

type PokedexSearch = {
	page?: number;
	pageSize?: number;
};

export const Route = createFileRoute('/')({
	component: HomeComponent,
	validateSearch: (s: PokedexSearch): PokedexSearch =>
		pokedexSearchSchema.assert(s),
});

const api = Route;

function HomeComponent() {
	const search = api.useSearch();

	const pageSize = search.pageSize ?? 50;

	const state = useEntities(search.page, 50);

	return (
		<div className='flex flex-row flex-wrap gap-2 align-middle w-full h-fit p-4 pb-16'>
			<PokedexPagination hasMore={(state.data?.length ?? 0) >= pageSize} />
			{state.data?.map((ent) => (
				<ImageCard
					key={ent.id}
					imageUrl={ent.imageUrl ?? ''}
					alt={ent.name}
					caption={`${ent.pokedexNumber}: ${ent.name}`}
					className='max-w-40'
				/>
			))}
		</div>
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
						disabled={page === 0}
						to={api.path}
						search={{...search, page: page - 1} as unknown}
					/>
				</PaginationItem>
				<PaginationItem>
					<PaginationLink
						disabled={page === 0}
						to={api.path}
						search={{...search, page: page - 1} as unknown}
					>
						{displayPage - 1}
					</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationLink
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
						disabled={!hasMore}
						to={api.path}
						search={{...search, page: page + 1} as unknown}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
};

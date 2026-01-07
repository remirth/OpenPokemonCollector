import {type QueryClient, useQuery} from '@tanstack/react-query';
import type {EntityKind} from 'scripts/schemas';
import {RepositoryContext} from '~/repositories';
import {kindArraySchema, type PokedexSearch} from '~/routes';

export namespace Entities {
	export type UseEntitiesProps = {
		page: number;
		pageSize: number;
		kind?: Array<EntityKind>;
		query?: string;
	};

	export type UseEntityCountProps = Omit<UseEntitiesProps, 'page' | 'pageSize'>;

	export function propsFromPokedexSearch(search: PokedexSearch) {
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

		return props;
	}

	export async function runLoader(
		client: QueryClient,
		props: UseEntitiesProps,
		onOutofBounds: (count: number) => void,
	) {
		const count = await Entities.loadCount(client, props);
		if (props.page * props.pageSize > count) {
			onOutofBounds(count);
			return;
		}

		await Entities.loadEntities(client, props);
	}

	export async function loadCount(
		client: QueryClient,
		props: UseEntitiesProps,
	) {
		return client.ensureQueryData({
			queryKey: createEntityCountKey(props),
			queryFn: () => fetchEntityCount(props),
		});
	}

	export async function loadEntities(
		client: QueryClient,
		props: UseEntitiesProps,
	) {
		return client.ensureQueryData({
			queryKey: createEntitiesKey(props),
			queryFn: () => fetchEntities(props),
		});
	}

	export const createEntitiesKey = (props: UseEntitiesProps) => [
		'entities',
		props.query ?? 'EMPTY',
		props.page,
		props.pageSize,
		props.kind?.join(';') ?? '',
	];

	export const createEntityCountKey = (props: UseEntityCountProps) => [
		'entityCount',
		props.query ?? 'EMPTY',
		props.kind?.join(';') ?? '',
	];

	async function fetchEntities(props: UseEntitiesProps) {
		const ctx = await RepositoryContext.get();
		return ctx.entities.query(
			props.query,
			props.kind,
			props.page,
			props.pageSize,
		);
	}

	async function fetchEntityCount(props: UseEntityCountProps) {
		const ctx = await RepositoryContext.get();
		return ctx.entities.queryCount(props.query, props.kind);
	}

	export function useEntities(props: UseEntitiesProps) {
		return useQuery({
			queryKey: createEntitiesKey(props),
			queryFn: () => fetchEntities(props),
		});
	}

	export function useEntityCount(props: UseEntityCountProps) {
		return useQuery({
			queryKey: createEntityCountKey(props),
			queryFn: () => fetchEntityCount(props),
		});
	}
}

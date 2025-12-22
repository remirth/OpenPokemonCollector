// biome-ignore-all lint/style/noNonNullAssertion: We assert all uses of the repo context
import {type QueryClient, useQuery} from '@tanstack/react-query';
import type {EntityKind} from 'scripts/schemas';
import {RepositoryContext} from '~/repositories';

export namespace Entities {
	export type UseEntitiesProps = {
		page: number;
		pageSize: number;
		kind: Array<EntityKind>;
		query?: string;
	};

	export type UseEntityCountProps = Omit<UseEntitiesProps, 'page' | 'pageSize'>;

	export async function loadAll(client: QueryClient, props: UseEntitiesProps) {
		const count = await loadCount(client, props);
		const entities = await loadEntities(client, props);
		return {entities, count};
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

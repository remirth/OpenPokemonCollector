// biome-ignore-all lint/style/noNonNullAssertion: We assert all uses of the repo context
import {type QueryClient, useQuery} from '@tanstack/react-query';
import type {EntityKind} from 'scripts/schemas';
import {RepositoryContext} from '~/repositories';

export namespace Entities {
	export async function load(client: QueryClient, props: UseEntitiesProps) {
		await client.ensureQueryData({
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

	export type UseEntitiesProps = {
		page: number;
		pageSize: number;
		kind: Array<EntityKind>;
		query?: string;
	};
	export function useEntities(props: UseEntitiesProps) {
		return useQuery({
			queryKey: createEntitiesKey(props),
			queryFn: () => fetchEntities(props),
		});
	}

	async function fetchEntities(props: UseEntitiesProps) {
		const ctx = await RepositoryContext.get();
		return ctx.entities.query(
			props.query,
			props.kind,
			props.page,
			props.pageSize,
		);
	}
}

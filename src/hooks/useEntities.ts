// biome-ignore-all lint/style/noNonNullAssertion: We assert all uses of the repo context
import {type QueryClient, useQuery} from '@tanstack/react-query';
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
	];

	export type UseEntitiesProps = {
		page: number;
		pageSize: number;
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
		return ctx.entities.query(props.query, props.page, props.pageSize);
	}
}

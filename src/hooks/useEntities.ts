// biome-ignore-all lint/style/noNonNullAssertion: We assert all uses of the repo context
import {type QueryClient, useQuery} from '@tanstack/react-query';
import type {RepositoryContext} from '~/repositories';
import {ensureRepositoryContext, useRepository} from './useRepository';

export namespace Entities {
	export async function load(client: QueryClient, props: UseEntitiesProps) {
		const ctx = await ensureRepositoryContext(client);
		const entities = await client.ensureQueryData({
			queryKey: createEntitiesKey(props),
			queryFn: () => fetchEntities(ctx, props),
		});

		await Promise.all(
			entities.map((entity) => {
				return client.ensureQueryData({
					queryKey: createEntityImageKey(entity),
					queryFn: () => fetchEntityImage(ctx, entity),
				});
			}),
		);
	}

	export const createEntitiesKey = (props: UseEntitiesProps) => [
		'entities',
		props.page,
		props.pageSize,
	];

	export type UseEntitiesProps = {page: number; pageSize: number};
	export function useEntities(props: UseEntitiesProps) {
		const {data: ctx} = useRepository();

		return useQuery({
			queryKey: createEntitiesKey(props),
			queryFn: () => fetchEntities(ctx!, props),
			enabled: Boolean(ctx),
		});
	}

	function fetchEntities(ctx: RepositoryContext, props: UseEntitiesProps) {
		return ctx.entities.getPage(props.page, props.pageSize);
	}

	type UseEntityImageProps = {
		id?: number;
		imageUrl?: string | null | undefined;
	};
	export function useEntityImage<T extends UseEntityImageProps>(props: T) {
		const {data: ctx} = useRepository();

		return useQuery({
			queryKey: createEntityImageKey(props),
			enabled: (Boolean(ctx) || Boolean(props.imageUrl)) && props.id != null,
			queryFn: () => fetchEntityImage(ctx!, props),
		});
	}

	const createEntityImageKey = (props: UseEntityImageProps) => [
		'entityImage',
		props.id,
		props.imageUrl,
	];

	async function fetchEntityImage(
		ctx: RepositoryContext,
		props: UseEntityImageProps,
	) {
		if (props.imageUrl) return props.imageUrl;

		return ctx!.entities.getCardImageForEntity(props.id!);
	}
}

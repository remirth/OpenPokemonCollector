// biome-ignore-all lint/style/noNonNullAssertion: We assert all uses of the repo context
import {type QueryClient, useQuery} from '@tanstack/react-query';
import {RepositoryContext} from '~/repositories';

export namespace Entities {
	export async function load(client: QueryClient, props: UseEntitiesProps) {
		await RepositoryContext.get();
		const entities = await client.ensureQueryData({
			queryKey: createEntitiesKey(props),
			queryFn: () => fetchEntities(props),
		});

		await Promise.all(
			entities.map((entity) => {
				return client.ensureQueryData({
					queryKey: createEntityImageKey(entity),
					queryFn: () => fetchEntityImage(entity),
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
		return useQuery({
			queryKey: createEntitiesKey(props),
			queryFn: () => fetchEntities(props),
		});
	}

	async function fetchEntities(props: UseEntitiesProps) {
		const ctx = await RepositoryContext.get();
		return ctx.entities.getPage(props.page, props.pageSize);
	}

	type UseEntityImageProps = {
		id?: number;
		imageUrl?: string | null | undefined;
	};
	export function useEntityImage<T extends UseEntityImageProps>(props: T) {
		return useQuery({
			queryKey: createEntityImageKey(props),
			enabled: props.id != null,
			queryFn: () => fetchEntityImage(props),
		});
	}

	const createEntityImageKey = (props: UseEntityImageProps) => [
		'entityImage',
		props.id,
		props.imageUrl,
	];

	async function fetchEntityImage(props: UseEntityImageProps) {
		const ctx = await RepositoryContext.get();
		if (props.imageUrl) return props.imageUrl;

		return ctx!.entities.getCardImageForEntity(props.id!);
	}
}

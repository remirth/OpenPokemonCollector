// biome-ignore-all lint/style/noNonNullAssertion: We assert all uses of the repo context
import {useQuery} from '@tanstack/react-query';
import {useRepository} from './useRepository';

export function useEntities(page = 0, pageSize = 50) {
	const {data: ctx} = useRepository();

	return useQuery({
		queryKey: ['entities', page, pageSize],
		queryFn: () => {
			return ctx!.entities.getPage(page, pageSize);
		},
		enabled: Boolean(ctx),
	});
}

export function useEntityImage(
	isLoading: boolean,
	entityId?: number,
	imageUrl?: string,
) {
	const {data: ctx} = useRepository();

	return useQuery({
		queryKey: ['entityImage', entityId, imageUrl, isLoading],
		enabled:
			(Boolean(ctx) || Boolean(imageUrl)) && entityId != null && !isLoading,
		queryFn: async () => {
			if (imageUrl) return imageUrl;

			return ctx!.entities.getCardImageForEntity(entityId!);
		},
	});
}

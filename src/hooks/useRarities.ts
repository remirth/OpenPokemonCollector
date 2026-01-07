import {type QueryClient, useQuery} from '@tanstack/react-query';
import {RepositoryContext} from '~/repositories';

export namespace Rarities {
	export async function loadRarities(client: QueryClient) {
		return client.ensureQueryData({
			queryKey: createRaritiesKey(),
			queryFn: () => fetchRarities(),
		});
	}

	export const createRaritiesKey = () => ['rarities'];

	async function fetchRarities() {
		const ctx = await RepositoryContext.get();
		return ctx.rarities.getAll();
	}

	export function useRarities() {
		return useQuery({
			queryKey: createRaritiesKey(),
			queryFn: () => fetchRarities(),
		});
	}
}

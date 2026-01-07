import {type QueryClient, useQuery} from '@tanstack/react-query';
import {RepositoryContext} from '~/repositories';

export namespace Sets {
	export async function loadSets(client: QueryClient) {
		return client.ensureQueryData({
			queryKey: createSetsKey(),
			queryFn: () => fetchSets(),
		});
	}

	export const createSetsKey = () => ['sets'];

	async function fetchSets() {
		const ctx = await RepositoryContext.get();
		return ctx.sets.getAll();
	}

	export function useSets() {
		return useQuery({
			queryKey: createSetsKey(),
			queryFn: () => fetchSets(),
		});
	}
}

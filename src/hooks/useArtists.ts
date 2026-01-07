import {type QueryClient, useQuery} from '@tanstack/react-query';
import {RepositoryContext} from '~/repositories';

export namespace Artists {
	export async function loadArtists(client: QueryClient) {
		return client.ensureQueryData({
			queryKey: createArtistsKey(),
			queryFn: () => fetchArtists(),
		});
	}

	export const createArtistsKey = () => ['artists'];

	async function fetchArtists() {
		const ctx = await RepositoryContext.get();
		return ctx.artists.getAll();
	}

	export function useArtists() {
		return useQuery({
			queryKey: createArtistsKey(),
			queryFn: () => fetchArtists(),
		});
	}
}

import {type QueryClient, useQuery} from '@tanstack/react-query';
import {RepositoryContext} from '~/repositories';

export function useRepository() {
	return useQuery({
		queryFn: RepositoryContext.get,
		queryKey: ['RepositoryContext'],
	});
}

export function ensureRepositoryContext(client: QueryClient) {
	return client.ensureQueryData({
		queryFn: RepositoryContext.get,
		queryKey: ['RepositoryContext'],
	});
}

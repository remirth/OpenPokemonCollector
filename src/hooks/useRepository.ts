import {useQuery} from '@tanstack/react-query';
import {RepositoryContext} from '~/repositories';

export function useRepository() {
	return useQuery({
		queryFn: RepositoryContext.get,
		queryKey: ['RepositoryContext'],
	});
}

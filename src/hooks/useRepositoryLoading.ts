import {useQuery} from '@tanstack/react-query';
import {RepositoryContext} from '~/repositories';
export function useRepositoryLoading() {
	return useQuery({
		queryKey: ['repositoryLoading'],
		queryFn: async () => {
			await RepositoryContext.get();
			return true;
		},
	});
}

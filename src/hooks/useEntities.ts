import {useQuery} from '@tanstack/react-query';
import {useRepository} from './useRepository';

export const useEntities = (page = 0, pageSize = 50) => {
	const {data: ctx} = useRepository();

	return useQuery({
		queryKey: ['entities', page, pageSize],
		queryFn: () => {
			return ctx?.entities.getPage(page, pageSize);
		},
		enabled: Boolean(ctx),
	});
};

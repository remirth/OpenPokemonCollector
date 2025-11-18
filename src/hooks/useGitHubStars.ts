import {type} from 'arktype';
import {useQuery} from '@tanstack/react-query';
import {http} from '~/lib/http';
import {useEffect} from 'react';

const GitHubRepo = type({
	stargazers_count: 'number',
});

const key = 'github-stars';
export function useGitHubStars() {
	const query = useQuery({
		queryKey: [key],
		queryFn: async () => {
			const data = await http(
				'https://api.github.com/repos/remirth/OpenPokemonCollector',
			)
				.then((res) => res.json())
				.then(GitHubRepo.assert);

			return data.stargazers_count;
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		initialData: () => {
			const cached = localStorage.getItem(key);
			return cached ? parseInt(cached, 10) : undefined;
		},
	});

	useEffect(() => {
		if (query.data) {
			localStorage.setItem(key, query.data.toString());
		}
	}, [query.data]);

	return query;
}

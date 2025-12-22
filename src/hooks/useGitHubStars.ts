import {useQuery} from '@tanstack/react-query';
import {type} from 'arktype';
import {http} from '~/lib/http';

const GitHubRepo = type({
	stargazers_count: 'number',
});

const key = 'github-stars';
export function useGitHubStars(enabled = true) {
	const query = useQuery({
		queryKey: [key],
		enabled,
		gcTime: 7 * 24 * 3600 * 1000,
		queryFn: async () => {
			const data = await http(
				'https://api.github.com/repos/remirth/OpenPokemonCollector',
			)
				.then((res) => res.json())
				.then(GitHubRepo.assert);

			return data.stargazers_count;
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	return query;
}

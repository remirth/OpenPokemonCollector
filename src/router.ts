import {QueryClient} from '@tanstack/react-query';
import {createMemoryHistory, createRouter} from '@tanstack/react-router';
import {routeTree} from './routeTree.gen';

export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				throwOnError: (error, query) => {
					console.error({query: query.queryHash, error});
					return false;
				},
				gcTime: 1000 * 60 * 60 * 24 * 7,
			},
		},
	});
}

export function makeRouter(queryClient: QueryClient, initialUrl?: string) {
	return createRouter({
		routeTree,
		defaultPreload: 'intent',
		defaultViewTransition: true,
		scrollRestoration: true,
		context: {queryClient},
		history: initialUrl
			? createMemoryHistory({initialEntries: [initialUrl]})
			: undefined,
	});
}
// Register things for typesafety
declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof makeRouter>;
	}
}

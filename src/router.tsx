import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createMemoryHistory, createRouter} from '@tanstack/react-router';
import {setupRouterSsrQueryIntegration} from '@tanstack/react-router-ssr-query';
import type React from 'react';
import {LoadingBarContainer} from 'react-top-loading-bar';
import {ModeProvider} from './contexts/mode';
import {StyleProvider} from './contexts/style';
import {routeTree} from './routeTree.gen';

export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				throwOnError: (error, query) => {
					console.error({query: query.queryHash, error});
					return false;
				},
				gcTime: 30_000,
			},
		},
	});
}

export function makeRouter(queryClient: QueryClient, initialUrl?: string) {
	const router = createRouter({
		routeTree,
		defaultPreload: 'intent',
		defaultViewTransition: false,
		scrollRestoration: true,
		context: {queryClient},
		history: initialUrl
			? createMemoryHistory({initialEntries: [initialUrl]})
			: undefined,
		Wrap: ({children}: {children: React.ReactNode}) => (
			<QueryClientProvider client={queryClient}>
				<StyleProvider storageKey='__style'>
					<ModeProvider storageKey='__theme'>
						<LoadingBarContainer>{children}</LoadingBarContainer>
					</ModeProvider>
				</StyleProvider>
			</QueryClientProvider>
		),
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient,
		wrapQueryClient: false,
	});

	return router;
}
// Register things for typesafety
declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof makeRouter>;
	}
}

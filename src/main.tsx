import {createRouter, RouterProvider} from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';
import {routeTree} from './routeTree.gen';
import './styles.css';
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
	QueryClientProvider,
} from '@tanstack/react-query';
import {StrictMode} from 'react';
import {ModeProvider} from './contexts/mode';
import {StyleProvider} from './contexts/style';
import {NotInitializedError} from './lib/errors';
import {RepositoryContext} from './repositories';

// Start repo load as soon as possible
RepositoryContext.get().catch((e) => {
	console.error(e);
	alert('Failed to initialize local database, please reinstall the website!');
});

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			throwOnError: (error, query) => {
				console.error({query: query.queryHash, error});
				return false;
			},
		},
	},
});

// biome-ignore lint/suspicious/noExplicitAny: We need to expose the queryClient to the prerender
(window as any).__rqDehydrate = () => JSON.stringify(dehydrate(queryClient));

// Set up a Router instance
const router = createRouter({
	routeTree,
	defaultPreload: 'intent',
	defaultViewTransition: true,
	scrollRestoration: true,
});

// Register things for typesafety
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

const dehydratedState = JSON.parse(
	document.getElementById('__RQ')?.textContent ?? 'null',
);

const App = () => {
	return (
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<HydrationBoundary state={dehydratedState}>
					<StyleProvider storageKey='__style' defaultStyle='default'>
						<ModeProvider storageKey='__theme' defaultMode='system'>
							<RouterProvider router={router} context={{queryClient}} />
						</ModeProvider>
					</StyleProvider>
				</HydrationBoundary>
			</QueryClientProvider>
		</StrictMode>
	);
};

const rootElement = document.getElementById('app');
NotInitializedError.assert('RootElement', rootElement);

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);

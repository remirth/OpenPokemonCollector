import {createRouter, RouterProvider} from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';
import {routeTree} from './routeTree.gen';
import './styles.css';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {NotInitializedError} from './lib/errors';
import {ThemeProvider} from './contexts/theme';
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

// Set up a Router instance
const router = createRouter({
	routeTree,
	defaultPreload: 'intent',
	scrollRestoration: true,
});

// Register things for typesafety
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

const App = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider storageKey='__theme' defaultTheme='system'>
				<RouterProvider router={router} />
			</ThemeProvider>
		</QueryClientProvider>
	);
};

const rootElement = document.getElementById('app');

NotInitializedError.assert('RootElement', rootElement);

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<App />);
}

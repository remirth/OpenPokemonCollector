import {QueryClient} from '@tanstack/react-query';
import {createRouter} from '@tanstack/react-router';
import {NotInitializedError} from './lib/errors';
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

export async function addPersistence(queryClient: QueryClient) {
	NotInitializedError.assert(
		'Tried to persist QueryClient but not in browser environment!',
		window,
	);
	const asyncPersistenceModule = await import(
		'@tanstack/query-async-storage-persister'
	);
	const persisterModule = await import('@tanstack/react-query-persist-client');
	const persister = asyncPersistenceModule.createAsyncStoragePersister({
		storage: window.localStorage,
		key: '__RQ',
		throttleTime: 1000,
	});

	const [unsubscribe, loaded] = persisterModule.persistQueryClient({
		queryClient,
		persister,
	});

	await loaded;

	return unsubscribe;
}

export function makeRouter() {
	return createRouter({
		routeTree,
		defaultPreload: 'intent',
		defaultViewTransition: true,
		scrollRestoration: true,
	});
}
// Register things for typesafety
declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof makeRouter>;
	}
}

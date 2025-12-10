import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister';
import type {QueryClient} from '@tanstack/react-query';
import {persistQueryClient} from '@tanstack/react-query-persist-client';
import {NotInitializedError} from './lib/errors';

export async function addPersistence(queryClient: QueryClient) {
	NotInitializedError.assert(
		'Tried to persist QueryClient but not in browser environment!',
		window,
	);
	const persister = createAsyncStoragePersister({
		storage: window.localStorage,
		key: '__RQ',
		throttleTime: 1000,
	});

	const [unsubscribe, loaded] = persistQueryClient({
		queryClient,
		persister,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	});

	await loaded;

	return unsubscribe;
}

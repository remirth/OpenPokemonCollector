import ReactDOM, {hydrateRoot} from 'react-dom/client';
import './styles.css';
import {RouterProvider} from '@tanstack/react-router';
import {RouterClient} from '@tanstack/react-router/ssr/client';
import {NotInitializedError} from './lib/errors';
import {addPersistence} from './persist';
import {RepositoryContext} from './repositories';
import {makeQueryClient, makeRouter} from './router';

// Start repo load as soon as possible
RepositoryContext.get().catch((e) => {
	console.error(e);
	alert('Failed to initialize local database, please reinstall the website!');
});

const rootElement = document.getElementById('app');
NotInitializedError.assert('RootElement', rootElement);

const queryClient = makeQueryClient();
const router = makeRouter(queryClient);

await addPersistence(queryClient);

const element = import.meta.env.DEV ? (
	<RouterProvider router={router} />
) : (
	<RouterClient router={router} />
);

if (rootElement.hasChildNodes()) {
	hydrateRoot(rootElement, element);
} else {
	const root = ReactDOM.createRoot(rootElement);
	root.render(element);
}

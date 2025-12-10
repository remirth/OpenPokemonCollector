import ReactDOM from 'react-dom/client';
import './styles.css';
import {App} from './App';
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

const root = ReactDOM.createRoot(rootElement);
root.render(<App queryClient={queryClient} router={router} />);

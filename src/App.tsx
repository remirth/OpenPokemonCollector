import {
	type DehydratedState,
	HydrationBoundary,
	type QueryClient,
	QueryClientProvider,
} from '@tanstack/react-query';
import {RouterProvider} from '@tanstack/react-router';
import {StrictMode} from 'react';
import {ModeProvider} from './contexts/mode';
import {StyleProvider} from './contexts/style';
import type {makeRouter} from './router';

type AppProps = {
	queryClient: QueryClient;
	dehydratedState?: DehydratedState | undefined | null;
	router: ReturnType<typeof makeRouter>;
};
export function App(props: AppProps) {
	return (
		<StrictMode>
			<QueryClientProvider client={props.queryClient}>
				<HydrationBoundary state={props.dehydratedState}>
					<StyleProvider storageKey='__style' defaultStyle='default'>
						<ModeProvider storageKey='__theme' defaultMode='system'>
							<RouterProvider
								router={props.router}
								context={{queryClient: props.queryClient}}
							/>
						</ModeProvider>
					</StyleProvider>
				</HydrationBoundary>
			</QueryClientProvider>
		</StrictMode>
	);
}

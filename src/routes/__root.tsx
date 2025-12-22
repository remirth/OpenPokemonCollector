import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {createRootRoute, Outlet, Scripts} from '@tanstack/react-router';
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools';
import {Header} from '~/components/Header';
import {Loader} from '~/components/Loader';
import {AppSidebar} from '~/components/Sidebar';
import {AppTabs} from '~/components/Tabs';

export const Route = createRootRoute({
	component: RootComponent,
	ssr: true,
});

function RootComponent() {
	return (
		<>
			<Loader />
			<div className='flex flex-col h-dvh w-dvw fixed'>
				<Header className='min-h-17.5 max-h-17.5' />
				<section className='grow w-full grid grid-cols-12 max-h-full'>
					<AppSidebar className='col-span-2 hidden md:block' />
					<main className='col-span-full md:col-span-10 overflow-y-auto bg-background bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-size-[70px_70px] prose-h4:xl:text-2xl prose-h4:lg:text-xl prose-h4:text-lg pb-26 md:pb-16'>
						<Outlet />
					</main>
				</section>
				<AppTabs className='md:hidden min-h-12 max-h-12 fixed bottom-0 left-0 w-full' />
			</div>
			<TanStackRouterDevtools position='bottom-right' />
			<ReactQueryDevtools position='left' buttonPosition='bottom-left' />
			<Scripts />
		</>
	);
}

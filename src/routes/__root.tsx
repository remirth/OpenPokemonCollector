import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {createRootRoute, Outlet} from '@tanstack/react-router';
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools';
import {Header} from '~/components/Header';
import {AppSidebar} from '~/components/Sidebar';
import {AppTabs} from '~/components/Tabs';

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<>
			<div className='flex flex-col h-dvh w-dvw fixed'>
				<Header className='min-h-[70px] max-h-[70px]' />
				<section className='grow w-full grid grid-cols-12 max-h-full'>
					<AppSidebar className='col-span-2 hidden md:block' />
					<main className='col-span-full md:col-span-10 overflow-y-auto bg-background bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-size-[70px_70px] prose-h4:xl:text-2xl prose-h4:lg:text-xl prose-h4:text-lg h-full pb-16 md:pb-0'>
						<Outlet />
					</main>
				</section>
				<AppTabs className='md:hidden max-h-fit' />
			</div>
			<TanStackRouterDevtools position='bottom-right' />
			<ReactQueryDevtools position='left' buttonPosition='bottom-left' />
		</>
	);
}

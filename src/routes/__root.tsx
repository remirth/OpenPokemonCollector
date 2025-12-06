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
			<div className='grid-rows-9 grid h-dvh w-dvw fixed'>
				<Header className='row-span-1' />
				<section className='md:row-span-8 row-span-7 w-full grid grid-cols-12'>
					<AppSidebar className='col-span-2 hidden md:block' />
					<main className='col-span-full md:col-span-10 overflow-y-auto bg-background bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-size-[70px_70px] prose-h4:xl:text-2xl prose-h4:lg:text-xl prose-h4:text-lg h-full pb-16 md:pb-0'>
						<Outlet />
					</main>
				</section>
				<AppTabs className='md:hidden row-span-1' />
			</div>
			<TanStackRouterDevtools position='bottom-right' />
			<ReactQueryDevtools position='left' buttonPosition='bottom-left' />
		</>
	);
}

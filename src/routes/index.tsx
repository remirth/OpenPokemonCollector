import {createFileRoute} from '@tanstack/react-router';
import {useRepository} from '~/hooks/useRepository';

export const Route = createFileRoute('/')({
	component: HomeComponent,
});

function HomeComponent() {
	const state = useRepository();
	return (
		<div className='p-2'>
			<h3>Welcome Home!</h3>
			{state.isLoading && 'Loading'}
			{Boolean(state.error) && state.error?.message}
		</div>
	);
}

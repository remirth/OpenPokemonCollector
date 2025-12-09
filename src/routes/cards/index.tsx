import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/cards/')({
	component: CardComponent,
});

function CardComponent() {
	return (
		<div className='p-2'>
			<h3>Welcome Cards!</h3>
		</div>
	);
}

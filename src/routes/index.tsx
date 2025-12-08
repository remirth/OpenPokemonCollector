import {createFileRoute} from '@tanstack/react-router';
import ImageCard from '~/components/ui/image-card';
import {useEntities} from '~/hooks/useEntities';

export const Route = createFileRoute('/')({
	component: HomeComponent,
});

function HomeComponent() {
	const state = useEntities(0, 50);
	return (
		<>
			{state.data != null && (
				<div className='flex flex-row flex-wrap gap-2 align-middle w-full h-fit p-4 pb-16'>
					{state.data.map((ent) => (
						<ImageCard
							key={ent.pokedexNumber}
							imageUrl={ent.imageUrl ?? ''}
							alt={ent.name}
							caption={`${ent.pokedexNumber}: ${ent.name}`}
							className='max-w-40'
						/>
					))}
				</div>
			)}
			{state.isLoading && 'Loading'}
			{Boolean(state.error) && state.error?.message}
		</>
	);
}

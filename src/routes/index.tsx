import {createFileRoute} from '@tanstack/react-router';
import {type} from 'arktype';
import React from 'react';
import ImageCard from '~/components/ui/image-card';
import {Input} from '~/components/ui/input';
import {useEntities} from '~/hooks/useEntities';

const pokedexSearchSchema = type({
	'page?': 'string.integer',
	'pageSize?': 'string.integer',
});

export const Route = createFileRoute('/')({
	component: HomeComponent,
	validateSearch: (s) => pokedexSearchSchema.assert(s),
});

function HomeComponent() {
	const [page, setPage] = React.useState(0);
	const state = useEntities(Number(page), 50);

	return (
		<>
			{state.data != null && (
				<div className='flex flex-row flex-wrap gap-2 align-middle w-full h-fit p-4 pb-16'>
					<Input
						value={page}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							console.log(e.target.value);
							setPage(Number(e.target.value ?? '0'));
						}}
						type='number'
						placeholder='Page'
					></Input>
					{state.data.map((ent) => (
						<ImageCard
							key={ent.id}
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

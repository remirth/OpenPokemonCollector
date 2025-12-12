import type * as React from 'react';
import {cn} from '~/lib/utils';
import {Skeleton} from './skeleton';

type Props = {
	imageUrl?: string;
	caption: React.ReactNode;
	className?: string;
	isLoading?: boolean;
	alt: string;
};

export default function ImageCard({
	imageUrl,
	isLoading,
	alt,
	caption,
	className,
}: Props) {
	return (
		<figure
			className={cn(
				'w-[250px] overflow-hidden rounded-base border-2 border-border bg-main font-base shadow-shadow',
				className,
			)}
		>
			{isLoading ? (
				<Skeleton className='w-full aspect-4/3' />
			) : (
				<img
					className='w-full aspect-4/3'
					src={imageUrl ?? '/public/puff.svg'}
					alt={alt}
					decoding='async'
					loading='lazy'
				/>
			)}
			<figcaption className='border-t-2 text-foreground bg-secondary-background border-border p-4 h-full'>
				{caption}
			</figcaption>
		</figure>
	);
}

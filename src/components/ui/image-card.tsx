import type * as React from 'react';
import {cn} from '~/lib/utils';
import {ImageWithSkeleton} from './image-with-loader';

type Props = {
	imageUrl?: string;
	caption: React.ReactNode;
	className?: string;
	isLoading?: boolean;
	label?: string;
	alt: string;
};

export default function ImageCard({
	imageUrl,
	isLoading,
	alt,
	caption,
	label,
	className,
}: Props) {
	return (
		<figure
			className={cn(
				'w-66 overflow-hidden rounded-base border-2 border-border bg-main font-base shadow-shadow',
				className,
			)}
		>
			<ImageWithSkeleton
				aspectRatio='4/3'
				alt={alt}
				label={label}
				src={imageUrl ?? '/public/puff.svg'}
				isLoading={isLoading}
				className='object-cover'
			/>
			<figcaption className='border-t-2 text-foreground bg-secondary-background border-border p-4 h-full'>
				{caption}
			</figcaption>
		</figure>
	);
}

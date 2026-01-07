import React from 'react';
import {cn} from '~/lib/utils';
import {ImageWithSkeleton} from './image-with-loader';

type Props = {
	imageUrl?: string;
	backupUrl?: string;
	caption: React.ReactNode;
	className?: string;
	isLoading?: boolean;
	label?: string;
	aspectRatio?: string;
	alt: string;
	figCaptionProps: React.ComponentProps<'figcaption'>;
};

function useBackup(imageUrl?: string) {
	const [current, setCurrent] = React.useState(imageUrl ?? '/public/puff.svg');
	React.useEffect(() => {
		if (imageUrl) {
			setCurrent(imageUrl);
		}
	}, [imageUrl]);

	const setBackup = React.useCallback(
		(backup: string) => {
			if (current !== backup) {
				setCurrent(backup);
				return true;
			} else {
				return false;
			}
		},
		[current],
	);

	return [current, setBackup] as const;
}

export default function ImageCard({
	imageUrl,
	isLoading,
	alt,
	caption,
	label,
	backupUrl,
	aspectRatio,
	className,
	figCaptionProps,
}: Props) {
	const [src, setBackup] = useBackup(imageUrl);
	const {className: figCaptionClass, ...rest} = figCaptionProps;

	return (
		<figure
			className={cn(
				'w-66 overflow-hidden rounded-base border-2 border-border bg-main font-base shadow-shadow',
				className,
			)}
		>
			<ImageWithSkeleton
				aspectRatio={aspectRatio}
				alt={alt}
				label={label}
				src={src}
				onError={() => {
					if (backupUrl) {
						return setBackup(backupUrl);
					}
				}}
				isLoading={isLoading}
				className='object-cover'
			/>
			<figcaption
				className={cn(
					'border-t-2 text-foreground bg-secondary-background border-border p-4 h-full',
					figCaptionClass,
				)}
				{...rest}
			>
				{caption}
			</figcaption>
		</figure>
	);
}

import * as React from 'react';
import {Skeleton} from '~/components/ui/skeleton';
import {cn} from '~/lib/utils';

type ImageWithSkeletonProps = {
	src: string;
	alt: string;
	isLoading?: boolean;
	className?: string; // wrapper
	imgClassName?: string; // image
	aspectRatio?: string; // e.g. "16/9" or "1/1"
	onLoad?: () => void;
	onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
};

export function ImageWithSkeleton({
	src,
	alt,
	className,
	imgClassName,
	aspectRatio,
	isLoading,
	onLoad,
	onError,
}: ImageWithSkeletonProps) {
	const [loaded, setLoaded] = React.useState(false);
	const [failed, setFailed] = React.useState(false);

	React.useEffect(() => {
		if (src) {
			setLoaded(false);
			setFailed(false);
		}
	}, [src]);

	const showSkeleton = isLoading || (!loaded && !failed);

	return (
		<div
			className={cn(
				'relative overflow-hidden',
				aspectRatio ? undefined : 'h-48',
				className,
			)}
			style={aspectRatio ? ({aspectRatio} as React.CSSProperties) : undefined}
		>
			{showSkeleton && (
				<Skeleton className='absolute inset-0 h-full w-full rounded-none' />
			)}

			{!failed && !isLoading && (
				<img
					src={src}
					alt={alt}
					onLoad={() => {
						setLoaded(true);
						onLoad?.();
					}}
					onError={(e) => {
						setFailed(true);
						onError?.(e);
					}}
					className={cn(
						'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
						loaded ? 'opacity-100' : 'opacity-0',
						imgClassName,
					)}
					loading='lazy'
					decoding='async'
				/>
			)}

			{failed && !isLoading && (
				<div className='absolute inset-0 grid place-items-center border border-border bg-muted text-muted-foreground text-sm'>
					Failed to load
				</div>
			)}
		</div>
	);
}

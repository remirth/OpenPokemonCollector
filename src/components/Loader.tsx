import {useRouterState} from '@tanstack/react-router';
import {useEffect, useRef} from 'react';
import LoadingBar, {type LoadingBarRef} from 'react-top-loading-bar';
import {useCssVar} from '~/hooks/useCssVar';
import {useRepositoryLoading} from '~/hooks/useRepositoryLoading';

export function Loader() {
	const color = useCssVar('--main');
	const ref = useRef<LoadingBarRef>(null);
	const repoLoading = useRepositoryLoading();

	const {isLoading} = useRouterState({
		select: (s) => ({isLoading: s.status === 'pending'}),
	});

	useEffect(() => {
		if (isLoading || repoLoading.isLoading) {
			ref.current?.continuousStart();
		} else {
			ref.current?.complete();
		}
	}, [isLoading, repoLoading.isLoading]);

	return <LoadingBar color={color} height={3} shadow ref={ref} />;
}

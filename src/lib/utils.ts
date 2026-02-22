import type {QueryClient} from '@tanstack/react-query';
import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// biome-ignore lint/suspicious/noExplicitAny: We need to cast here
export function useQCFromCtx(ctx: any) {
	return ctx.context.queryClient as QueryClient;
}

export function arrayHasItems<T>(
	vec: Array<T> | undefined,
): vec is [T, ...T[]] {
	return vec != null && vec.length > 0;
}

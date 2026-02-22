import {type QueryClient, useQuery} from '@tanstack/react-query';
import {RepositoryContext} from '~/repositories';

export namespace Cards {
	export type UseCardsProps = {
		page: number;
		pageSize: number;
		sets?: Array<number>;
		artists?: Array<number>;
		rarities?: Array<number>;
		entities?: Array<number>;
		query?: string;
	};

	export type UseCardCountProps = Omit<UseCardsProps, 'page' | 'pageSize'>;

	export function propsFromCardSearch(search: {
		q?: string;
		page?: number;
		pageSize?: number;
		sets?: number[] | number;
		artists?: number[] | number;
		rarities?: number[] | number;
		entities?: number[] | number;
	}): UseCardsProps {
		const props: Cards.UseCardsProps = {
			query: search.q,
			page: search.page ?? 0,
			pageSize: search.pageSize ?? 50,
			sets: search.sets
				? Array.isArray(search.sets)
					? search.sets
					: [search.sets]
				: undefined,
			artists: search.artists
				? Array.isArray(search.artists)
					? search.artists
					: [search.artists]
				: undefined,
			rarities: search.rarities
				? Array.isArray(search.rarities)
					? search.rarities
					: [search.rarities]
				: undefined,
			entities: search.entities
				? Array.isArray(search.entities)
					? search.entities
					: [search.entities]
				: undefined,
		};

		return props;
	}

	export async function runLoader(
		client: QueryClient,
		props: UseCardsProps,
		onOutofBounds: (count: number) => void,
	) {
		const count = await Cards.loadCount(client, props);
		if (props.page * props.pageSize > count) {
			onOutofBounds(count);
			return;
		}

		await Cards.loadCards(client, props);
	}

	export async function loadCount(client: QueryClient, props: UseCardsProps) {
		return client.ensureQueryData({
			queryKey: createCardCountKey(props),
			queryFn: () => fetchCardCount(props),
		});
	}

	export async function loadCards(client: QueryClient, props: UseCardsProps) {
		return client.ensureQueryData({
			queryKey: createCardsKey(props),
			queryFn: () => fetchCards(props),
		});
	}

	export const createCardsKey = (props: UseCardsProps) => [
		'cards',
		props.query ?? 'EMPTY',
		props.page,
		props.pageSize,
		props.sets?.join(';') ?? '',
		props.artists?.join(';') ?? '',
		props.rarities?.join(';') ?? '',
		props.entities?.join(';') ?? '',
	];

	export const createCardCountKey = (props: UseCardCountProps) => [
		'cardCount',
		props.query ?? 'EMPTY',
		props.sets?.join(';') ?? '',
		props.artists?.join(';') ?? '',
		props.rarities?.join(';') ?? '',
		props.entities?.join(';') ?? '',
	];

	async function fetchCards(props: UseCardsProps) {
		const ctx = await RepositoryContext.get();
		return ctx.cards.query(
			props.query,
			props.sets,
			props.artists,
			props.rarities,
			props.entities,
			props.page,
			props.pageSize,
		);
	}

	async function fetchCardCount(props: UseCardCountProps) {
		const ctx = await RepositoryContext.get();
		return ctx.cards.queryCount(
			props.query,
			props.sets,
			props.artists,
			props.rarities,
			props.entities,
		);
	}

	export function useCards(props: UseCardsProps) {
		return useQuery({
			queryKey: createCardsKey(props),
			queryFn: () => fetchCards(props),
		});
	}

	export function useCardCount(props: UseCardCountProps) {
		return useQuery({
			queryKey: createCardCountKey(props),
			queryFn: () => fetchCardCount(props),
		});
	}
}

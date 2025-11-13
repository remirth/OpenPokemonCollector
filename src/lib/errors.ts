import * as R from 'remeda';

/**
 * @description - Returns the value if it is an error, otherwise returns a new error with the value as the message.
 * This is useful for catch clauses where you can't be sure if the caught value is an error or not.
 * @param {unknown} from - The value to check.
 * @returns {Error} - The value if it is an error, otherwise a new error with the value as the message.
 */
export function toError<T, E extends Error = Error>(from: T | E): Error {
	if (from instanceof Error) {
		return from;
	}

	return new AppError(JSON.stringify(from));
}

export class AppError extends Error {
	readonly traceId = globalThis.crypto.randomUUID();
	readonly innerExceptions: Error[];

	constructor(message: string, innerException?: unknown) {
		super(message ?? 'Unidentified Error');
		const name = this.constructor.name;
		this.name = name;

		if (Array.isArray(innerException)) {
			this.innerExceptions = innerException.map(toError);
		} else {
			this.innerExceptions =
				innerException != null ? [toError(innerException)] : [];
		}
	}

	toJSON() {
		return Object.getOwnPropertyNames(this).reduce(
			(acc, k) => {
				acc[k] = this[k as keyof this];
				return acc;
			},
			{} as Record<PropertyKey, unknown>,
		);
	}
}

export class FetchError extends AppError {
	constructor(url: string | URL, e?: unknown) {
		super(`Failed to connect to ${url}`, e);
	}
}

export class HttpError extends AppError {
	constructor(
		readonly name: string,
		readonly url: string,
		readonly status: number,
		readonly text: string,
	) {
		super(`Request ${name} to ${url} failed. ${status}: ${text}`);
	}

	static readonly fromResponse = async (name: string, response: Response) => {
		return new HttpError(
			name,
			response.url,
			response.status,
			await response.text(),
		);
	};

	static readonly test = async (
		response: Response,
		name?: string,
	): Promise<Response & {ok: true}> => {
		if (!response.ok) {
			throw new HttpError(
				name ?? 'Unnamed',
				response.url,
				response.status,
				await response.text(),
			);
		}

		return response as never;
	};
}

export class NotInitializedError extends AppError {
	constructor(name: string) {
		super(`${name} is not initialized`);
	}

	static test<T>(name: string, value: T | undefined | null): NonNullable<T> {
		if (value == null) {
			console.debug(name, 'is null!');
			throw new NotInitializedError(name);
		}

		return value;
	}

	static assert<T>(
		name: string,
		value: T | undefined | null,
	): asserts value is T {
		if (value == null) {
			console.debug(name, 'is null!');
			throw new NotInitializedError(name);
		}
	}
}

export function stringifyError<TError extends Error>(e: TError): string {
	return R.pipe(e, errorToObj, JSON.stringify);
}

export type ObjOf<T> = {
	[K in keyof T]: T[K];
};

export function errorToObj<TError extends Error>(e: TError): ObjOf<TError> {
	return R.pipe(
		e,
		Object.getOwnPropertyNames,
		R.reduce(
			(acc, k) => {
				acc[k] = e[k as keyof TError];
				return acc;
			},
			{} as Record<PropertyKey, unknown>,
		),
	) as never;
}

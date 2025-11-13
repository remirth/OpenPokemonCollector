import path from 'node:path';
import {parseNDJSON} from './lib';

const PARADOX_VERSIONS: Record<string, number | undefined> = {
	'Gouging Fire ex': 1020,
	'Iron Boulder ex': 1022,
	'Gouging Fire': 1020,
	'Iron Hands ex': 992,
	'Iron Thorns ex': 995,
	'Scream Tail': 985,
	'Flutter Mane': 987,
	'Iron Boulder': 1022,
	'Great Tusk': 984,
	'Sandy Shocks ex': 989,
	'Roaring Moon': 1005,
	'Iron Valiant ex': 1006,
	'Iron Crown ex': 1023,
	'Roaring Moon ex': 1005,
	'Raging Bolt ex': 1021,
	'Iron Leaves ex': 1010,
	'Walking Wake ex': 1009,
};

export class Pokedex {
	readonly #state = new Map<number, string>();

	static #instance: Promise<Pokedex> | undefined;

	static readonly #init = async (): Promise<Pokedex> => {
		const self = new Pokedex();
		const dataFile = path.join(process.cwd(), 'scripts', 'pokedex.ndjson');

		for await (const entry of parseNDJSON(dataFile)) {
			self.#state.set(entry.pokedex, entry.name);
		}

		return self;
	};

	static get = () => {
		if (!this.#instance) {
			this.#instance = this.#init();
		}

		return this.#instance;
	};

	readonly get = (key: number) => this.#state.get(key);

	readonly getParadoxNumber = (name: string) => PARADOX_VERSIONS[name];
}

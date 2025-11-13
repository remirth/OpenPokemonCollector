import {createReadStream} from 'node:fs';
import {createInterface} from 'node:readline';

export async function* parseNDJSON(path: string) {
	const stream = createReadStream(path, {encoding: 'utf8'});
	const rl = createInterface({input: stream, crlfDelay: Infinity});
	for await (const line of rl) {
		if (!line) continue;
		yield JSON.parse(line);
	}
}

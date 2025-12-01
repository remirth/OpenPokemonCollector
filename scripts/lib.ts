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
/**
 * Normalize a Pokémon TCG card name by removing common "modifier" tags.
 * Examples:
 *  - "Pikachu V" -> "Pikachu"
 *  - "Charizard VMAX" -> "Charizard"
 *  - "Gardevoir ex" -> "Gardevoir"
 *  - "Tapu Koko ◇" -> "Tapu Koko"
 *  - "Radiant Greninja" -> "Greninja"
 *  - "Mewtwo GX" -> "Mewtwo"
 *  - "Umbreon ☆" -> "Umbreon"
 *  - "Delta Species (δ) Dragonite" -> "Dragonite"
 *  - "Light Dragonite" -> "Dragonite"
 *  - "Dark Machamp" -> "Machamp"
 */
export function cleanCardName(raw: string): string {
	if (!raw) return '';

	// Normalize whitespace and Unicode variants
	let name = raw.normalize('NFKC').replace(/\s+/g, ' ').trim();

	// Patterns to remove. Ordered to avoid partial overlaps.
	// Covers prefixes and suffixes commonly used as "modifiers."
	const patterns: Array<RegExp> = [
		// Named special treatments (must come before individual words)
		/\bPRISM\s+STAR\b/gi,
		/\bACE\s*SPEC\b/gi,
		/\bRADIANT\b/gi,
		/\bDELTA\s+SPECIES\b/gi,
		// Suffix-style rule boxes and stars
		/\bVMAX\b/gi,
		/\bVSTAR\b/gi,
		/\bV-UNION\b/gi,
		/\bV\b/gi,
		/\bEX\b/gi, // modern ex is lowercase on card but normalize both
		/\bex\b/g,
		/\bGX\b/gi,
		/\bLV\.?\s*X\b/gi,
		/\bBREAK\b/gi,
		/\bSTAR\b/gi, // very old "Star" notation
		/[\u2606\u2605\u2729\u2736]|\{\*\}|☆|★/g, // star glyphs and {*} tag
		/◇/g, // Prism Star symbol
		// Delta species
		/[([]?\s*δ\s*[)\]]?/gi,
		// Team/Owner prefixes (prefixes often appear at start)
		/^\s*(TEAM\s+MAGMA|TEAM\s+AQUA|TEAM\s+ROCKET)\s+/gi,
		// Light/Dark old-era prefixes
		/^\s*(LIGHT|DARK)\s+/gi,
		// Team owner names like "Team Rocket's Giovanni" -> "Giovanni"
		/^(TEAM\s+(MAGMA|AQUA|ROCKET))['']s\s+/gi,
		// Tool-like tags accidentally included in name fields
		/\bPOKéMON\s+TOOL\b/gi,
	];

	for (const rx of patterns) {
		name = name.replace(rx, ' ');
		name = name.replace(/\s+/g, ' ').trim();
	}

	// Remove trailing hyphen artifacts like "Pikachu -" after stripping V-UNION
	name = name.replace(/[-–—]\s*$/g, '').trim();

	// Common formatting fixes: capitalize first letter of each word except small words.
	// Comment out if you want to preserve original casing.
	name = titleCaseLoose(name);

	return name;
}

function titleCaseLoose(s: string): string {
	const small = new Set(['of', 'the', 'and', 'a', 'an', 'to', 'in', 'on']);
	return s
		.split(' ')
		.map((w, i) => {
			if (!w) return w;
			const lower = w.toLowerCase();
			if (i > 0 && small.has(lower)) return lower;
			// For trainer/energy cards, we want to title case everything
			// Don't keep all-uppercase acronyms as-is
			return lower.charAt(0).toUpperCase() + lower.slice(1);
		})
		.join(' ');
}

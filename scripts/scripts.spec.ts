import {describe, expect, it} from 'bun:test';
import {cleanCardName} from './lib';

describe('cleanCardName - Trainers and Energies only', () => {
	it('returns empty string for falsy input', () => {
		expect(cleanCardName('')).toBe('');
		// @ts-expect-error runtime check
		expect(cleanCardName(undefined)).toBe('');
		// @ts-expect-error runtime check
		expect(cleanCardName(null)).toBe('');
	});

	describe('Trainer cards', () => {
		it('removes ACE SPEC from Trainers', () => {
			expect(cleanCardName('Computer Search ACE SPEC')).toBe('Computer Search');
			expect(cleanCardName('Dowsing Machine ACE SPEC')).toBe('Dowsing Machine');
		});

		it('removes Prism Star-like tags if present', () => {
			expect(cleanCardName('Lysandre ◇')).toBe('Lysandre');
			expect(cleanCardName('Lysandre Prism Star')).toBe('Lysandre');
		});

		it('strips star glyphs and {*} artifacts on Trainers', () => {
			expect(cleanCardName('Cynthia ★')).toBe('Cynthia');
			expect(cleanCardName("Professor's Research {*}")).toBe(
				"Professor's Research",
			);
			expect(cleanCardName('N ☆')).toBe('N');
		});

		it("removes accidental 'Pokémon Tool' tag fragments in name fields", () => {
			expect(cleanCardName('Pokémon Tool Scrapper')).toBe('Scrapper');
			expect(cleanCardName('Pokémon Tool Float Stone')).toBe('Float Stone');
		});

		it('normalizes whitespace and casing', () => {
			expect(cleanCardName('  rare   candy  ')).toBe('Rare Candy');
			expect(cleanCardName('FIELD BLOWER')).toBe('Field Blower');
		});

		it('does not over-strip normal trainer names', () => {
			expect(cleanCardName('Escape Rope')).toBe('Escape Rope');
			expect(cleanCardName('Ultra Ball')).toBe('Ultra Ball');
			expect(cleanCardName("Boss's Orders")).toBe("Boss's Orders");
		});
	});

	describe('Energy cards', () => {
		it('keeps Basic Energy names intact', () => {
			expect(cleanCardName('Basic Fire Energy')).toBe('Basic Fire Energy');
			expect(cleanCardName('Water Energy')).toBe('Water Energy');
			expect(cleanCardName('Darkness Energy')).toBe('Darkness Energy');
			expect(cleanCardName('Metal Energy')).toBe('Metal Energy');
		});

		it('removes ACE SPEC from Energy', () => {
			expect(cleanCardName('Double Colorless Energy ACE SPEC')).toBe(
				'Double Colorless Energy',
			);
		});

		it('removes star glyphs and Prism tags from Energy', () => {
			expect(cleanCardName('Beast Energy ◇')).toBe('Beast Energy');
			expect(cleanCardName('Beast Energy Prism Star')).toBe('Beast Energy');
			expect(cleanCardName('Unit Energy ★')).toBe('Unit Energy');
		});

		it('normalizes spacing and Unicode', () => {
			expect(cleanCardName('  Capture\u00A0Energy ')).toBe('Capture Energy');
			expect(cleanCardName('Double  Turbo   Energy')).toBe(
				'Double Turbo Energy',
			);
		});

		it('does not strip valid energy words', () => {
			expect(cleanCardName('Rapid Strike Energy')).toBe('Rapid Strike Energy');
			expect(cleanCardName('Stone Fighting Energy')).toBe(
				'Stone Fighting Energy',
			);
			expect(cleanCardName('Powerful Colorless Energy')).toBe(
				'Powerful Colorless Energy',
			);
		});
	});

	describe('General artifacts relevant to both', () => {
		it('strips δ or Delta Species tokens if they appear erroneously', () => {
			expect(cleanCardName('Professor Elm (δ)')).toBe('Professor Elm');
			expect(cleanCardName('Unit Energy δ')).toBe('Unit Energy');
			expect(cleanCardName('Delta Species Computer Search')).toBe(
				'Computer Search',
			);
		});

		it('strips Radiant if present in non-Pokémon entries', () => {
			expect(cleanCardName('Radiant Trainer Toolkit')).toBe('Trainer Toolkit');
			expect(cleanCardName('Radiant Energy')).toBe('Energy');
		});

		it('keeps meaningful words and title-cases', () => {
			expect(cleanCardName('spirit of the forest energy')).toBe(
				'Spirit of the Forest Energy',
			);
		});
	});
});

import {Chan} from 'ts-chan';
import {cleanCardName} from './lib';

export type EnergyInfo = {
	pattern: RegExp;
	name: string;
	imageName: string;
};

const ENERGY_INFO = [
	{
		name: 'Colorless Energy',
		pattern:
			/^(?:Double\s+Colorless\s+Energy|Powerful\s+Colorless\s+Energy|Twin\s+Energy|Double\s+Turbo\s+Energy|Triple\s+Acceleration\s+Energy|Jet\s+Energy|Luminous\s+Energy|Energy)$/i,
		imageName: 'colorless.webp',
	},
	{
		name: 'Beast Energy',
		pattern: /^Beast\s+Energy$/i,
		imageName: 'beast.webp',
	},
	{
		name: 'Grass Energy',
		pattern:
			/^(?:Basic\s+)?Grass\s+Energy$|^(?:Aromatic\s+Grass|Herbal|Enriching)\s+Energy$|^Blend\s+Energy\s+Grassfirepsychicdarkness$|^Unit\s+Energy\s+Grassfirewater$/i,
		imageName: 'grass.webp',
	},
	{
		name: 'Fire Energy',
		pattern:
			/^(?:Basic\s+)?Fire\s+Energy$|^(?:Heat\s+Fire|Burning|Ignition)\s+Energy$|^Blend\s+Energy\s+Grassfirepsychicdarkness$|^Unit\s+Energy\s+Grassfirewater$|^(?:Aqua\s+Energy|Double\s+Aqua\s+Energy|Magma\s+Energy|Double\s+Magma\s+Energy)$/i,
		imageName: 'fire.webp',
	},
	{
		name: 'Water Energy',
		pattern:
			/^(?:Basic\s+)?Water\s+Energy$|^(?:Splash|Wash\s+Water)\s+Energy$|^Blend\s+Energy\s+Waterlightningfightingmetal$|^Unit\s+Energy\s+Grassfirewater$|^(?:Aqua\s+Energy|Double\s+Aqua\s+Energy)$/i,
		imageName: 'water.webp',
	},
	{
		name: 'Lightning Energy',
		pattern:
			/^(?:Basic\s+)?Lightning\s+Energy$|^(?:Speed\s+Lightning|Flash)\s+Energy$|^Blend\s+Energy\s+Waterlightningfightingmetal$|^Unit\s+Energy\s+Lightningpsychicmetal$/i,
		imageName: 'lightning.webp',
	},
	{
		name: 'Psychic Energy',
		pattern:
			/^(?:Basic\s+)?Psychic\s+Energy$|^(?:Horror\s+Psychic|Mystery)\s+Energy$|^Blend\s+Energy\s+Grassfirepsychicdarkness$|^Unit\s+Energy\s+Lightningpsychicmetal$/i,
		imageName: 'psychic.webp',
	},
	{
		name: 'Fighting Energy',
		pattern:
			/^(?:Basic\s+)?Fighting\s+Energy$|^(?:Stone\s+Fighting)\s+Energy$|^Blend\s+Energy\s+Waterlightningfightingmetal$|^Unit\s+Energy\s+Fightingdarknessfairy$/i,
		imageName: 'fighting.webp',
	},
	{
		name: 'Darkness Energy',
		pattern:
			/^(?:Basic\s+)?Darkness\s+Energy$|^(?:Hiding\s+Darkness|R|Sp)\s+Energy$|^Blend\s+Energy\s+Grassfirepsychicdarkness$|^Unit\s+Energy\s+Fightingdarknessfairy$|^Dark\s+Metal\s+Energy$/i,
		imageName: 'darkness.webp',
	},
	{
		name: 'Metal Energy',
		pattern:
			/^(?:Basic\s+)?Metal\s+Energy$|^(?:Coating\s+Metal)\s+Energy$|^Blend\s+Energy\s+Waterlightningfightingmetal$|^Unit\s+Energy\s+Lightningpsychicmetal$|^Dark\s+Metal\s+Energy$/i,
		imageName: 'metal.webp',
	},
	{
		name: 'Dragon Energy',
		pattern: /^Double\s+Dragon\s+Energy$/i,
		imageName: 'dragon.webp',
	},
	{
		name: 'Fairy Energy',
		pattern:
			/^(?:Fairy\s+Energy|Unit\s+Energy\s+Fightingdarknessfairy|Wonder\s+Energy)$/i,
		imageName: 'fairy.webp',
	},
	// Acceleration-only bucket
	{
		name: 'Acceleration Energy',
		pattern:
			/^(?:Boost|Super\s+Boost|Triple\s+Acceleration|Double\s+Turbo|Upper|Neo\s+Upper|Scramble|Reversal|Counter)\s+Energy$/i,
		imageName: 'acceleration.webp',
	},
	// Wildcard Any-Color
	{
		name: 'Wildcard Energy',
		pattern: /^(?:Rainbow|Aurora|Luminous|Prism|Crystal)\s+Energy$/i,
		imageName: 'any.webp',
	},
	// Fixed multi-type combos and family mixers combined
	{
		name: 'Multi-type Energy',
		pattern:
			/^(?:Multi|Double\s+Rainbow|Dark\s+Metal)\s+Energy$|^Blend\s+Energy\s+(?:Grassfirepsychicdarkness|Waterlightningfightingmetal)$|^Unit\s+Energy\s+(?:Grassfirewater|Lightningpsychicmetal|Fightingdarknessfairy)$/i,
		imageName: 'multi.webp',
	},
	// Era relic specials
	{
		name: 'Era Relic Special Energy',
		pattern: /^(?:Miracle|Legacy|Mist|React|Memory)\s+Energy$/i,
		imageName: 'relic.webp',
	},
	// Holon collapsed to one bucket
	{
		name: 'Holon Energy',
		pattern: /^Holon\s+Energy\s+(?:Ff|Gl|Wp)$/i,
		imageName: 'holon.webp',
	},
	// Branded energies in one bucket (Aqua, Magma, Plasma)
	{
		name: 'Branded Team Energy',
		pattern:
			/^(?:Aqua\s+Energy|Double\s+Aqua\s+Energy|Magma\s+Energy|Double\s+Magma\s+Energy|Plasma\s+Energy)$/i,
		imageName: 'team.webp',
	},
	// All Strike styles in one bucket
	{
		name: 'Strike Style Energy',
		pattern:
			/^(?:Rapid\s+Strike|Single\s+Strike|Fusion\s+Strike|Spiral|Impact)\s+Energy$/i,
		imageName: 'strike.webp',
	},
	// Utility and others
	{
		name: 'Utility Energy',
		pattern:
			/^(?:Capture|Call|Draw|Gift|Treasure|Lucky|Rescue|Recycle|Recover)\s+Energy$/i,
		imageName: 'utility.webp',
	},
	{
		name: 'Healing Energy',
		pattern:
			/^(?:Regenerative|Therapeutic|Medical|Heal|Health|Full\s+Heal|Potion)\s+Energy$/i,
		imageName: 'healing.webp',
	},
	{
		name: 'Defense Energy',
		pattern: /^(?:Shield|Guard|Weakness\s+Guard)\s+Energy$/i,
		imageName: 'defense.webp',
	},
	{
		name: 'Offense Energy',
		pattern:
			/^(?:Strong|Powerful\s+Colorless|Impact|Dangerous|Spiky)\s+Energy$/i,
		imageName: 'offense.webp',
	},
	{
		name: 'Mobility Energy',
		pattern: /^(?:Warp|Bounce|Jet|Boomerang|Cyclone|Retro)\s+Energy$/i,
		imageName: 'mobility.webp',
	},
] satisfies Array<EnergyInfo>;

async function processCard(cardName: string, channel: Chan<EnergyInfo>) {
	const name = cleanCardName(cardName);
	await Promise.all(
		ENERGY_INFO.map(async (r) => {
			if (r.pattern.test(name)) {
				await channel.send(r);
			}
		}),
	);
}

export function getEnergyArchetypes(cardName: string) {
	const channel = new Chan<EnergyInfo>(ENERGY_INFO.length);

	processCard(cardName, channel).finally(() => channel.close());
	return channel;
}

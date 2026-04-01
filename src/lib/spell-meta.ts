import type { SpellTarget } from '../models/spells';

const TARGET_LABEL: Record<SpellTarget, string> = {
	'single-target': 'Single Target',
	self: 'Self',
	aoe: 'AoE',
	'two-targets': '2 Targets',
	'multi-target': 'Multi-target',
	'single-target-plus': 'Single Target+',
	'single-target-or-self': 'Single Target/Self',
};

/** 0 = Cantrip; 1–9 = Tier 1–9 */
export function formatSpellTier(tier: number): string {
	if (tier === 0) return 'Cantrip';
	return `Tier ${tier}`;
}

export function formatSpellTarget(target: SpellTarget): string {
	return TARGET_LABEL[target];
}

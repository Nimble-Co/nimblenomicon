/**
 * Single source for spell tier labels in UI, Zod transforms, and search filters.
 * Nimble uses numeric tier in data (0 = cantrip, 1–9 = tiers).
 */
export function spellTierDisplayLabel(tier: number): string {
	if (tier === 0) return 'Cantrip';
	return `Tier ${tier}`;
}

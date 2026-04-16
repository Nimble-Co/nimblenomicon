import { describe, expect, it } from 'vitest';
import { displayClassSearchHitDieLabel } from '../../src/models/class';

describe('displayClassSearchHitDieLabel', () => {
	it('maps legacy index string 1d12 to d12 hit die', () => {
		expect(displayClassSearchHitDieLabel('1d12')).toBe('d12 hit die');
	});

	it('passes through rebuilt index form', () => {
		expect(displayClassSearchHitDieLabel('d12 hit die')).toBe('d12 hit die');
	});

	it('maps bare d12 to d12 hit die', () => {
		expect(displayClassSearchHitDieLabel('d12')).toBe('d12 hit die');
	});
});

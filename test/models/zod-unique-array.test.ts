import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import {
	refineUniqueNumericField,
	refineUniqueStringIdsByKey,
} from '../../src/models/zod-unique-array';

describe('refineUniqueStringIdsByKey', () => {
	const schema = z
		.array(
			z.object({
				id: z.string(),
				name: z.string(),
			}),
		)
		.superRefine(
			refineUniqueStringIdsByKey<{ id: string; name: string }>('item'),
		);

	it('passes when ids are unique', () => {
		const rows = [
			{ id: 'a', name: 'A' },
			{ id: 'b', name: 'B' },
		];
		expect(() => schema.parse(rows)).not.toThrow();
	});

	it('fails on duplicate id with stable message shape', () => {
		const rows = [
			{ id: 'dup', name: 'First' },
			{ id: 'dup', name: 'Second' },
		];
		const result = schema.safeParse(rows);
		expect(result.success).toBe(false);
		if (result.success) return;
		expect(result.error.issues).toHaveLength(1);
		expect(result.error.issues[0]?.message).toBe(
			'Duplicate item id "dup" (rows 0 and 1)',
		);
		expect(result.error.issues[0]?.path).toEqual([1, 'id']);
	});
});

describe('refineUniqueNumericField', () => {
	const chaosSchema = z
		.array(
			z.object({
				roll: z.number(),
				name: z.string(),
			}),
		)
		.superRefine(
			refineUniqueNumericField<{ roll: number; name: string }, 'roll'>(
				'roll',
				(r) => `Duplicate chaos roll ${r}`,
			),
		);

	it('fails on duplicate roll value', () => {
		const rows = [
			{ roll: 5, name: 'a' },
			{ roll: 5, name: 'b' },
		];
		const result = chaosSchema.safeParse(rows);
		expect(result.success).toBe(false);
		if (result.success) return;
		expect(result.error.issues[0]?.message).toBe('Duplicate chaos roll 5');
		expect(result.error.issues[0]?.path).toEqual([1, 'roll']);
	});
});

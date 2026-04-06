import { z } from 'astro/zod';
import rawBoons from '../data/boons.json';
import { sourceRefSchema } from './entity-base';
import { slugifyEntityId } from '../utils/slugifyEntityId';

const rawBoonSchema = z
	.object({
		level: z.enum(['temporary', 'minor', 'major', 'epic']),
		roll: z.number().int().min(1).max(8).optional(),
		name: z.string().min(1).optional(),
		description: z.string().min(1),
		source: sourceRefSchema,
	})
	.strict()
	.superRefine((row, ctx) => {
		if (row.level === 'temporary') {
			if (row.roll === undefined) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Temporary boons require roll (1–8).',
					path: ['roll'],
				});
			}
			if (row.name !== undefined) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Temporary boons must not have name.',
					path: ['name'],
				});
			}
		} else {
			if (row.name === undefined || row.name.trim() === '') {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Minor, major, and epic boons require name.',
					path: ['name'],
				});
			}
			if (row.roll !== undefined) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Named boons must not have roll.',
					path: ['roll'],
				});
			}
		}
	});

export type TemporaryBoonRow = {
	level: 'temporary';
	roll: number;
	description: string;
	source: z.infer<typeof sourceRefSchema>;
};

export type NamedBoonData = {
	level: 'minor' | 'major' | 'epic';
	name: string;
	description: string;
	id: string;
	source: z.infer<typeof sourceRefSchema>;
};

export type BoonData = TemporaryBoonRow | NamedBoonData;

const boonSchema = rawBoonSchema.transform((row): BoonData => {
	if (row.level === 'temporary') {
		return {
			level: 'temporary',
			roll: row.roll!,
			description: row.description,
		};
	}
	return {
		level: row.level,
		name: row.name!.trim(),
		description: row.description,
		id: slugifyEntityId(row.name!.trim(), 'boon'),
	};
});

export const boons: BoonData[] = z.array(boonSchema).parse(rawBoons);

const BOON_ROLL_COLUMNS = [
	{ key: 'roll', label: '1d8', align: 'end' as const },
	{ key: 'description', label: 'Temporary Boon' },
] as const;

/** Rows for the 1d8 temporary boons table (sorted by roll). */
export function temporaryBoonTableRows(): {
	roll: number;
	description: string;
}[] {
	return boons
		.filter((b): b is TemporaryBoonRow => b.level === 'temporary')
		.slice()
		.sort((a, b) => a.roll - b.roll)
		.map((row) => ({ roll: row.roll, description: row.description }));
}

export function temporaryBoonTableSpec(): {
	columns: { key: string; label: string }[];
	rows: Record<string, unknown>[];
} {
	return {
		columns: [...BOON_ROLL_COLUMNS],
		rows: temporaryBoonTableRows(),
	};
}

/** Markdown lines for minor / major / epic boon lists. */
export function namedBoonMarkdownLines(
	level: 'minor' | 'major' | 'epic',
): { markdown: string }[] {
	return boons
		.filter((b): b is NamedBoonData => b.level === level)
		.map((row) => ({
			markdown: `**${row.name}**. ${row.description.trim()}`,
		}));
}

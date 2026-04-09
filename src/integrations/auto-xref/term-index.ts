import { ancestries } from '../../models/ancestries';
import { armorRows } from '../../models/armor';
import { backgrounds } from '../../models/backgrounds';
import { heroClasses, type HeroClassData } from '../../models/class';
import { conditions } from '../../models/conditions';
import { glossary } from '../../models/glossary';
import { languages } from '../../models/languages';
import { legendaryMonsters } from '../../models/legendary-monsters';
import { magicalItems } from '../../models/magical-items';
import { miscAdventuringEquipment } from '../../models/misc-adventuring-equipment';
import { monsters } from '../../models/monsters';
import { spells } from '../../models/spells';
import { weapons } from '../../models/weapons';

/** One matchable phrase → entity page (used at build time and serialized for the client). */
export type TermEntry = {
	term: string;
	href: string;
	definition: string;
	kind: string;
	aliases?: string[];
	/** Higher = preferred when sorting for longest-match ties (spell > class > …). */
	priority: number;
};

const MAX_DEF_CHARS = 320;

function stripMarkdownLight(s: string): string {
	let t = s.replace(/\*\*([^*]+)\*\*/g, '$1');
	t = t.replace(/\*([^*]+)\*/g, '$1');
	t = t.replace(/`([^`]+)`/g, '$1');
	t = t.replace(/\[([^\]]+)]\([^)]+\)/g, '$1');
	t = t.replace(/\s+/g, ' ').trim();
	return t;
}

function truncateDef(s: string): string {
	const t = stripMarkdownLight(s);
	if (t.length <= MAX_DEF_CHARS) return t;
	return `${t.slice(0, MAX_DEF_CHARS - 1).trimEnd()}…`;
}

function spellDefinition(spell: (typeof spells)[number]): string {
	return truncateDef(spell.description);
}

function classDefinition(c: HeroClassData): string {
	return truncateDef(c.summary);
}

function monsterDefinition(name: string, level: string, kind?: string): string {
	const bits = [`${name} — Level ${level} monster.`];
	if (kind?.trim()) bits.push(kind);
	return truncateDef(bits.join(' '));
}

function buildEntries(): TermEntry[] {
	const out: TermEntry[] = [];

	for (const s of spells) {
		out.push({
			term: s.name,
			href: `/spells/${s.id}/`,
			definition: spellDefinition(s),
			kind: 'spell',
			priority: 100,
		});
	}

	for (const c of heroClasses) {
		out.push({
			term: c.name,
			href: `/classes/${c.id}/`,
			definition: classDefinition(c),
			kind: 'class',
			priority: 95,
		});
		for (const sub of c.subclasses) {
			out.push({
				term: sub.name,
				href: `/classes/${c.id}/`,
				definition: truncateDef(`${sub.name} subclass of ${c.name}.`),
				kind: 'subclass',
				priority: 94,
			});
		}
	}

	for (const m of monsters) {
		out.push({
			term: m.name,
			href: `/monsters/${m.id}/`,
			definition: monsterDefinition(m.name, String(m.level), m.kind?.name),
			kind: 'monster',
			priority: 88,
		});
	}

	for (const m of legendaryMonsters) {
		out.push({
			term: m.name,
			href: `/monsters/${m.id}/`,
			definition: truncateDef(
				`${m.name} — Level ${m.level} legendary (${m.creatureType}).`,
			),
			kind: 'legendary-monster',
			priority: 87,
		});
	}

	for (const row of magicalItems) {
		out.push({
			term: row.name,
			href: `/magical-items/${row.id}/`,
			definition: truncateDef(row.description),
			kind: 'magical-item',
			priority: 82,
		});
	}

	for (const row of conditions) {
		out.push({
			term: row.name,
			href: `/conditions/${row.id}/`,
			definition: truncateDef(row.description),
			kind: 'condition',
			priority: 78,
		});
	}

	for (const row of glossary) {
		out.push({
			term: row.name,
			href: `/glossary/${row.id}/`,
			definition: truncateDef(row.description),
			kind: 'glossary',
			priority: 76,
		});
	}

	for (const row of ancestries) {
		out.push({
			term: row.name,
			href: `/ancestries/${row.id}/`,
			definition: truncateDef(`${row.flavor} ${row.trait}`),
			kind: 'ancestry',
			priority: 72,
		});
	}

	for (const row of backgrounds) {
		out.push({
			term: row.name,
			href: `/backgrounds/${row.id}/`,
			definition: truncateDef(row.description),
			kind: 'background',
			priority: 71,
		});
	}

	for (const row of languages) {
		out.push({
			term: row.name,
			href: `/languages/${row.id}/`,
			definition: truncateDef(row.description),
			kind: 'language',
			priority: 70,
		});
	}

	for (const row of weapons) {
		out.push({
			term: row.name,
			href: `/weapons/${row.id}/`,
			definition: truncateDef(
				`${row.category === 'melee' ? 'Melee' : 'Ranged'} weapon — ${row.damage}.`,
			),
			kind: 'weapon',
			priority: 65,
		});
	}

	for (const row of armorRows) {
		out.push({
			term: row.name,
			href: `/armor/${row.id}/`,
			definition: truncateDef(`Armor ${row.armor} — ${row.cost}.`),
			kind: 'armor',
			priority: 64,
		});
	}

	for (const row of miscAdventuringEquipment) {
		out.push({
			term: row.name,
			href: `/misc-adventuring-equipment/${row.id}/`,
			definition: truncateDef(row.description),
			kind: 'misc-gear',
			priority: 62,
		});
	}

	return out;
}

/** Longest phrase first, then higher priority (spell before weapon when same length). */
export function sortTermsForMatching(entries: TermEntry[]): TermEntry[] {
	return [...entries].sort((a, b) => {
		const ld = b.term.length - a.term.length;
		if (ld !== 0) return ld;
		return b.priority - a.priority;
	});
}

function dedupeByTerm(entries: TermEntry[]): TermEntry[] {
	const seen = new Set<string>();
	const out: TermEntry[] = [];
	for (const e of entries) {
		const key = e.term;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(e);
	}
	return out;
}

export function buildMatchableTerms(): TermEntry[] {
	const raw = buildEntries();
	return dedupeByTerm(sortTermsForMatching(raw));
}

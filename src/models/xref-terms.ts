import { ancestries } from './ancestries';
import { armorRows } from './armor';
import { backgrounds } from './backgrounds';
import { heroClasses, type HeroClassData } from './class';
import { conditions } from './conditions';
import { glossary } from './glossary';
import { languages } from './languages';
import { legendaryMonsters } from './legendary-monsters';
import { magicalItems } from './magical-items';
import { miscAdventuringEquipment } from './misc-adventuring-equipment';
import { monsters } from './monsters';
import { spells } from './spells';
import { weapons } from './weapons';

/** Metadata for manual `.auto-xref` links and the optional MDX linker script. */
export type XrefTermEntry = {
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
	return truncateDef(c.description);
}

function monsterDefinition(name: string, level: string, kind?: string): string {
	const bits = [`${name} — Level ${level} monster.`];
	if (kind?.trim()) bits.push(kind);
	return truncateDef(bits.join(' '));
}

function buildEntries(): XrefTermEntry[] {
	const out: XrefTermEntry[] = [];

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
export function sortXrefTermsForMatching(
	entries: XrefTermEntry[],
): XrefTermEntry[] {
	return [...entries].sort((a, b) => {
		const ld = b.term.length - a.term.length;
		if (ld !== 0) return ld;
		return b.priority - a.priority;
	});
}

function dedupeByTerm(entries: XrefTermEntry[]): XrefTermEntry[] {
	const seen = new Set<string>();
	const out: XrefTermEntry[] = [];
	for (const e of entries) {
		const key = e.term;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(e);
	}
	return out;
}

/** Sorted list of all entity rows (no dedupe) — use for disambiguation and `Reference`. */
let allReferenceEntriesCache: XrefTermEntry[] | undefined;

export function allReferenceEntries(): XrefTermEntry[] {
	allReferenceEntriesCache ??= sortXrefTermsForMatching(buildEntries());
	return allReferenceEntriesCache;
}

/**
 * Resolve a display `term` to a single entry. When multiple rows share the same `term`,
 * pass `kind` (e.g. `language` vs `ancestry`) or the first row in priority order is used
 * (same as legacy dedupe behavior).
 */
export function resolveReferenceEntry(
	term: string,
	kind?: string,
): XrefTermEntry | undefined {
	const matches = allReferenceEntries().filter((e) => e.term === term);
	if (matches.length === 0) return undefined;
	if (matches.length === 1) return matches[0];
	if (kind !== undefined && kind !== '') {
		return matches.find((e) => e.kind === kind);
	}
	return matches[0];
}

/** Terms that appear more than once in the catalog (need `kind` on `<Reference />` when ambiguous). */
export function ambiguousReferenceTerms(): Set<string> {
	const counts = new Map<string, number>();
	for (const e of allReferenceEntries()) {
		counts.set(e.term, (counts.get(e.term) ?? 0) + 1);
	}
	return new Set(
		[...counts.entries()].filter(([, n]) => n > 1).map(([t]) => t),
	);
}

/** All entity terms for tooltips / manual links (deduped; first wins on duplicate names). */
export function buildXrefTermList(): XrefTermEntry[] {
	const raw = buildEntries();
	return dedupeByTerm(sortXrefTermsForMatching(raw));
}

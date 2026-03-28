import { z } from "astro/zod";
import rawSpells from "../data/spells.json";

export const spellTargetSchema = z.enum([
  "single-target",
  "self",
  "aoe",
  "two-targets",
  "multi-target",
  "single-target-plus",
  "single-target-or-self",
]);
export type SpellTarget = z.infer<typeof spellTargetSchema>;

const spellSchoolIdSchema = z.enum([
  "fire-spells",
  "ice-spells",
  "lightning-spells",
  "wind-spells",
  "radiant-spells",
  "necrotic-spells",
]);

const spellEntryFields = {
  name: z.string().min(1),
  tier: z.number().int().min(0).max(9),
  castingTime: z.string().min(1),
  target: spellTargetSchema,
  description: z.string(),
};

const spellEntrySchema = z.object(spellEntryFields).strict();

function emptyToUndef(s: unknown): unknown {
  return s === "" ? undefined : s;
}

function coerceUtility(v: unknown): unknown {
  if (v === true || v === "true") return true;
  if (v === false || v === "false") return false;
  return v;
}

/** CMS may send tier as string from select. */
function coerceTier(v: unknown): unknown {
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) {
    return Number(v);
  }
  return v;
}

const spellRowBaseSchema = z.preprocess(
  (raw) => {
    if (!raw || typeof raw !== "object") return raw;
    const o = raw as Record<string, unknown>;
    const out = {
      ...o,
      schoolId: emptyToUndef(o.schoolId),
      utility: coerceUtility(o.utility),
      tier: coerceTier(o.tier ?? o.level),
    };
    if ("level" in out) delete (out as Record<string, unknown>).level;
    return out;
  },
  z
    .object({
      schoolId: spellSchoolIdSchema,
      utility: z.boolean(),
      name: z.string().min(1),
      tier: z.number().int().min(0).max(9),
      castingTime: z.string().min(1),
      target: spellTargetSchema,
      description: z.string(),
    })
    .strict(),
);

const spellRowSchema = spellRowBaseSchema;

export type SpellEntryData = z.infer<typeof spellEntrySchema>;
export type SpellRowData = z.infer<typeof spellRowSchema>;

/** Root is a flat array (Pages CMS list editor); legacy `{ spells: [...] }` still parses. */
const flatPayloadSchema = z.union([
  z.array(spellRowSchema),
  z
    .object({ spells: z.array(spellRowSchema) })
    .strict()
    .transform((o) => o.spells),
]);

export const spellRows: SpellRowData[] = flatPayloadSchema.parse(rawSpells);

/** Document order for Core Rules main spell schools (non-utility). */
const SCHOOL_ORDER = [
  "fire-spells",
  "ice-spells",
  "lightning-spells",
  "wind-spells",
  "radiant-spells",
  "necrotic-spells",
] as const;

/** Short title for headings (from spell-schools data / Core Rules). */
const SCHOOL_SHORT_NAME: Record<(typeof SCHOOL_ORDER)[number], string> = {
  "fire-spells": "Fire",
  "ice-spells": "Ice",
  "lightning-spells": "Lightning",
  "wind-spells": "Wind",
  "radiant-spells": "Radiant",
  "necrotic-spells": "Necrotic",
};

/** Utility subsection order; keys match `schoolId` on utility rows. */
const UTILITY_SECTION_ORDER = [
  "ice-spells",
  "fire-spells",
  "lightning-spells",
  "wind-spells",
  "radiant-spells",
  "necrotic-spells",
] as const;

/** h3 titles under Utility Spells */
const UTILITY_SECTION_TITLE: Record<
  (typeof UTILITY_SECTION_ORDER)[number],
  string
> = {
  "ice-spells": "Ice",
  "fire-spells": "Fire",
  "lightning-spells": "Lightning",
  "wind-spells": "Wind",
  "radiant-spells": "Radiant",
  "necrotic-spells": "Necrotic",
};

export type SpellSchoolBlock = {
  id: string;
  name: string;
  spells: SpellEntryData[];
};

export type UtilitySpellGroupBlock = {
  id: string;
  name: string;
  spells: SpellEntryData[];
  /** One spell whose name matches the section (no h4 in Core Rules) */
  flat: boolean;
};

function entryFromRow(row: SpellRowData): SpellEntryData {
  const { schoolId, utility, ...spell } = row;
  void schoolId;
  void utility;
  return spell;
}

export function buildSpellSchools(rows: SpellRowData[]): SpellSchoolBlock[] {
  const bySchool = new Map<string, SpellRowData[]>();
  for (const row of rows) {
    if (row.utility) continue;
    const list = bySchool.get(row.schoolId) ?? [];
    list.push(row);
    bySchool.set(row.schoolId, list);
  }
  return SCHOOL_ORDER.filter((id) => bySchool.has(id)).map((id) => {
    const group = bySchool.get(id)!;
    return {
      id,
      name: SCHOOL_SHORT_NAME[id],
      spells: group.map(entryFromRow),
    };
  });
}

export function buildUtilitySpellGroups(
  rows: SpellRowData[],
): UtilitySpellGroupBlock[] {
  const bySection = new Map<string, SpellRowData[]>();
  for (const row of rows) {
    if (!row.utility) continue;
    const list = bySection.get(row.schoolId) ?? [];
    list.push(row);
    bySection.set(row.schoolId, list);
  }
  return UTILITY_SECTION_ORDER.filter((id) => bySection.has(id)).map((id) => {
    const group = bySection.get(id)!;
    const name = UTILITY_SECTION_TITLE[id];
    const spells = group.map(entryFromRow);
    const flat =
      spells.length === 1 && spells[0]!.name.trim() === name.trim();
    return { id, name, spells, flat };
  });
}

export const spellsData = {
  schools: buildSpellSchools(spellRows),
  utilitySchools: buildUtilitySpellGroups(spellRows),
};

export type SpellsPayloadData = typeof spellsData;

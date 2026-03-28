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

const spellEntryFields = {
  name: z.string().min(1),
  level: z.number().int().min(0).max(9),
  actions: z.union([z.number().int().positive(), z.null()]),
  target: spellTargetSchema,
  body: z.string(),
  castingNote: z.string().optional(),
};

const spellEntrySchema = z
  .object(spellEntryFields)
  .strict()
  .refine(
    (s) =>
      (s.actions === null && s.castingNote && s.castingNote.length > 0) ||
      (s.actions !== null && s.castingNote === undefined),
    { message: "actions must be a positive integer, or null with castingNote set" },
  );

/** Row input: actions optional when castingNote supplies cast time (CMS may omit actions). */
function emptyToUndef(s: unknown): unknown {
  return s === "" ? undefined : s;
}

const spellRowBaseSchema = z.preprocess(
  (raw) => {
    if (!raw || typeof raw !== "object") return raw;
    const o = raw as Record<string, unknown>;
    return {
      ...o,
      schoolId: emptyToUndef(o.schoolId),
      schoolName: emptyToUndef(o.schoolName),
      utilityGroupId: emptyToUndef(o.utilityGroupId),
      utilityGroupName: emptyToUndef(o.utilityGroupName),
    };
  },
  z.object({
    name: z.string().min(1),
    level: z.number().int().min(0).max(9),
    actions: z.union([z.number().int().positive(), z.null()]).optional(),
    target: spellTargetSchema,
    body: z.string(),
    castingNote: z.string().optional(),
    schoolId: z.string().min(1).optional(),
    schoolName: z.string().min(1).optional(),
    utilityGroupId: z.string().min(1).optional(),
    utilityGroupName: z.string().min(1).optional(),
  }).strict(),
);

const spellRowSchema = spellRowBaseSchema
  .refine(
    (row) =>
      row.actions !== undefined ||
      (row.castingNote !== undefined && row.castingNote.length > 0),
    {
      message:
        "Set actions (heroic action count) or fill castingNote for non-action cast times",
    },
  )
  .transform((row) => {
    let actions: number | null | undefined = row.actions;
    if (
      actions === undefined &&
      row.castingNote !== undefined &&
      row.castingNote.length > 0
    ) {
      actions = null;
    }
    return { ...row, actions: actions! };
  })
  .refine(
    (r) =>
      (r.schoolId !== undefined &&
        r.schoolName !== undefined &&
        r.utilityGroupId === undefined &&
        r.utilityGroupName === undefined) ||
      (r.utilityGroupId !== undefined &&
        r.utilityGroupName !== undefined &&
        r.schoolId === undefined &&
        r.schoolName === undefined),
    { message: "row must be either a school spell or a utility spell" },
  )
  .refine(
    (s) =>
      (s.actions === null && s.castingNote && s.castingNote.length > 0) ||
      (s.actions !== null && s.castingNote === undefined),
    { message: "actions must be a positive integer, or null with castingNote set" },
  );

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

/** Document order for Core Rules spell schools */
const SCHOOL_ORDER = [
  "fire-spells",
  "ice-spells",
  "lightning-spells",
  "wind-spells",
  "radiant-spells",
  "necrotic-spells",
] as const;

/** Document order for utility spell subsections */
const UTILITY_GROUP_ORDER = [
  "utility-ice",
  "utility-fire",
  "utility-lightning",
  "utility-tempest-s-command",
  "utility-wind",
  "utility-radiant",
  "utility-necrotic",
] as const;

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
  const { schoolId, schoolName, utilityGroupId, utilityGroupName, ...spell } =
    row;
  void schoolId;
  void schoolName;
  void utilityGroupId;
  void utilityGroupName;
  return spell;
}

export function buildSpellSchools(rows: SpellRowData[]): SpellSchoolBlock[] {
  const bySchool = new Map<string, SpellRowData[]>();
  for (const row of rows) {
    if (!row.schoolId) continue;
    const list = bySchool.get(row.schoolId) ?? [];
    list.push(row);
    bySchool.set(row.schoolId, list);
  }
  return SCHOOL_ORDER.filter((id) => bySchool.has(id)).map((id) => {
    const group = bySchool.get(id)!;
    const name = group[0]!.schoolName!;
    return {
      id,
      name,
      spells: group.map(entryFromRow),
    };
  });
}

export function buildUtilitySpellGroups(
  rows: SpellRowData[],
): UtilitySpellGroupBlock[] {
  const byGroup = new Map<string, SpellRowData[]>();
  for (const row of rows) {
    if (!row.utilityGroupId) continue;
    const list = byGroup.get(row.utilityGroupId) ?? [];
    list.push(row);
    byGroup.set(row.utilityGroupId, list);
  }
  return UTILITY_GROUP_ORDER.filter((id) => byGroup.has(id)).map((id) => {
    const group = byGroup.get(id)!;
    const name = group[0]!.utilityGroupName!;
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

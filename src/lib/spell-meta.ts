import type { SpellTarget } from "../models/spells";

const TARGET_LABEL: Record<SpellTarget, string> = {
  "single-target": "Single Target",
  self: "Self",
  aoe: "AoE",
  "two-targets": "2 Targets",
  "multi-target": "Multi-target",
  "single-target-plus": "Single Target+",
  "single-target-or-self": "Single Target/Self",
};

/** 0 = Cantrip; 1–9 = ordinal tier */
export function formatSpellLevel(level: number): string {
  if (level === 0) return "Cantrip";
  const suf =
    level === 1 ? "st" : level === 2 ? "nd" : level === 3 ? "rd" : "th";
  return `${level}${suf} level`;
}

export function formatSpellTarget(target: SpellTarget): string {
  return TARGET_LABEL[target];
}

/** "1 Action" or "2 Actions" from a positive integer */
export function formatActionCount(actions: number): string {
  return `${actions} ${actions === 1 ? "Action" : "Actions"}`;
}

/**
 * Middle segment after level: either action count, casting note, or both implied by castingNote only.
 * Examples: "1 Action", "2 Actions", "Casting Time: 1 minute", "24 hours"
 */
export function formatSpellCasting(
  actions: number | null,
  castingNote: string | undefined,
): string {
  if (actions !== null) return formatActionCount(actions);
  if (castingNote) return castingNote;
  return "";
}

/** Italic meta line as in the original Core Rules (markdown). */
export function spellMetaMarkdown(
  level: number,
  actions: number | null,
  target: SpellTarget,
  castingNote?: string,
): string {
  const tier = formatSpellLevel(level);
  const cast = formatSpellCasting(actions, castingNote);
  const tgt = formatSpellTarget(target);
  const middle = cast ? `${tier}, ${cast}, ${tgt}` : `${tier}, ${tgt}`;
  return `_${middle}_`;
}

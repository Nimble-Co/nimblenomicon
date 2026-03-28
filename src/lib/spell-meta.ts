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

/** Italic meta line as in the original Core Rules (markdown). */
export function spellMetaMarkdown(
  level: number,
  castingTime: string,
  target: SpellTarget,
): string {
  const tier = formatSpellLevel(level);
  const cast = castingTime.trim();
  const tgt = formatSpellTarget(target);
  const middle = cast ? `${tier}, ${cast}, ${tgt}` : `${tier}, ${tgt}`;
  return `_${middle}_`;
}

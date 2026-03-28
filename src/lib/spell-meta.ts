import type { SpellLevel, SpellTarget } from "../models/spells";

const TARGET_LABEL: Record<SpellTarget, string> = {
  "single-target": "Single Target",
  self: "Self",
  aoe: "AoE",
  "two-targets": "2 Targets",
  "multi-target": "Multi-target",
  "single-target-plus": "Single Target+",
  "single-target-or-self": "Single Target/Self",
};

export function formatSpellLevel(level: SpellLevel): string {
  if (level === "cantrip") return "Cantrip";
  const n = Number(level);
  const suf = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
  return `${n}${suf} level`;
}

export function formatSpellTarget(target: SpellTarget): string {
  return TARGET_LABEL[target];
}

/** Italic meta line as in the original Core Rules (markdown). */
export function spellMetaMarkdown(
  level: SpellLevel,
  actions: string,
  target: SpellTarget,
): string {
  const tier = formatSpellLevel(level);
  const act = actions.trim();
  const tgt = formatSpellTarget(target);
  const middle = act ? `${tier}, ${act}, ${tgt}` : `${tier}, ${tgt}`;
  return `_${middle}_`;
}

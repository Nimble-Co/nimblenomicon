/** Trailing punctuation for Core Rules list labels (stored in MDX, not JSON `name`). */
export function listLabel(name: string, suffix: "." | ":" = "."): string {
  return `${name}${suffix}`;
}

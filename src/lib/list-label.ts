/** Trailing punctuation for Core Rules list labels (stored in MDX, not JSON `name`). */
export function listLabel(name: string, suffix: "." | ":" = "."): string {
  return `${name}${suffix}`;
}

/** Character class `name` in data is lowercase; render in ALL CAPS in the site. */
export function classDisplayName(name: string): string {
  return name.toUpperCase();
}

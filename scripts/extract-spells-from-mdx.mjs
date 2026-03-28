/**
 * Split spell sections from core-rules.mdx into JSON for data-driven rendering.
 * Run: node scripts/extract-spells-from-mdx.mjs
 */
import fs from "node:fs";
import path from "node:path";

const mdxPath = path.resolve("src/content/docs/core-rules.mdx");
const outPath = path.resolve("src/data/spells.json");

const text = fs.readFileSync(mdxPath, "utf8");

/** @param {string} chunk */
/** @param {string} prefix e.g. "### " or "#### " */
function splitByHeading(chunk, prefix) {
  const lines = chunk.split("\n");
  const items = [];
  let i = 0;
  const plen = prefix.length;
  const escapePrefix = prefix.replace(/[#\s]/g, "\\$&");
  const nextRe =
    prefix === "### "
      ? /^(### |## )/
      : /^(#### |### |## )/;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.startsWith(prefix)) {
      i++;
      continue;
    }
    const name = line.slice(plen).trim();
    i++;
    const bodyLines = [];
    while (i < lines.length && !nextRe.test(lines[i])) {
      bodyLines.push(lines[i]);
      i++;
    }
    items.push({ name, body: bodyLines.join("\n").trim() });
  }
  return items;
}

const fireStart = text.indexOf("## Fire Spells");
const utilityStart = text.indexOf("## Utility Spells");
const optionalStart = text.indexOf("# Optional Variant Rules");

if (fireStart < 0 || utilityStart < 0 || optionalStart < 0) {
  console.error("Could not find spell section markers");
  process.exit(1);
}

const tiered = text.slice(fireStart, utilityStart);
const utility = text.slice(utilityStart, optionalStart);

const schoolNames = [
  "Fire Spells",
  "Ice Spells",
  "Lightning Spells",
  "Wind Spells",
  "Radiant Spells",
  "Necrotic Spells",
];

const schools = [];
for (let s = 0; s < schoolNames.length; s++) {
  const header = `## ${schoolNames[s]}`;
  const nextHeader =
    s + 1 < schoolNames.length
      ? `## ${schoolNames[s + 1]}`
      : "## Utility Spells";
  const i0 = tiered.indexOf(header);
  const i1 = tiered.indexOf(nextHeader, i0 + header.length);
  const chunk =
    i1 < 0
      ? tiered.slice(i0 + header.length)
      : tiered.slice(i0 + header.length, i1);
  const spells = splitByHeading(chunk, "### ");
  schools.push({
    id: schoolNames[s].toLowerCase().replace(/\s+/g, "-"),
    name: schoolNames[s],
    spells,
  });
}

const utilBody = utility.replace(/^## Utility Spells\s*\n+/, "");
const utilParts = utilBody.split(/\n(?=### )/).filter((p) => p.startsWith("###"));

const utilitySchools = utilParts.map((sub) => {
  const nl = sub.indexOf("\n");
  const titleLine = sub.slice(0, nl).replace(/^###\s+/, "").trim();
  const rest = sub.slice(nl + 1);
  const spells = splitByHeading(rest, "#### ");
  const id = `utility-${titleLine
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
  return { id, name: titleLine, spells };
});

const payload = { schools, utilitySchools };
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log("Wrote", outPath, {
  schoolSpellCounts: schools.map((x) => x.spells.length),
  utilityCounts: utilitySchools.map((x) => x.spells.length),
});

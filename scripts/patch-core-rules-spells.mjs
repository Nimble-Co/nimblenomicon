import fs from "node:fs";
import path from "node:path";

const mdxPath = path.resolve("src/content/docs/core-rules.mdx");
const text = fs.readFileSync(mdxPath, "utf8");

const fireMarker = "## Fire Spells\n";
const optionalMarker = "# Optional Variant Rules\n\n";
const iFire = text.indexOf(fireMarker);
const iOpt = text.indexOf(optionalMarker);

if (iFire < 0 || iOpt < 0) {
  console.error("markers missing", { iFire, iOpt });
  process.exit(1);
}

const partA = text.slice(0, iFire);
const partC = text.slice(iOpt);

const spellsBlock = `{spellsData.schools.map((school) => (
  <>
    <h2>{school.name}</h2>
    {school.spells.map((spell) => (
      <>
        <h3>{spell.name}</h3>
        <div set:html={renderMarkdown(spell.body)} />
      </>
    ))}
  </>
))}

<h2>Utility Spells</h2>

Some classes can choose from among these additional spells as they level up.

{spellsData.utilitySchools.map((us) =>
  "flat" in us && us.flat ? (
    <>
      <h3>{us.name}</h3>
      <div set:html={renderMarkdown(us.body)} />
    </>
  ) : (
    <>
      <h3>{us.name}</h3>
      {us.spells.map((spell) => (
        <>
          <h4>{spell.name}</h4>
          <div set:html={renderMarkdown(spell.body)} />
        </>
      ))}
    </>
  ),
)}

`;

const newText = partA + spellsBlock + partC;
fs.writeFileSync(mdxPath, newText, "utf8");
console.log("Replaced spell bodies:", iOpt - iFire, "chars");

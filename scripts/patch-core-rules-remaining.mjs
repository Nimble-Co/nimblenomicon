import fs from "node:fs";
import path from "node:path";

const p = path.resolve("src/content/docs/core-rules.mdx");
let t = fs.readFileSync(p, "utf8");

const ancestryOldStart = "### Human\n\n(Medium)";
const ancestryOldEnd =
  "> **Flavor Is Free.** Want to be a leaping Frogfolk instead of a Bunbun? A Flameborn Kobold? A winged Fairy instead of a Birdfolk? A Badgerfolk instead of a Stoatling? As long as it makes sense and your GM is game, go for it!\n\n## Backgrounds";

const ancestryNew = `{ancestries
  .filter((a) => a.section === "common")
  .map((a) => (
    <>
      <h3>{a.name}</h3>
      <p>{a.sizeLine}</p>
      <p>{a.flavor}</p>
      <div set:html={renderMarkdown(a.trait)} />
      {a.callout && <blockquote set:html={a.callout} />}
    </>
  ))}

## Exotic Ancestries

Your setting may or may not support these choices—check with your GM first before selecting one.

{ancestries
  .filter((a) => a.section === "exotic")
  .map((a) => (
    <>
      <h3>{a.name}</h3>
      <p>{a.sizeLine}</p>
      <p>{a.flavor}</p>
      <div set:html={renderMarkdown(a.trait)} />
      {a.callout && <blockquote set:html={a.callout} />}
    </>
  ))}

## Backgrounds`;

const iA = t.indexOf(ancestryOldStart);
const jA = t.indexOf(ancestryOldEnd);
if (iA < 0 || jA < 0) throw new Error("ancestry block not found");
t = t.slice(0, iA) + ancestryNew + t.slice(jA + ancestryOldEnd.length);

const bgOldStart = "**Back Out of Retirement.** You've forgotten more than most adventurers";
const bgOldEnd =
  "> Work with your GM to ensure any changes align with your game's setting and are balanced with other backgrounds. These are here to inspire creativity—what you build with them is entirely up to you!\n\n## Adventuring Motivation";

const bgNew = `{backgrounds.map((md) => (
  <div set:html={renderMarkdown(md)} />
))}

## Adventuring Motivation`;

const iB = t.indexOf(bgOldStart);
const jB = t.indexOf(bgOldEnd);
if (iB < 0 || jB < 0) throw new Error("background block not found");
t = t.slice(0, iB) + bgNew + t.slice(jB + bgOldEnd.length);

const armorOldStart = "### Cloth\n\n| Item              | Armor | Cost      |";
const armorOldEnd =
  "| Dragon Shield (Req. 3 STR) | 8     | 9,000 gp |\n\n> **Deflect!**";

const armorNew = `{armorTableSections.map(({ category: cat, label }) => (
  <>
    <h3>{label}</h3>
    <table>
      <thead>
        <tr>
          <th>
            <strong>
              <em>ITEM</em>
            </strong>
          </th>
          <th>
            <strong>
              <em>ARMOR</em>
            </strong>
          </th>
          <th>
            <strong>
              <em>COST</em>
            </strong>
          </th>
        </tr>
      </thead>
      <tbody>
        {armorRows
          .filter((row) => row.category === cat)
          .map((row) => (
            <tr>
              <td>{row.item}</td>
              <td>{row.armor}</td>
              <td>{row.cost}</td>
            </tr>
          ))}
      </tbody>
    </table>
  </>
))}

> **Deflect!**`;

const iAr = t.indexOf(armorOldStart);
const jAr = t.indexOf(armorOldEnd);
if (iAr < 0 || jAr < 0) throw new Error("armor block not found");
t = t.slice(0, iAr) + armorNew + t.slice(jAr + armorOldEnd.length);

const magicOldStart = "### Weapon of Many Hands\n\n_(Rarity varies)_";
const magicOldEnd =
  "**Recharge:** A sacred hymn must be sung over it ceaselessly for 100 years.\n\n# Spells";

const magicNew = `{magicalItems.map((item) =>
  item.kind === "standard" ? (
    <>
      <h3>{item.name}</h3>
      {item.subtitle && <div set:html={renderMarkdown(item.subtitle)} />}
      {item.paragraphs.map((para) => (
        <div set:html={renderMarkdown(para)} />
      ))}
      {item.bullets && item.bullets.length > 0 && (
        <div
          set:html={renderMarkdown(
            item.bullets.map((b) => "- " + b).join(String.fromCharCode(10)),
          )}
        />
      )}
      {item.callout && <blockquote set:html={item.callout} />}
    </>
  ) : (
    <>
      <h3>{item.name}</h3>
      {item.subtitle && <div set:html={renderMarkdown(item.subtitle)} />}
      {item.body && <div set:html={renderMarkdown(item.body)} />}
      <p>
        <strong>Recharge:</strong> {item.recharge}
      </p>
    </>
  ),
)}

# Spells`;

const iM = t.indexOf(magicOldStart);
const jM = t.indexOf(magicOldEnd);
if (iM < 0 || jM < 0) throw new Error("magical items block not found");
t = t.slice(0, iM) + magicNew + t.slice(jM + magicOldEnd.length);

fs.writeFileSync(p, t, "utf8");
console.log("patched ancestry, backgrounds, armor, magical items");

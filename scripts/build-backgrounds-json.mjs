import fs from "node:fs";
import path from "node:path";

/** Verbatim markdown segments (order matches core-rules Backgrounds section). */
const segments = [
  "**Back Out of Retirement.** You've forgotten more than most adventurers these days know! Talk with your GM, what made you come out of retirement?\n\n- **Let's see if I remember how to do this...** You may gain 1 Wound to use an ability or cast a spell as if you were 1 level higher.\n- **These old bones.** Your age has long since started to show. –1 max Wounds.",

  "**Devoted Protector.** Choose 1 ally in your party. You can survive +3 max Wounds as long as they are nearby. Whenever they take a Wound, you do too.",

  "**Academy Dropout.** School just isn't for everyone! You learn by experience in the _real world_ (or at least that's what you tell yourself). Learn any 1 Utility Spell.",

  "**Made a BAD Choice.** Start with 500 or 1000 extra gold, or an uncommon/rare magical item (that your GM allows). Gain an equally powerful curse or enemy who wants it back. If you choose this background, your GM may allow you to choose another.",

  "**Haunted Past.** You are haunted by voices that occasionally give you cryptic advice. The voices are sometimes VERY helpful. Other times they only want to see you suffer. Advantage against fear.",

  "**Ear to the Ground.** Advantage on checks to know or obtain gossip for events that will soon happen or have happened less than 1 year ago.",

  "**What? I've Been Around.** _1/per location_ (or at the GM's discretion). You happen to know JUST the person who has the information you're looking for, or could get you out of a jam, and… Roll 1d20:\n\n- **1–5.** They want you DEAD.\n- **6–12.** You owe them money.\n- **13–19.** They can be convinced to help you..\n- **20.** They are your biggest fan/are madly in love with you.",

  "**Acrobat.** Can be thrown by a larger ally, REALLY far. Half damage from falling and forced movement.",

  "**Wild One.** Whether it is the sticks or flowers in your hair, your smell, or the way you carry yourself, wild creatures are less frightened of you and more willing to aid you. +1 Naturecraft. While Field Resting, roll your Hit Dice with advantage while in the wild.",

  "**Fey Touched.** You take half damage from all magical effects, double from weapons made of metal (before armor is applied).",

  "**Survivalist.** You never run out of your own personal rations. Anything can be food if you try hard enough! Advantage against poison saves. +1 max Hit Die.",

  "**Home at Sea.** Recover twice as many Wounds and HP while resting on a ship or near water. You can fill in for a first mate or captain in a pinch. Advantage on water-related skill checks.",

  "**At Home Underground.** You can dig twice as fast as others. Safe resting locations underground always count as Lavish lodging for you. You struggle to rest (INT save) while it's raining. “Water… from the SKY?!“",

  "**Raised by Goblins.** You speak Goblin natively (much better than one who has learned it later in life). You automatically notice and can avoid crudely-made traps and have advantage to notice and disarm more sophisticated traps.",

  "> **Change It Up!** You can choose any other ancestry to be raised by instead, and exchange the known language and get 1 helpful/iconic ability those people would inculcate (e.g., Dwarves know Dwarvish and are very good with smithing or stonecraft).",

  "**History Buff.** Advantage on all Lore checks related to knowledge about items, facts, or events that happened more than 100 years ago.",

  "**(Former) Con Artist.** You can forge most documents or mimic voices flawlessly. You have a criminal contact in most major cities. However, your reputation often precedes you—until you prove yourself to be trustworthy.",

  "**(Secretly) Undead.** Unnatural Resilience: You are immune to disease and do not need to eat, drink, or breathe. Children, animals, and Celestials are uneasy in your presence; many will be horrified to discover your true nature.",

  "**Taste for the Finer Things.** You always have up-to-date knowledge of the customs and dress of the upper classes and may even know many of their secrets. Advantage on Influence checks with the upper class.",

  "**Fearless.** You are immune to the Frightened condition. +1 Initiative. –1 Armor.",

  "**So Dumb I'm Smart Sometimes.** (Req. 0 or negative INT at character creation.) Reroll an INT-related skill check, 1/day. Reroll a failed INT save with advantage, 1/Safe Rest.",

  "**Wily Underdog.** (Req. 0 or negative STR at character creation.) Reroll a failed STR-related roll (e.g., STR attack, STR save, Might check) and use another stat instead, 1/day.",

  "**Bumblewise.** (Req. 0 or negative WIL at character creation.) A result of 1 or less on any WIL-related roll counts as a natural 20 (WIL save, Naturecraft, Perception, Influence, or Insight check).",

  "**Accidental Acrobat.** (Req. 0 or negative DEX at character creation.) Whenever you fail a DEX-related roll (e.g., DEX attack, DEX save, Stealth check, Finesse check), you may roll again. If you still fail, the consequences are BAD.",

  "**Tradesman/Artisan.** Choose a profession (Baker/Cook, Smith, Stonemason, Weaver, Leatherworker, etc.). Checks you make related to that profession are made with advantage. You also retain special knowledge related to your profession.",

  "> **Make It Your Own!** Remember, backgrounds are just a starting point—you're free to adjust, reimagine, or completely rewrite them to suit your character's story. If you want to know a Utility Spell but don't like the Academy Dropout flavor, come up with a different reason why your character might know it. Maybe they learned it from a traveling bard or discovered it etched into an ancient relic.\n>\n> Feel free to swap traits, change the flavor text, or blend backgrounds together. Haunted Past might become Blessed by Spirits if your character views their other- worldly voices as guardians rather than tormentors.\n>\n> Work with your GM to ensure any changes align with your game's setting and are balanced with other backgrounds. These are here to inspire creativity—what you build with them is entirely up to you!",
];

const wrapped = segments.map((body) => ({ body }));
fs.writeFileSync(
  path.resolve("src/data/backgrounds.json"),
  JSON.stringify(wrapped, null, 2) + "\n",
);
console.log("backgrounds.json segments", wrapped.length);

# Nimblenomicon

An online searchable, quick reference repository of ALL the published Nimble content. Free to use for anyone who already has the books, cannot afford them, or is testing the system out. GM tools, Player tools, resources, and more.

## Smarter rules reference (brainstorm)

- **Deep, system-aware search**
  - Rules-aware search that surfaces canonical rule snippets plus related rules for concepts like opportunity attacks, Dying, or Hampered.
  - Concept search for questions like “easy encounter for 3 level 4 heroes,” returning encounter guidelines prefilled with those party numbers.
  - Synonym mapping so shorthand like “OA” or “reaction attack” resolves to Opportunity Attack.

- **Entity browsers (rules-linked indexes)**
  - Spell browser with filters for school, tier, range vs reach, tactical tags (control, heal, summon, AoE, high-risk, secret spell).
  - Monster browser with filters for level, armor band, environment/biome, role (brute, skirmisher, controller, glass cannon, tank), legendary/minion/flunky flags.
  - Item browser with filters for slot, rarity, cost band, and tags (mobility, defensive, summoning, utility).
  - Class/hero browser that summarizes key stats, mana progression, spell schools, and party role tags.

- **Rule explainer panels**
  - Inline explainer sidebars for spells/features/monsters that summarize key mechanical interactions (conditions used, KEY stat, mana/upcast rules, synergies).
  - Condition cards that pop up on hover/tap with concise rules text and common combos.
  - Visual advantage/disadvantage explainer widget showing how multiple instances stack/cancel with concrete examples.

- **Cross-linking and rule graph**
  - Auto-generated “See also” sections on each rule page (Running Monsters, Monster Builder, Combat Structure, Conditions, etc.).
  - A dependency/usage graph that shows which conditions, stats, or subsystems a rule or feature interacts with.
  - Reverse lookup views like “Where is Hampered used?” that list all referencing spells, items, monsters, and rules.

- **Quick-reference frames**
  - A GM Screen view with pinned, high-traffic rules (HP/Wounds, Conditions, Actions/Reactions, Advantage, encounter math) and one-click drill-down.
  - Search presets for “combat” vs “downtime/campaign” that prioritize different rule categories.
  - Mobile-friendly quick cards for at-the-table use, with tap-to-expand callouts and minimal chrome.

- **Contextual helpers**
  - Encounter context bar that, given party levels and size, annotates monsters/encounters with difficulty bands (Easy/Medium/Hard/Deadly/Very Deadly).
  - Economy context that relates item costs to expected “gold per level” to show when purchases are level-appropriate or exceptional.
  - Level-up context that explains when features/spell tiers unlock and how they mesh with HP, Hit Dice, and skill progression.

## Interactive builders (brainstorm)

- **Character Builders**
  - **Character-creation flow**: Class selection as a visual, art-forward flow—cover art for each class (“what class do you want?”), with icon and full art per class so the experience feels like picking from a gallery, not a dropdown.
  - Guided hero creation wizard: pick ancestry/background/class, assign STR/DEX/INT/WIL with clear Key vs Secondary stats and live-updated derived values (initiative, saves, damage dice, mana, languages).
  - Class effectiveness meter: visual feedback on how well chosen stats fit the class’s Key Stats, warning when a build under-invests in its primary dice.
  - HP & Wounds calculator: auto-roll (or fixed) Hit Dice per level with advantage, showing resulting max HP, Wound threshold, and recovery rates compared to level norms.
  - Action economy preview: per-build summary of typical turn patterns (3 actions, reactions, multi-action abilities) and how class features/spells interact with heroic actions and reactions.
  - Spell selection by school & tier: filtered spells by Fire/Ice/Lightning/Necrotic/Radiant/Wind, showing tier, mana cost, upcast options, and KEY usage; warns if chosen spells overload mana vs expected pool.
  - Advantage/disadvantage profile: breakdown of how often the build can generate advantage (class features, conditions, dual wielding, Help, etc.) and where it commonly suffers disadvantage.
  - Weapon & armor optimization: suggested gear packages with damage dice, crit rules, reach/range traits, and proficiency impacts (no crits with non-proficient weapons, extra Defend action in non-proficient armor).
  - Skill point planner: interactive table to assign and reassign skill bonuses per level, enforcing max +12 and no negatives, showing how stat changes propagate.
  - Level-up simulator: multi-level timeline planning future stat bumps, skill shifts, mana growth, new spells, and class features, including when multi-tier spells unlock.
  - Print/export “GM card”: compact, rules-accurate summary of a hero including actions, key reactions, save DCs, common conditions they inflict, and an approximate “threat rating.”
  - **Export & sharing (nice-to-have)**: Export character to PDF; share character link/sheet with other players or the GM.

- **Monster & Encounter Builders**
  - Monster statline generator by level: input monster level to get suggested HP, Armor band, damage per round, attack dice, and save DCs based on Nimble’s Monster Builder table, with sliders to trade stats for special abilities.
  - Combat role templates: presets like glass cannon, tank, controller, skirmisher that auto-adjust HP, damage, and armor following Nimble’s tuning guidance.
  - Die-size theming assistant: recommend default damage and HP dice based on creature type (d4 undead, d6 goblins, d8 humans, d10 beasts, d12 giants, d20 apex threats) with reskin options.
  - Condition & tag builder: choose which conditions (Frightened, Prone, Grappled, Smoldering, Charged, etc.) a monster can inflict and get calibrated attack/save DCs and damage tradeoffs.
  - Ability economy checker: validates that monster abilities don’t overload per-round actions/reactions versus expected DPR for its level.
  - Encounter difficulty calculator: given party size and levels, compute Easy/Medium/Hard/Deadly/Very Deadly bands and show how a chosen set of monsters fits into those bands.
  - Round-by-round simulator: simple probabilistic simulator to estimate length and lethality of an encounter, including Wound/Dying risk and resource drain over several rounds.
  - Armor distribution advisor: warns if an encounter deviates too far from the 60% unarmored / 30% medium / 10% heavy enemy mix, suggesting tweak options.
  - Multi-foe scaling helper: when adding more monsters of the same type, auto-adjust encounter difficulty and suggest minion variants to keep level math sane.
  - Condition load analysis: summary of how many “hampering” effects (Dazed, Grappled, Prone, etc.) an encounter can stack and whether that risks locking heroes out of actions.

- **Treasure & Economy Tools**
  - Gold-per-level budget planner: input party level, size, and campaign length to output expected gold per hero and per arc based on Nimble’s Gold Gain Per Level table.
  - Shop inventory generator by town size: item lists appropriate to settlement size and party level (mundane and magic), constrained by rarity and availability guidance.
  - Magic item pricing sanity-checker: recommend gold price or rarity band from an item’s mechanical benefits, consistent with progression guidelines.
  - Loot package builder per encounter: suggest bundles of coin, trade goods, and magic items for a selected encounter difficulty and party level that keep heroes near the expected wealth curve.
  - Long-term hoard impact visualizer: model the effect of big windfalls on party wealth over future levels and suggest story hooks or sinks to keep economy in bounds.
  - Lifestyle & upkeep estimator: translate current gold into lifestyle and upkeep costs over downtime, helping GMs pace economic pressure.
  - Treasure-to-threat conversion: suggest additional encounters, rival thieves, political complications, or logistical costs when the party exceeds typical wealth thresholds.
  - Spell component & ritual cost tracker: optional tracking of gold costs or rare items tied to specific high-tier or secret spells, aligned with level-based income.

## GM flow tools (brainstorm)

- **Session & Campaign Planning**
  - Encounter Budget Calculator: auto-calc recommended monster levels for Easy/Medium/Hard/Deadly/Very Deadly encounters from hero levels and party size, with suggested monster roles and stat bands.
  - Armor Mix Advisor: given an encounter or dungeon, suggest a foe roster that matches the 60/30/10 armor guidance and explain pacing implications.
  - Session Pacing Planner: outline 2–5 encounters per session, balancing difficulty, social scenes, and exploration, with expected Wound and mana drain to naturally push toward Safe Rests.
  - Safe Rest Pressure Tracker: track anticipated HP/Wound accumulation, treasure, and healing and highlight when Safe Rests become justified vs risky, including “if they push on” risks.
  - Campaign Milestone Mapper: quest milestones tied to level-ups, each with suggested gold rewards, items, and monster level bands to keep progression close to Nimble’s expectations.
  - Class & Stat Spotlight Planner: encounter and scene suggestions that reward each hero’s Key Stats so the campaign naturally showcases each character.
  - Condition-Focused Encounter Seeds: encounter templates built around specific conditions (grapples, fear, blindness, etc.) to lean into Nimble’s condition system.
  - Action Economy Stress-Test Tool: rough round-by-round action/DPR simulation to see whether a fight will feel like a slugfest, glass cannon shootout, or “hard but fair,” with tuning tips.
  - Hero Growth & Re-Spec Notes: reminders at specific levels when players can reassign skills or unlock major features, with prompts for scenes that highlight these.

- **Random Tables & Generators**
  - Encounter Builder by Level & Theme: generate complete encounters from hero levels plus a theme (e.g., undead, goblins, apex beast), keeping stats aligned with Nimble’s math.
  - On-the-Fly Reinforcement Table: quick-roll reinforcements that respect the encounter’s remaining difficulty budget.
  - Conditions-Driven Complications Table: mid-fight complications that introduce key conditions and change advantage/disadvantage landscapes without hard-locking heroes.
  - Treasure & Gold Parcel Generator: loot parcels aligned to party level and Nimble’s gold guidance with sliders for magic frequency and trade-goods vs coin.
  - Shops & Availability Tables: town-size-based roll tables for what items are in stock, their prices, and any special conditions (favors, limited quantities).
  - Spell Scrolls & Secret Spells Drops: random arcane finds with level-scaled chances of hinting or granting a Secret Spell.
  - Wound & Injury Flavor Generator: non-mechanical Wound flavor that adds narrative weight without changing core mechanics.
  - Terrain & Hazard Packs: bundles (icy bridges, smoldering ruins, lightning storms, necrotic graveyards, radiant sanctuaries, slicing winds) with suggested conditions and foes.
  - Initiative & Opening Twist Table: rollable twists that modify the start of combat within Nimble’s rules (surprise, starting actions, etc.).

- **Downtime & World Events**
  - Safe Rest Outcome Generator: small narrative events when heroes rest (rumors, minor thefts, NPC offers) that don’t break gold pacing but open new hooks.
  - Downtime Activity Menus by Class/Stat: activities keyed to stats that yield gold, contacts, or minor boons without hard power creep.
  - Gold Sink & Investment Ideas: tables for how excess gold attracts attention and long-term investments whose returns stay within wealth expectations.
  - Town Mood & Stability Tracker: world-event rolls that shift a settlement’s mood and influence future encounter difficulty, armor mixes, and access to goods.
  - Faction Clock & Response Generator: tools to track how factions adapt (up-armoring elites, recruiting casters, changing encounter comps) using Nimble’s roles and levels.
  - Travel & Road Event Tables: journey events tuned to party level with guidance on when to treat them as full encounters.
  - World-Scale Crisis Escalation: tiered crises that evolve between sessions, each step suggesting encounter templates and rest opportunities.
  - Downtime Consequence Resolver: consequences for skipped rest or risky side projects using Wounds, conditions, and resource loss in a fair, Nimble-consistent way.
  - Reputation & Legend Tracker: logs heroic deeds, Wounds survived, and apex foes defeated, triggering world reactions without altering core progression.

## Player companion tools (brainstorm)

- **Trackers & Play Aides**
  - HP / Wounds / Dying tracker: HP bar with 0-HP auto-prompt to add Wounds, flip to Dying, and warn about attacking/casting while Dying.
  - Wound clock & death threshold: visual Wound track showing current Wounds, Safe Rest recovery, and “X Wounds from death” warnings.
  - Mana & spell tier tracker: mana pool UI with quick buttons per unlocked tier, enforcing upcast limits and highlighting out-of-mana states.
  - Action economy dashboard: 3-action counter that resets at end of turn, supports multi-action activities across turns with Concentration flag and Hampered state.
  - Initiative & starting actions helper: enter Initiative total to see starting actions (1/2/3) plus surprise-related advantage/disadvantage.
  - Advantage/disadvantage dice helper: tracker for stacked advantage/disadvantage instances and resulting dice pool.
  - Exploding crit roller: dice roller that automatically chains max rolls on the Primary Die and applies crit riders.
  - Rushed attack tracker: per-turn attack list that tags extra attacks as Rushed and adds correct disadvantage.
  - Heroic reactions monitor: tracks off-turn reactions and subtracts from next turn’s actions; quick buttons for Defend, Interpose, Opportunity Attack, Help, etc.
  - Conditions panel per hero: tap-to-add conditions with attached mechanical summaries.
  - Smoldering/Charged/minor status tracker: mini-panel tracking minor tags and listing spells/abilities that interact with them.
  - Armor & Defend helper: tracks Armor and armor type and shows expected reduction when using Defend, including non-proficiency costs.
  - Movement & Hampered state: base speed slider and toggles for Difficult Terrain, Prone, Slowed, Grappled, with outputs and Hampered flag.
  - Dual wield & weapon mode toggler: track primary/off-hand weapons, dual-wield advantage (1/round), and proficiency flags.
  - Spell targeting & AoE helper: for a chosen spell, set target count/area and see single-roll application and save DC reminders.
  - Range vs Reach spells UI: dedicated UI differences for Range vs Reach spells, including Range extension via disadvantage dice.

- **Level-Up & Progression**
  - Per-level checklist by class: guided flow for level-ups (Hit Die, Hit Die max, stat/skill updates, features, mana/spells) keyed to class and level.
  - Hit Die & HP growth visualizer: graph of HP over levels with recorded rolls and implications for survivability.
  - Skill point planner: interactive skill grid with caps and reallocation tool enforcing +12 max and 1-point reassign per level.
  - Key Stat & derived values summary: highlight Key Stats with auto-derived Initiative, save DCs, damage dice bands, and languages.
  - Spell tier unlock timeline: class-specific timeline of spell tier unlocks and max upcast tier.
  - Mana budget planning tool: per-day mana spend planner comparing desired casts per tier vs available pool.
  - Equipment & proficiency evolution tracker: level-based view of new weapon/armor proficiencies and suggested loadout changes.
  - Feat / feature milestone map: branching tree of upcoming features, reactions, and multi-action abilities with interaction notes.
  - Wealth & magic item pacing guide: visualization of on-track vs rich vs broke status based on Nimble’s gold-per-level expectations.
  - Encounter difficulty feel estimator: optional “party strength snapshot” that links back to monster level guidelines so players can gauge fights.

- **Quick Rules Aides**
  - Turn structure cheat card: compact view of Nimble turn order, actions, and refresh rules.
  - Standard actions reference: quick list of common actions with exact mechanical notes.
  - Heroic reactions cheat sheet: summary of all core and class-specific reactions and their action-economy impact.
  - Exploding crits explainer: concise explanation with worked examples and edge cases.
  - Rushed attacks & extra-attack math: aid that explains when attacks become Rushed and how disadvantage stacks.
  - Conditions index with mechanical tags: searchable list of conditions with icons and tags (Hampered, Crit-vulnerable, etc.).
  - Status tag interactions reference: matrix of how Smoldering, Charged, and similar tags power up spells/features/items.
  - Range & Reach rules aide: mini-reference on adjacency disadvantage and Range extension rules.
  - Spellcasting basics card: summary of cantrips vs tiered spells, mana costs, upcasting, save DCs, and multi-target rolls.
  - Healing, Safe Rest & Wound recovery summary: overview of HP healing, Wound recovery, and death thresholds.
  - Monster difficulty expectations blurb: short guide for players on what different encounter difficulty bands imply.
  - GM-friendly “Ask the Rules” mode: quick query box returning short, table-ready answers for rules questions.

## Community hub (brainstorm)

- **Homebrew Library**
  - Homebrew heroes/classes browser: filterable custom heroes/subclasses with Key Stats, role tags, mana progression, and tier unlocks.
  - Monster archive by level band: monster index keyed to Nimble’s monster builder (Level, HP band, Armor, DPR, primary die size) with baseline deviation badges.
  - Spell compendium with Nimble structure: homebrew spells organized by School, Tier, casting type, and explicit mana/upcast options.
  - Conditions & statuses module: custom minor tags and variant conditions, each stating how they interact with core conditions.
  - Items & magic gear catalog: homebrew equipment keyed to proficiency types, damage dice, weapon properties, armor bands, and wealth-by-level guidance.
  - Encounter & foe packs: bundles of encounters (with total monster level, armor composition, DPR) sized for specific party levels.
  - Campaign & one-shot vault: scenario shells focused on mechanical structure (encounter ladders, Safe Rests, rewards) more than lore prose.
  - Homebrew “modules” by rules system: packs targeting specific subsystems (wounds variants, initiative tweaks, dual-wield overhauls) with explicit override notes.

- **Tagging & Curation**
  - Balance fit tags: labels like On-baseline, Glass Cannon, Tanky, Low-Damage Controller, auto-suggested by comparing to core tables.
  - Mechanical intent tags: tactical niche tags (Hampered enabler, Smoldering combo piece, Crit fishing, Reaction-heavy, Minion swarm, Zone control).
  - Tier & table-usage recommendations: curator fields like “Recommended for levels 3–6,” “Deadly for low-armor groups,” “High-magic campaigns only.”
  - School & synergy tagging for spells: explicit cross-school combo tags and condition chains.
  - Complexity & prep overhead rating: sliders for rules load, tracking overhead, and GM adjudication needed.
  - Playtest feedback threads: structured feedback capturing damage vs baseline, impact on Wounds/Dying, encounters per Safe Rest, etc.
  - Curated “balanced” badges: badges awarded once play reports converge within acceptable variance from Nimble’s heuristics.
  - Tag-based collections: auto-generated lists like “Level 1-friendly Radiant heals” or “Wound-heavy grimdark variants” based on tags and ratings.

- **Remix & Adaptation Tools**
  - Monster reskinner with baseline guardrails: start from an official monster and adjust theme/abilities while a panel tracks level, HP, Armor, DPR vs the Monster Builder.
  - Spell up/down-tier adapter: rebuild spells at a new tier by auto-adjusting damage, range, and effects within per-tier budgets.
  - School swap helper: convert spells between schools (e.g., Fire ↔ Lightning) by swapping damage types, riders, and condition tags while preserving power.
  - Condition re-mapper: UI to change which conditions or states a feature focuses on, with checks against infinite-advantage loops or hard-lock combos.
  - Class archetype fork wizard: clone a class/subclass and tweak Key Stats, role emphasis, and feature progression with warnings when exceeding power budgets.
  - Item power-scaler: generate lesser/greater variants of items by scaling dice, charges, or condition interactions, tied back to gold and rarity guidance.
  - Encounter difficulty tuner: drag-and-drop foes with a live Easy/Medium/Hard/Deadly/Very Deadly meter vs a specified party.
  - Template-based variant generator: recipes like “elite version,” “minion swarm version,” or “solo boss” that auto-adjust level, HP, DPR, and action economy for you to flavor.

## Market research – lessons from existing tools

- **What D&D Beyond does well**
  - Deep, official integration for a single game system (5e), with a polished character builder, encounter builder, rules compendium, and homebrew tools all living in one ecosystem.
  - Strong rules linking and discoverability: most stat blocks, spells, and class features are hyperlinked, making it easy to jump between related rules.
  - At-the-table usability for many groups: browser + mobile app support, quick reference for spells/items/monsters, and (now) multiple VTT options that tie into character data.

- **Common D&D Beyond complaints to avoid**
  - Performance problems: reports of very slow page loads, timeouts (504s), and especially sluggish character creation flows; Nimblenomicon should prioritize fast, lightweight pages, and snappy builders.
  - Risky redesigns and UI regressions: recent visual overhauls described by users as “terrible,” hurting clarity and usability; Nimblenomicon should favor incremental, opt-in UX changes and keep dense rules views readable.
  - Mobile readability issues: complaints about poor font sizing/contrast and layout on phones; Nimblenomicon should design mobile-first quick-reference views for conditions, spells, and actions.
  - Overpromise/underdeliver perception: users feel burned by announced features that arrive late or underpowered; Nimblenomicon should ship smaller, reliable features and be conservative about roadmapping.
  - Fragmented access & cost: lots of paid add-ons and the feeling of “rebuying” content; for Nimble, we should be clear about what is free, what requires owning the books, and avoid nickel-and-diming core reference use.

- **What Demiplane / Pathfinder Nexus does well**
  - Multi-system digital platform: supports many RPGs (Pathfinder, Vampire, Avatar, etc.), suggesting patterns for system-agnostic UX while still respecting each game’s unique rules.
  - Rich feature roadmap: character tools, GM tools, active effects, crafting/alchemy, PDF exports, and integrations (e.g., Roll20 sync) show how a platform can grow beyond a basic compendium.
  - Cross-platform and integration mindset: explicit focus on linking with VTTs instead of trying to be everything itself; Nimblenomicon could aim to play nicely with lightweight VTTs rather than building a VTT from scratch.

- **Common Demiplane complaints to avoid**
  - Double-paying for content: users upset at having to buy PDFs _and_ buy digital licenses again; Nimblenomicon should be very careful about any model that feels like repurchasing Nimble books.
  - License-only access and weak offline story: you’re mostly buying platform access, not files you can keep; for Nimblenomicon, emphasizing “open markdown + search” with good export options would differentiate.
  - Value vs free alternatives: Pathfinder has strong free tools (e.g., Pathbuilder), so Demiplane struggles to justify its cost; Nimblenomicon should lean on what is uniquely Nimble-aware (Wounds, heroics, conditions, monster math) and what’s freely accessible.
  - Early-stage roughness: alpha-level performance and mobile issues were noted; our design should set performance and simplicity as non-negotiables from the outset.

- **Broader digital TTRPG tool ecosystem lessons (Roll20, Foundry, etc.)**
  - Pricing & ownership tradeoffs: subscription-heavy models (Roll20) vs one-time purchase (Foundry) generate strong opinions; Nimblenomicon, as a reference/tooling site, should be clear, simple, and generous in its pricing (if any).
  - Complexity vs accessibility: Foundry is powerful but has a steep learning curve and self-hosting burden; Roll20 is easier but can feel clunky and buggy. Nimblenomicon should aim for “just works in the browser” with minimal setup and a gentle learning curve.
  - Avoid feature bloat: many platforms pack in too many half-finished features; for Nimble, we should focus on a few best-in-class flows (search, builders, trackers) instead of duplicating full VTT complexity.
  - Reliability & responsiveness matter more than flash: users routinely trade away fancy 3D/animation for a stable, fast, and readable rules tool. Nimblenomicon should emphasize speed, clarity, and low friction over heavy visuals.

- **Product inspiration & UX preferences (from notes)**
  - **5e tools**: Different boxes for the tools that exist—clear separation of tool categories.
  - **Nimbound**: Looks a lot cleaner; wish it looked more like the character sheet and was more art-forward.
  - **Pathbuilder**: Worth considering as a reference for structure and flow.
  - **D&D Beyond**: Too much information at once. Liked: standard array display, character-sheet-like layout, 3D dice rolling with math included. Disliked: quick rules popping up and covering the screen.
  - **Shadowdarklings**: Prefer showing one thing at a time (with maybe an “expert mode” for power users who want everything visible). Avoid dropdowns; favor visual, step-by-step presentation.
  - **Tabletop town**: Liked the card generator and overall layout.
  - **Nimbrew**: Noted as inspiration to consider.
  - **GURPS character builder**: Liked “generate random name,” picking from images, and mouse-over tooltips—consider similar QoL (tooltips, image-based choices, name generator) for Nimblenomicon.

- **Nice-to-have / future**
  - **Mobile app**: Dedicated mobile app or installable PWA experience so Nimblenomicon works as an at-the-table app on phones and tablets (currently scoped as mobile-friendly web).
  - **Offline support**: Core rules, conditions, spells, and trackers usable without a connection; see *Offline & low-connectivity behavior* under Performance & architecture notes for scope.
  - GM sees rolls from players (shared roll visibility at the table).

## Transcript feedback to incorporate (gaps this brainstorm had)

- **Product boundary and positioning (explicit)**
  - Treat Nimblenomicon as a Nimble-native rules + utility hub, not a "do everything" TTRPG platform.
  - Keep a clear line between core strengths (search, reference, builders, trackers) and adjacent domains (full VTT, giant social platform, etc.).
  - Define success as "fastest path to accurate Nimble answers/actions at the table," not feature parity with every competitor.

- **First-party ownership principle (explicit non-negotiable)**
  - Prefer first-party control of roadmap, UX, access model, and data portability over dependency on third-party platform operators.
  - If integration partners are used, keep them optional and replaceable; avoid critical path lock-in to external terms of service.
  - Add an architecture rule: core reference + core builders must still function if any third-party integration is removed.

- **Federated ecosystem strategy (Nomicon + Nexus/community)**
  - Nomicon should not try to absorb all homebrew hosting; keep a hub model that links to strong community destinations (including Nexus-style hubs).
  - Add "Curated outbound links" to relevant pages (class pages link to trusted homebrew class variants, condition pages link to vetted encounter packs, etc.).
  - Build discovery primitives for federation: badges like "official," "community-vetted," "playtest-heavy," and explicit source attribution.

- **Character-builder UX stance from transcript research**
  - Favor progressive disclosure by default (one focused step at a time), with optional "expert mode" to show dense data for advanced users.
  - Preserve a character-sheet-like mental model throughout creation so users always understand where they are and what changed.
  - Prioritize visual, scannable choices (art/cards/icons) over nested dropdown-heavy flows, especially on mobile.
  - Avoid intrusive overlays/tooltips that block context during decision-making.

- **Search and linking should be the spine, not a feature**
  - Promote global search + cross-linked conditions/rules from "important feature" to "core product backbone."
  - Every major object (spell, condition, monster, feature) should answer both: "what is this?" and "what else does this interact with?"
  - Add reverse-lookup UX as a first-class surface ("show me everything that applies Hampered/Smoldering/Charged").

- **Delivery discipline and trust management**
  - Add a "promise budget": publicly commit only to near-term, testable increments; avoid broad roadmap promises without implementation confidence.
  - Ship in vertical slices (search slice, builder slice, tracker slice) with explicit quality gates for performance and usability before expansion.
  - Define anti-bloat guardrails: new major feature only ships if it clearly improves one of the top workflows and does not degrade speed/readability.

- **Research and decision cadence (operating model)**
  - Formalize competitor review loops: periodically test key flows in D&D Beyond, Pathbuilder, Shadow Darklings, and reference hubs, then log adopt/avoid decisions.
  - For each candidate pattern, document: what problem it solves, what Nimble adaptation is needed, and what tradeoff it introduces.
  - Keep a "borrowed patterns registry" so the team can track which ideas were adapted and why.

- **New explicit non-goals (to prevent scope drift)**
  - Not a full virtual tabletop replacement in v1.
  - Not a monopoly host for all community content.
  - Not a heavy, animation-first experience that sacrifices readability/performance.
  - Not a paywalled basic rules lookup experience.

## Performance & architecture notes

- **Performance budgets for Nimblenomicon**
  - Set explicit budgets for key web-vital-style metrics: aim for TTI < 3s, FCP < 1.5s on mid-range mobile, and total page payload (HTML + CSS + JS + fonts) ideally < 500KB for core reference views.
  - Target good Core Web Vitals thresholds: LCP ≤ 2.5s, INP ≤ 200ms for interactions like expanding a rule, opening a spell, or adding a condition, and CLS ≤ 0.1 so rules pages don’t jump as they load.
  - Keep request counts low (≈30 or fewer) and aggressively control third-party scripts so main-thread time stays short and interactions remain snappy even during long sessions.

- **High-level architecture direction**
  - Treat Nimblenomicon primarily as a **content-first static app**: statically generate rules pages, monsters, spells, and items from the Nimble Vault + official data, then layer light client-side interactivity on top.
  - Prefer SSR/SSG (Next/Remix/Astro/etc.) and server components for heavy lifting, shipping minimal client JS for pure reference views so they behave like fast documentation sites rather than a heavy SPA.
  - Use a PWA-style shell only where it clearly pays off (e.g., in-character trackers/builders), not for every reference page, to avoid turning the whole thing into a giant bundle.

- **Search architecture**
  - For rules reference search, favor static, low-bandwidth search solutions (e.g., Pagefind-like architecture): prebuild search indexes at deploy time, chunked so the browser only loads what it needs.
  - Keep the search payload small (≈100–300KB for index + library) even for thousands of pages, and support filters (schools, levels, tags) via precomputed metadata rather than complex runtime queries.
  - For heavier, “smart” search features (concept search, reverse lookups), consider a separate API-backed search service while keeping simple text search fully offline-capable.

- **Offline & low-connectivity behavior**
  - Make core rules pages, conditions, spells, and class references available offline via a PWA install option; pre-cache the most common rule sections and indexes.
  - Design the system so in-session trackers (HP/Wounds, mana, conditions) continue to work offline using local storage and sync back when a connection returns.
  - Ensure that failure modes are graceful: if smart search or cloud sync is down, basic lookup and character/monster viewing still function.

- **Instrumenting and enforcing performance**
  - Bake performance checks into CI (Lighthouse / Web Vitals thresholds per key route) and block regressions that break budgets, especially for combat-critical views (conditions, HP/Wounds, actions).
  - Use real-user monitoring (field data) to watch LCP/INP/CLS and per-route latency in production, with dashboards for “table views” (mobile, low bandwidth) to keep them prioritized.
  - Maintain a governance list for scripts and dependencies: every new dependency must justify its JS weight and main-thread cost against the performance budget.

## Accessibility, mobile & UX notes

- **Accessibility baseline (WCAG 2.2, Level AA)**
  - Aim for WCAG 2.2 Level AA compliance across the app: semantic HTML, proper heading hierarchies, labeled form fields, descriptive link text, and proper table markup for stat blocks and spell lists.
  - Respect new 2.2 criteria around mobile and focus: avoid drag-only interactions (always provide click/tap alternatives) and ensure keyboard focus is never obscured by sticky headers or panels.
  - Provide strong, visible focus indicators with sufficient contrast and spacing so keyboard and switch users can navigate long rules pages and builders reliably.

- **Visual design for readability**
  - Default to high-contrast themes with solid backgrounds (no textures behind text) and avoid grey-on-black combinations that have caused accessibility issues in other TTRPG tools.
  - Offer at least one “minimal” theme: black text on light background and white text on dark background with no decorative noise, for users with low vision or reading difficulties.
  - Include a dyslexia-friendly option set: ability to increase line spacing, adjust font size, choose from a small set of highly readable fonts (including at least one dyslexia-friendly face), and disable justified text.
  - Be colorblind-safe by not relying on color alone to convey status (e.g., use icons and text labels for conditions, advantage/disadvantage, and encounter difficulty).

- **Screen reader & keyboard support**
  - Ensure all interactive elements (tabs, accordions, builders, trackers) are reachable and operable via keyboard alone, with logical tab order and ARIA roles where appropriate.
  - Use accessible names and descriptions for buttons like “Add Wound,” “Mark Dying,” “Toggle Condition: Prone” so screen reader users can run encounters and track state.
  - Provide text alternatives/alt attributes for any icons or imagery used in rules summaries, and ensure announcements for dynamic updates (e.g., HP change, Wound added) where it matters for understanding state.

- **Mobile-first layout for reference-heavy content**
  - Design mobile views first: single-column, large tap targets (≈48–56px with spacing), and compressed but scannable rule cards for spells, conditions, actions, and monsters.
  - Use bottom tab navigation for core areas (Rules, Builder, Tracker, Homebrew, Account) instead of hiding primary actions behind a hamburger menu.
  - Keep navigation depth shallow (ideally 3 levels: list → detail → subpanel) and maintain scroll position when users jump in and out of details during play.
  - Use responsive typography (`clamp()`-based fluid sizes) and container queries so stat blocks and tables remain readable on small screens without requiring horizontal scrolling.

- **Mobile interaction patterns at the table**
  - Optimize core at-table workflows (searching a condition, checking a spell, adjusting HP/Wounds) for 1–2 taps from the home view.
  - Design common reference views (Conditions, Actions, Spell Basics) as tappable cards with quick summaries and expanders, instead of forcing users into full article pages.
  - Avoid drag-only gestures (e.g., drag-and-drop ordering) for essential actions; always provide tap-based controls that work on small screens and for users with motor impairments.

- **TTRPG-specific accessibility considerations**
  - Provide high-contrast character and monster sheets with the option to strip color-coding and use icons/text for status instead, similar to the “high contrast” sheets other platforms add via modules.
  - Allow per-user display preferences (theme, font size, dyslexia mode, contrast mode) that apply consistently across rules, builders, and trackers, so mixed-ability tables can each tune their devices.
  - Be cautious about busy condition indicators or dense grids; prefer simple, large chips or toggles with explicit labels for each condition and status tag.

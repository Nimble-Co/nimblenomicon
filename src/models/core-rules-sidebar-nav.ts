import { coreRulesOutlineEntries } from "./core-rules-outline";

export type CoreRulesSidebarLink = {
	slug: string;
	label: string;
};

export type CoreRulesChapterNav = {
	slug: string;
	label: string;
	children: CoreRulesSidebarLink[];
};

/**
 * Builds mockup-shaped nav: intro links under “Start Here”, then one collapsible block per `#` chapter.
 */
export function buildCoreRulesSidebarNav(): {
	startHereLinks: CoreRulesSidebarLink[];
	chapters: CoreRulesChapterNav[];
} {
	const entries = coreRulesOutlineEntries;
	const combatIdx = entries.findIndex(
		(e) => e.slug === "combat" && e.depth === 1,
	);
	if (combatIdx === -1) {
		return { startHereLinks: [], chapters: [] };
	}

	const startHereLinks = entries
		.slice(0, combatIdx)
		.filter((e) => e.depth === 2)
		.map((e) => ({ slug: e.slug, label: e.label }));

	const chapters: CoreRulesChapterNav[] = [];
	let i = combatIdx;
	while (i < entries.length) {
		const e = entries[i];
		if (e.depth !== 1) {
			i++;
			continue;
		}
		const slug = e.slug;
		const label = e.label;
		const children: CoreRulesSidebarLink[] = [];
		i++;
		while (i < entries.length && entries[i].depth === 2) {
			children.push({
				slug: entries[i].slug,
				label: entries[i].label,
			});
			i++;
		}
		chapters.push({ slug, label, children });
	}

	return { startHereLinks, chapters };
}

/** Whether the current URL hash falls under this chapter (chapter heading or any child). */
export function hashBelongsToChapter(
	hash: string,
	chapter: CoreRulesChapterNav,
): boolean {
	const h = hash.replace(/^#/, "");
	if (!h) return false;
	if (h === chapter.slug) return true;
	return chapter.children.some((c) => c.slug === h);
}

/** Intro / “Start Here” region: hero, start-here prose, and all ## before Combat. */
export function hashBelongsToStartHere(
	hash: string,
	startHereLinks: CoreRulesSidebarLink[],
): boolean {
	const h = hash.replace(/^#/, "");
	if (!h || h === "_top") return true;
	if (h === "start-here" || h === "core-rules") return true;
	return startHereLinks.some((l) => l.slug === h);
}

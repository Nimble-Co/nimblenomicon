import type { StarlightRouteData } from '@astrojs/starlight/route-data';
import { formatPath } from '../../node_modules/@astrojs/starlight/utils/format-path.ts';
import { getPrevNextLinks } from '../../node_modules/@astrojs/starlight/utils/navigation.ts';
import { ensureLeadingSlash } from '../../node_modules/@astrojs/starlight/utils/path.ts';
import { isAbsoluteUrl } from '../../node_modules/@astrojs/starlight/utils/url.ts';
import type {
	SidebarEntry,
	SidebarGroup,
	SidebarLink,
} from '../../node_modules/@astrojs/starlight/utils/routing/types.ts';
import config from 'virtual:starlight/user-config';
import {
	SECTION_SIDEBAR_CONFIG,
	getSectionKey,
	type SectionKey,
} from '../config/section-sidebars';

/** Match current page to a sidebar link (mirrors Starlight’s pathname comparison). */
function pathMatchesHref(href: string, pathname: string): boolean {
	if (isAbsoluteUrl(href)) return false;
	let h = ensureLeadingSlash(href);
	h = formatPath(h);
	const p = formatPath(pathname);
	return encodeURI(h) === encodeURI(p);
}

function hrefForManualLink(link: string, locale: string | undefined): string {
	let href = link;
	if (!isAbsoluteUrl(href)) {
		href = ensureLeadingSlash(href);
		if (locale) href = '/' + locale + href;
	}
	if (!isAbsoluteUrl(href)) href = formatPath(href);
	return href;
}

type RawSidebarItem =
	| { label: string; link: string }
	| { label: string; collapsed?: boolean; items: RawSidebarItem[] };

function rawToEntries(
	items: readonly RawSidebarItem[],
	locale: string | undefined,
): SidebarEntry[] {
	return items.map((item): SidebarEntry => {
		if ('link' in item) {
			const href = hrefForManualLink(item.link, locale);
			const link: SidebarLink = {
				type: 'link',
				label: item.label,
				href,
				isCurrent: false,
				badge: undefined,
				attrs: {},
			};
			return link;
		}
		const group: SidebarGroup = {
			type: 'group',
			label: item.label,
			collapsed: item.collapsed ?? false,
			entries: rawToEntries(item.items, locale),
			badge: undefined,
		};
		return group;
	});
}

function markCurrent(entries: SidebarEntry[], pathname: string): void {
	for (const entry of entries) {
		if (entry.type === 'link') {
			entry.isCurrent = pathMatchesHref(entry.href, pathname);
		} else {
			markCurrent(entry.entries, pathname);
		}
	}
}

function buildSectionSidebar(
	key: SectionKey,
	pathname: string,
	locale: string | undefined,
): SidebarEntry[] {
	const raw = SECTION_SIDEBAR_CONFIG[key] as unknown as RawSidebarItem[];
	const entries = rawToEntries(raw, locale);
	markCurrent(entries, pathname);
	return entries;
}

/** Sidebar + flags for the current docs page, scoped to its section. */
export function resolveSectionSidebar(
	route: StarlightRouteData,
	pathname: string,
): {
	sidebar: StarlightRouteData['sidebar'];
	bookChrome: boolean;
	sectionKey: SectionKey | null;
} {
	const key = getSectionKey(route.entry.id);
	if (!key) {
		return { sidebar: route.sidebar, bookChrome: false, sectionKey: null };
	}
	const sidebar = buildSectionSidebar(key, pathname, route.locale);
	return {
		sidebar,
		bookChrome: key === 'core-rules',
		sectionKey: key,
	};
}

/** Prev/next links only within the current section. */
export function resolveSectionPagination(
	route: StarlightRouteData,
	pathname: string,
) {
	const key = getSectionKey(route.entry.id);
	if (!key) {
		return route.pagination;
	}
	const sidebar = buildSectionSidebar(key, pathname, route.locale);
	return getPrevNextLinks(sidebar, config.pagination ?? true, route.entry.data);
}

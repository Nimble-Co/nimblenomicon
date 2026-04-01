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

/** Path + optional fragment: hash links on `/core-rules/#id` resolve as current when the URL matches. */
function linkMatchesCurrent(
	href: string,
	pathname: string,
	urlHash: string,
): boolean {
	if (isAbsoluteUrl(href)) return false;
	const raw = ensureLeadingSlash(href);
	const hashIdx = raw.indexOf('#');
	const pathPart = hashIdx >= 0 ? raw.slice(0, hashIdx) : raw;
	const fragment = hashIdx >= 0 ? raw.slice(hashIdx + 1) : '';
	const formattedHref = formatPath(pathPart);
	const formattedPath = formatPath(pathname);
	if (encodeURI(formattedHref) !== encodeURI(formattedPath)) return false;
	if (!fragment) return urlHash === '';
	return fragment === urlHash;
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
	| { label: string; collapsed?: boolean; items: readonly RawSidebarItem[] };

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

function markCurrent(
	entries: SidebarEntry[],
	pathname: string,
	urlHash: string,
): void {
	for (const entry of entries) {
		if (entry.type === 'link') {
			entry.isCurrent = linkMatchesCurrent(entry.href, pathname, urlHash);
		} else {
			markCurrent(entry.entries, pathname, urlHash);
		}
	}
}

function buildSectionSidebar(
	key: SectionKey,
	pathname: string,
	locale: string | undefined,
	urlHash: string,
): SidebarEntry[] {
	const raw = SECTION_SIDEBAR_CONFIG[key] as unknown as RawSidebarItem[];
	const entries = rawToEntries(raw, locale);
	markCurrent(entries, pathname, urlHash);
	return entries;
}

/** Sidebar + flags for the current docs page, scoped to its section. */
export function resolveSectionSidebar(
	route: StarlightRouteData,
	pathname: string,
	urlHash: string,
): {
	sidebar: StarlightRouteData['sidebar'];
	bookChrome: boolean;
	sectionKey: SectionKey | null;
} {
	const key = getSectionKey(route.entry.id);
	if (!key) {
		return { sidebar: route.sidebar, bookChrome: false, sectionKey: null };
	}
	const sidebar = buildSectionSidebar(key, pathname, route.locale, urlHash);
	return {
		sidebar,
		bookChrome: key === 'core-rules' || key === 'game-masters-guide',
		sectionKey: key,
	};
}

/** Prev/next links only within the current section. */
export function resolveSectionPagination(
	route: StarlightRouteData,
	pathname: string,
	urlHash: string,
) {
	const key = getSectionKey(route.entry.id);
	if (!key) {
		return route.pagination;
	}
	const sidebar = buildSectionSidebar(key, pathname, route.locale, urlHash);
	return getPrevNextLinks(sidebar, config.pagination ?? true, route.entry.data);
}

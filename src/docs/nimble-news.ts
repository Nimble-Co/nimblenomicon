const IMG_SRC_RE = /<img[^>]+src=["']([^"']+)["']/i;

/** `property` or `name` first, then `content` (Shopify / common CMS orderings) */
const META_PROP_CONTENT_RE =
	/<meta\s+[^>]*(?:property|name)=["']([^"']+)["'][^>]*content=["']([^"']+)["'][^>]*>/gi;
const META_CONTENT_PROP_RE =
	/<meta\s+[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']([^"']+)["'][^>]*>/gi;

export type NimbleNewsItem = {
	url: string;
	title: string;
	publishedIso: string;
	/** Hero: Open Graph / Twitter image from the article page, else first `<img>` in Atom content */
	imageUrl?: string;
};

function decodeHtmlAttr(src: string): string {
	return src
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
}

export function extractFirstImageSrc(
	html: string | undefined,
): string | undefined {
	if (!html) return undefined;
	const m = html.match(IMG_SRC_RE);
	if (!m?.[1]) return undefined;
	return decodeHtmlAttr(m[1].trim());
}

function resolveAgainstBase(baseUrl: string, src: string): string {
	try {
		return new URL(src.trim(), baseUrl).href;
	} catch {
		return src;
	}
}

/** Prefer HTTPS `og:image:secure_url` (Shopify) when present. */
const META_IMAGE_PRIORITY = [
	'og:image:secure_url',
	'og:image',
	'twitter:image',
	'twitter:image:src',
] as const;

function collectOpenGraphImageMeta(html: string): Map<string, string> {
	const out = new Map<string, string>();
	const add = (keyRaw: string, valRaw: string | undefined) => {
		const key = keyRaw.toLowerCase();
		const val = valRaw?.trim();
		if (!val || out.has(key)) return;
		const decoded = decodeHtmlAttr(val);
		if (decoded) out.set(key, decoded);
	};

	META_PROP_CONTENT_RE.lastIndex = 0;
	let m: RegExpExecArray | null;
	while ((m = META_PROP_CONTENT_RE.exec(html)) !== null) {
		add(m[1], m[2]);
	}

	META_CONTENT_PROP_RE.lastIndex = 0;
	while ((m = META_CONTENT_PROP_RE.exec(html)) !== null) {
		add(m[2], m[1]);
	}

	return out;
}

/**
 * Reads Open Graph / Twitter hero images from a full HTML document (Shopify blog `og:image`, etc.).
 */
export function extractHeroImageFromArticleHtml(
	html: string,
	baseUrl: string,
): string | undefined {
	const meta = collectOpenGraphImageMeta(html);
	for (const key of META_IMAGE_PRIORITY) {
		const val = meta.get(key);
		if (val) return resolveAgainstBase(baseUrl, val);
	}
	return undefined;
}

export function formatNewsDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '';
	return new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'America/New_York',
	})
		.format(d)
		.toUpperCase();
}

/** Pathname from a `dist` HTML file path (POSIX, relative to `dist/`). */
export function htmlRelativeToPathname(relativePosix: string): string {
	let p = relativePosix.replace(/\\/g, '/');
	if (p.endsWith('/index.html')) {
		p = p.slice(0, -'/index.html'.length);
	} else if (p.endsWith('index.html') && !p.includes('/')) {
		p = '';
	} else if (p.endsWith('.html')) {
		p = p.slice(0, -'.html'.length);
	}
	if (p === '' || p === '/') return '/';
	const withSlash = p.startsWith('/') ? p : `/${p}`;
	return withSlash.endsWith('/') ? withSlash : `${withSlash}/`;
}

/**
 * Pathname including Astro `base` prefix (matches `href` on emitted entity links).
 * `basePrefix` is `import.meta.env.BASE_URL` without trailing slash, or `''`.
 */
export function distFileToSelfPathname(
	relativePosix: string,
	basePrefix: string,
): string {
	const rel = htmlRelativeToPathname(relativePosix);
	if (rel === '/') {
		return basePrefix === '' ? '/' : `${basePrefix}/`;
	}
	return `${basePrefix}${rel}`;
}

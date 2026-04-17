/**
 * Global Ctrl/Cmd+K → focus callback. Used by header `site-search` and home hero search.
 * Returns a cleanup function (e.g. for custom elements that unregister on disconnect).
 */
export function wireSearchShortcut(focus: () => void): () => void {
	const onKeydown = (e: KeyboardEvent): void => {
		if ((e.metaKey === true || e.ctrlKey === true) && e.key === 'k') {
			e.preventDefault();
			focus();
		}
	};
	window.addEventListener('keydown', onKeydown);
	return () => window.removeEventListener('keydown', onKeydown);
}

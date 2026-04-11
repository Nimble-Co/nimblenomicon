/**
 * Bind the common “search palette” shortcut (⌘/Ctrl+K) used by header and home search.
 * Returns a cleanup function for custom elements or tests.
 */
export function bindSearchPaletteShortcut(
	onActivate: (event: KeyboardEvent) => void,
): () => void {
	const listener = (e: KeyboardEvent): void => {
		if ((e.metaKey === true || e.ctrlKey === true) && e.key === 'k') {
			e.preventDefault();
			onActivate(e);
		}
	};
	window.addEventListener('keydown', listener);
	return () => window.removeEventListener('keydown', listener);
}

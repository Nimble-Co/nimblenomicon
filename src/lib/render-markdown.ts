import { marked } from 'marked';

/** Parse Core Rules–style markdown fragments to HTML (used in MDX with set:html). */
export function renderMarkdown(md: string): string {
	return marked.parse(md, { async: false }) as string;
}

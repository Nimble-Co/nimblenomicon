import { createMarkdownProcessor } from '@astrojs/markdown-remark';

import { expandReferenceTagsToHtmlInMarkdown } from './reference-expand';

let processorPromise: ReturnType<typeof createMarkdownProcessor> | undefined;
async function getProcessor() {
	processorPromise ??= createMarkdownProcessor();
	return processorPromise;
}
/** Parse Core Rules–style markdown fragments to HTML (used in Astro with set:html). */
export async function renderMarkdown(md: string): Promise<string> {
	const pre = expandReferenceTagsToHtmlInMarkdown(md);
	const processor = await getProcessor();
	const { code } = await processor.render(pre);
	return code;
}

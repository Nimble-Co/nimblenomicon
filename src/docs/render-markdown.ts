import { createMarkdownProcessor } from '@astrojs/markdown-remark';

let processorPromise: ReturnType<typeof createMarkdownProcessor> | undefined;
async function getProcessor() {
	processorPromise ??= createMarkdownProcessor();
	return processorPromise;
}
/** Parse Core Rules–style markdown fragments to HTML (used in Astro with set:html). */
export async function renderMarkdown(md: string): Promise<string> {
	const processor = await getProcessor();
	const { code } = await processor.render(md);
	return code;
}

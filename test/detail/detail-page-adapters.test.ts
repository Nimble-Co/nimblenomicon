import { describe, expect, it } from 'vitest';
import {
	backgroundDetailPageProps,
	coreRulesMarkdownDetailProps,
} from '../../src/detail/detail-page-adapters';

describe('coreRulesMarkdownDetailProps', () => {
	it('builds Core Rules shell with description body by default', () => {
		const props = coreRulesMarkdownDetailProps(
			{ id: 'acolyte', name: 'Acolyte', description: '  Faithful servant.  ' },
			{
				descriptionPrefix: 'Character background',
				backLabel: 'All Backgrounds',
				searchType: 'background',
			},
		);
		expect(props).toEqual({
			title: 'Acolyte',
			description: 'Character background — Acolyte.',
			backLabel: 'All Backgrounds',
			searchType: 'background',
			sourceHref: '/core-rules/#acolyte',
			sourceName: 'Core Rules',
			bodyMarkdown: 'Faithful servant.',
		});
	});

	it('matches backgroundDetailPageProps output', () => {
		const row = {
			id: 'acolyte',
			name: 'Acolyte',
			description: 'Faithful servant.',
		};
		expect(backgroundDetailPageProps(row)).toEqual(
			coreRulesMarkdownDetailProps(row, {
				descriptionPrefix: 'Character background',
				backLabel: 'All Backgrounds',
				searchType: 'background',
			}),
		);
	});
});

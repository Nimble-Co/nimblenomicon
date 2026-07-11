import { describe, expect, it } from 'vitest';

import {
	backgroundDetailPageProps,
	conditionDetailPageProps,
	coreRulesMarkdownDetailProps,
	glossaryDetailPageProps,
	languageDetailPageProps,
} from '../../src/detail/detail-page-adapters';

describe('detail-page-adapters', () => {
	it('builds shared Core Rules markdown detail props', () => {
		const row = { id: 'blinded', name: 'Blinded', description: 'Cannot see.' };
		expect(
			coreRulesMarkdownDetailProps(row, {
				descriptionPrefix: 'Condition',
				backLabel: 'All Conditions',
				searchType: 'condition',
			}),
		).toEqual({
			title: 'Blinded',
			description: 'Condition — Blinded.',
			backLabel: 'All Conditions',
			searchType: 'condition',
			sourceHref: '/core-rules/#blinded',
			sourceName: 'Core Rules',
			bodyMarkdown: 'Cannot see.',
		});
	});

	it('wires entity adapters through the shared factory', () => {
		const row = {
			id: 'common',
			name: 'Common',
			description: 'Everyone speaks it.',
		};
		expect(languageDetailPageProps(row)).toMatchObject({
			searchType: 'language',
			bodyMarkdown: 'Everyone speaks it.',
		});
		expect(backgroundDetailPageProps(row).searchType).toBe('background');
		expect(conditionDetailPageProps(row).searchType).toBe('condition');
		expect(glossaryDetailPageProps(row).searchType).toBe('glossary');
	});
});

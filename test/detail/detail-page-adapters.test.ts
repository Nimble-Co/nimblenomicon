import { describe, expect, it } from 'vitest';
import {
	backgroundDetailPageProps,
	conditionDetailPageProps,
	glossaryDetailPageProps,
	languageDetailPageProps,
} from '../../src/detail/detail-page-adapters';

describe('detail-page-adapters (simple markdown)', () => {
	it('backgroundDetailPageProps maps core-rules shell fields', () => {
		expect(
			backgroundDetailPageProps({
				id: 'acolyte',
				name: 'Acolyte',
				description: 'Faithful servant.',
			}),
		).toEqual({
			title: 'Acolyte',
			description: 'Character background — Acolyte.',
			backLabel: 'All Backgrounds',
			searchType: 'background',
			sourceHref: '/core-rules/#acolyte',
			sourceName: 'Core Rules',
			bodyMarkdown: 'Faithful servant.',
		});
	});

	it('conditionDetailPageProps trims empty descriptions', () => {
		expect(
			conditionDetailPageProps({
				id: 'blinded',
				name: 'Blinded',
				description: '  ',
			}).bodyMarkdown,
		).toBe('');
	});

	it('glossaryDetailPageProps uses glossary labels', () => {
		const props = glossaryDetailPageProps({
			id: 'advantage',
			name: 'Advantage',
			description: 'Roll twice.',
		});
		expect(props.backLabel).toBe('All Glossary');
		expect(props.searchType).toBe('glossary');
	});

	it('languageDetailPageProps uses language labels', () => {
		const props = languageDetailPageProps({
			id: 'common',
			name: 'Common',
			description: 'Widely spoken.',
		});
		expect(props.description).toBe('Language — Common.');
	});
});

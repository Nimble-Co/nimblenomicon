import type { APIRoute, GetStaticPaths } from 'astro';
import {
	getCollectionData,
	getCollectionSlugs,
} from '../../utils/static-api-collections';

export const prerender = true;

const jsonHeaders = {
	'Content-Type': 'application/json; charset=utf-8',
} as const;

export const getStaticPaths = (() => {
	return getCollectionSlugs().map((collection) => ({ params: { collection } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => {
	const slug = params.collection;
	if (!slug) {
		return new Response(JSON.stringify({ error: 'Not found' }), {
			status: 404,
			headers: jsonHeaders,
		});
	}
	const data = getCollectionData(slug);
	if (data === undefined) {
		return new Response(JSON.stringify({ error: 'Not found' }), {
			status: 404,
			headers: jsonHeaders,
		});
	}
	return new Response(JSON.stringify(data), { headers: jsonHeaders });
};

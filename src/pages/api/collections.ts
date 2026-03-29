import type { APIRoute } from 'astro';
import { getCollectionSlugs } from '../../lib/static-api-collections';

export const prerender = true;

const jsonHeaders = {
	'Content-Type': 'application/json; charset=utf-8',
} as const;

export const GET: APIRoute = () => {
	return new Response(JSON.stringify({ collections: getCollectionSlugs() }), {
		headers: jsonHeaders,
	});
};

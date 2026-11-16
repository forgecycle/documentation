import { getCollection } from 'astro:content';

export const BASE = '/documentation';

/** The four sections, in reading order. `dir` is the content directory; `label` matches the sidebar group. */
export const SECTIONS = [
	{ dir: 'start', label: 'Start here', short: 'Start' },
	{ dir: 'concepts', label: 'Concepts', short: 'Concepts' },
	{ dir: 'guides', label: 'Guides', short: 'Guides' },
	{ dir: 'reference', label: 'Reference', short: 'Reference' },
] as const;

export type SectionDir = (typeof SECTIONS)[number]['dir'];

export function sectionOf(id: string) {
	const dir = id.split('/')[0];
	return SECTIONS.find((s) => s.dir === dir);
}

export interface IndexPage {
	id: string;
	href: string;
	title: string;
	description?: string;
	order: number;
}

/** Every published page grouped by section, in sidebar order. */
export async function sectionIndex() {
	const docs = await getCollection('docs');
	return SECTIONS.map((section) => {
		const pages: IndexPage[] = docs
			.filter((d) => d.id.startsWith(`${section.dir}/`))
			.map((d) => ({
				id: d.id,
				href: `${BASE}/${d.id}/`,
				title: d.data.sidebar?.label ?? d.data.title,
				description: d.data.description,
				order: d.data.sidebar?.order ?? Number.MAX_SAFE_INTEGER,
			}))
			.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
		return { ...section, pages, href: pages[0]?.href ?? `${BASE}/` };
	});
}

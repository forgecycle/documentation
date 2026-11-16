// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

export default defineConfig({
	site: 'https://forgecycle.github.io',
	base: '/documentation',
	trailingSlash: 'always',
	integrations: [
		starlight({
			title: 'ForgeCycle',
			description:
				'An artifact-driven development loop: Decomposer, Planner, Builder, and Reviewer agents with immutable handoffs and Git.',
			logo: { src: './public/favicon.svg', alt: '' },
			favicon: '/favicon.svg',
			social: [
				{
					icon: 'github',
					label: 'Releases',
					href: 'https://github.com/forgecycle/forgecycle-releases/releases',
				},
			],
			plugins: [starlightLinksValidator({ errorOnLocalLinks: true })],
			sidebar: [
				{ label: 'Start here', items: [{ autogenerate: { directory: 'start' } }] },
				{ label: 'Concepts', items: [{ autogenerate: { directory: 'concepts' } }] },
				{ label: 'Guides', items: [{ autogenerate: { directory: 'guides' } }] },
				{ label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] },
			],
		}),
	],
});

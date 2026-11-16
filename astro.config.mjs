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
			customCss: [
				'@fontsource-variable/public-sans',
				'@fontsource-variable/public-sans/wght-italic.css',
				'@fontsource/barlow-condensed/500.css',
				'@fontsource/barlow-condensed/600.css',
				'@fontsource/barlow-condensed/700.css',
				'@fontsource-variable/jetbrains-mono',
				'./src/styles/theme.css',
			],
			components: {
				Header: './src/components/Header.astro',
				Hero: './src/components/Hero.astro',
				PageTitle: './src/components/PageTitle.astro',
				Sidebar: './src/components/Sidebar.astro',
			},
			expressiveCode: {
				defaultProps: { frame: 'none' },
				themes: ['github-dark-default', 'github-light'],
				styleOverrides: {
					borderRadius: '0',
					borderColor: 'var(--fc-rule-strong)',
					codeFontFamily: 'var(--__sl-font-mono)',
					codeFontSize: '0.875rem',
					codeLineHeight: '1.6',
					uiFontFamily: 'var(--fc-font-label)',
					frames: {
						frameBoxShadowCssValue: 'none',
						editorTabBarBackground: 'var(--fc-sheet)',
						editorActiveTabBackground: 'var(--fc-sheet)',
						editorActiveTabIndicatorTopColor: 'var(--fc-serial)',
						editorActiveTabIndicatorBottomColor: 'transparent',
						terminalTitlebarBackground: 'var(--fc-sheet)',
						terminalTitlebarBorderBottomColor: 'var(--fc-rule)',
						terminalTitlebarDotsOpacity: '0',
					},
					textMarkers: {
						markBackground: 'var(--fc-mark)',
						markBorderColor: 'var(--fc-serial)',
					},
				},
			},
			sidebar: [
				{ label: 'Start here', items: [{ autogenerate: { directory: 'start' } }] },
				{ label: 'Concepts', items: [{ autogenerate: { directory: 'concepts' } }] },
				{ label: 'Guides', items: [{ autogenerate: { directory: 'guides' } }] },
				{ label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] },
			],
		}),
	],
});

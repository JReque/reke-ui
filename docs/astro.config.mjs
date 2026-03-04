// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://jreque.github.io',
	base: '/reke-ui',
	integrations: [
		starlight({
			title: 'reke-ui',
			description: 'Web Component library built with Lit 3 — dark & light themes',
			customCss: ['./src/styles/landing.css'],
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/JReque/reke-ui' },
			],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'getting-started/introduction' },
						{ label: 'Installation', slug: 'getting-started/installation' },
						{ label: 'Theming', slug: 'getting-started/theming' },
					],
				},
				{
					label: 'Frameworks',
					items: [
						{ label: 'Vue', slug: 'frameworks/vue' },
						{ label: 'React', slug: 'frameworks/react' },
						{ label: 'Vanilla JS', slug: 'frameworks/vanilla' },
					],
				},
				{
					label: 'Components',
					autogenerate: { directory: 'components' },
				},
				{
					label: 'Design Tokens',
					items: [
						{ label: 'Token Reference', slug: 'tokens/reference' },
					],
				},
				{
					label: 'Storybook',
					items: [
						{ label: 'Component Playground', link: '/reke-ui/storybook/' },
					],
				},
			],
		}),
	],
});

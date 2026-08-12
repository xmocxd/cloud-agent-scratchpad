// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { autoWikiRehype } from './src/lib/autoWiki.mjs';

// https://astro.build/config
export default defineConfig({
	markdown: {
		processor: unified({
			rehypePlugins: [autoWikiRehype],
		}),
	},
});

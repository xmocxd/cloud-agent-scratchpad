import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const chapters = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/chapters' }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		order: z.number(),
		starred: z.boolean().default(false),
	}),
});

export const collections = { chapters };

import { getCollection, type CollectionEntry } from 'astro:content';

export type Chapter = CollectionEntry<'chapters'>;

export function chapterHref(chapter: Chapter): string {
	return `/chapters/${chapter.id}/`;
}

export async function getChapters(): Promise<Chapter[]> {
	const chapters = await getCollection('chapters');
	return chapters.sort((a, b) => a.data.order - b.data.order);
}

export async function getStarredChapters(): Promise<Chapter[]> {
	const chapters = await getChapters();
	return chapters.filter((chapter) => chapter.data.starred);
}

export function buildSearchIndex(chapters: Chapter[]) {
	return chapters.map((chapter) => ({
		id: chapter.id,
		title: chapter.data.title,
		description: chapter.data.description ?? '',
		href: chapterHref(chapter),
		order: chapter.data.order,
		body: chapter.body ?? '',
	}));
}

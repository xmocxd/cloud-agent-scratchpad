import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const chaptersDir = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'../content/chapters',
);

const SKIP_TAGS = new Set(['a', 'code', 'pre', 'kbd', 'samp', 'script', 'style']);

/**
 * Load wiki link targets from chapter markdown front matter.
 * Titles map to /chapters/<id>/ based on the filename stem.
 */
export function loadWikiTerms() {
	if (!fs.existsSync(chaptersDir)) return [];

	/** @type {{ id: string, title: string, href: string }[]} */
	const terms = [];
	for (const file of fs.readdirSync(chaptersDir)) {
		if (!file.endsWith('.md')) continue;
		const id = file.replace(/\.md$/, '');
		const raw = fs.readFileSync(path.join(chaptersDir, file), 'utf8');
		const { data } = matter(raw);
		if (typeof data.title !== 'string' || !data.title.trim()) continue;
		terms.push({
			id,
			title: data.title.trim(),
			href: `/chapters/${id}/`,
		});
	}

	// Longer titles first so "Dark Matter" wins over "Matter".
	return terms.sort((a, b) => b.title.length - a.title.length);
}

function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isHeading(tag) {
	return typeof tag === 'string' && /^h[1-6]$/.test(tag);
}

/**
 * Rehype plugin: link the first plain-text mention of each wiki title
 * to its chapter page. Skips the current page's own title and text
 * inside links, code, or headings.
 */
export function autoWikiRehype() {
	const terms = loadWikiTerms();

	return (tree, file) => {
		const currentId = path.basename(String(file.path || file.history?.[0] || ''), '.md');
		const linked = new Set();

		walk(tree, false, (node, index, parent) => {
			if (typeof node.value !== 'string' || !node.value) return;

			let remaining = node.value;
			/** @type {object[]} */
			const replacements = [];

			while (remaining.length > 0) {
				/** @type {{ at: number, text: string, term: { id: string, title: string, href: string } } | null} */
				let earliest = null;

				for (const term of terms) {
					if (linked.has(term.id) || term.id === currentId) continue;

					const pattern = new RegExp(
						`(^|[^\\p{L}\\p{N}_])(${escapeRegExp(term.title)})(?=[^\\p{L}\\p{N}_]|$)`,
						'iu',
					);
					const match = pattern.exec(remaining);
					if (!match) continue;

					const at = match.index + match[1].length;
					if (!earliest || at < earliest.at) {
						earliest = { at, text: match[2], term };
					}
				}

				if (!earliest) {
					replacements.push({ type: 'text', value: remaining });
					break;
				}

				if (earliest.at > 0) {
					replacements.push({ type: 'text', value: remaining.slice(0, earliest.at) });
				}

				replacements.push({
					type: 'element',
					tagName: 'a',
					properties: {
						href: earliest.term.href,
						className: ['wiki-link'],
						'data-wiki': earliest.term.id,
					},
					children: [{ type: 'text', value: earliest.text }],
				});

				linked.add(earliest.term.id);
				remaining = remaining.slice(earliest.at + earliest.text.length);
			}

			if (replacements.length === 1 && replacements[0].type === 'text') {
				node.value = replacements[0].value;
				return;
			}

			parent.children.splice(index, 1, ...replacements);
			return index + replacements.length;
		});
	};
}

/**
 * @param {any} node
 * @param {boolean} skip
 * @param {(node: any, index: number, parent: any) => number | void} onText
 */
function walk(node, skip, onText) {
	if (!node?.children) return;

	const tag = node.type === 'element' ? node.tagName : '';
	const nextSkip = skip || SKIP_TAGS.has(tag) || isHeading(tag);

	for (let i = 0; i < node.children.length; i++) {
		const child = node.children[i];
		if (child.type === 'text') {
			if (nextSkip) continue;
			const jumped = onText(child, i, node);
			if (typeof jumped === 'number') {
				i = jumped - 1;
			}
		} else {
			walk(child, nextSkip, onText);
		}
	}
}

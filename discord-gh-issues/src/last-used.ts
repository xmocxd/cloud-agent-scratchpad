import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const storePath = path.join(dataDir, 'last-used.json');

type Store = Record<string, number>;

async function readStore(): Promise<Store> {
	try {
		const raw = await readFile(storePath, 'utf8');
		return JSON.parse(raw) as Store;
	} catch {
		return {};
	}
}

async function writeStore(store: Store): Promise<void> {
	await mkdir(dataDir, { recursive: true });
	await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

export async function getLastUsedMap(): Promise<Store> {
	return readStore();
}

export async function markUsed(fullName: string): Promise<void> {
	const store = await readStore();
	store[fullName] = Date.now();
	await writeStore(store);
}

/** Sort repos: last used first, then alphabetical. */
export function sortByLastUsed<T extends { full_name: string }>(
	repos: T[],
	lastUsed: Store,
): T[] {
	return [...repos].sort((a, b) => {
		const aUsed = lastUsed[a.full_name] ?? 0;
		const bUsed = lastUsed[b.full_name] ?? 0;
		if (aUsed !== bUsed) return bUsed - aUsed;
		return a.full_name.localeCompare(b.full_name);
	});
}

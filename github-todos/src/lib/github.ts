import { env } from 'cloudflare:workers';

export type Issue = {
	id: number;
	number: number;
	title: string;
	html_url: string;
	updated_at: string;
	repository_url: string;
	labels: { name: string; color: string }[];
};

type SearchResponse = {
	items: Issue[];
};

function token(): string {
	const value = (env as { GITHUB_TOKEN?: string }).GITHUB_TOKEN;
	if (!value) throw new Error('Missing GITHUB_TOKEN');
	return value;
}

async function gh<T>(path: string): Promise<T> {
	const res = await fetch(`https://api.github.com${path}`, {
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token()}`,
			'User-Agent': 'github-todos',
			'X-GitHub-Api-Version': '2022-11-28',
		},
	});
	if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`);
	return res.json() as Promise<T>;
}

export function repoName(repositoryUrl: string): string {
	return repositoryUrl.replace('https://api.github.com/repos/', '');
}

/** Open issues across repos owned by the authenticated user (public + private). */
export async function listOpenIssues(): Promise<Issue[]> {
	const user = await gh<{ login: string }>('/user');
	const q = encodeURIComponent(`is:issue is:open user:${user.login}`);
	const data = await gh<SearchResponse>(
		`/search/issues?q=${q}&per_page=100&sort=updated`,
	);
	return data.items;
}

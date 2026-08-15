import 'dotenv/config';

function requireEnv(key: string): string {
	const value = process.env[key];
	if (!value) throw new Error(`Missing ${key}`);
	return value;
}

export function githubToken(): string {
	return requireEnv('GITHUB_TOKEN');
}

export function githubOwner(): string {
	return requireEnv('GITHUB_OWNER');
}

export type GhRepo = {
	id: number;
	name: string;
	full_name: string;
	private: boolean;
};

export type GhIssue = {
	number: number;
	html_url: string;
	title: string;
};

async function gh<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`https://api.github.com${path}`, {
		...init,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${githubToken()}`,
			'User-Agent': 'discord-gh-issues',
			'X-GitHub-Api-Version': '2022-11-28',
			...(init?.headers ?? {}),
		},
	});
	if (!res.ok) {
		throw new Error(`GitHub ${res.status}: ${await res.text()}`);
	}
	if (res.status === 204) return undefined as T;
	return res.json() as Promise<T>;
}

async function detectOwnerType(owner: string): Promise<'User' | 'Organization'> {
	const data = await gh<{ type: string }>(`/users/${encodeURIComponent(owner)}`);
	return data.type === 'Organization' ? 'Organization' : 'User';
}

/** Public + private repos for GITHUB_OWNER that the token can see. */
export async function listOwnerRepos(): Promise<GhRepo[]> {
	const owner = githubOwner();
	const authed = await gh<{ login: string }>('/user');
	const ownerType = await detectOwnerType(owner);

	let base: string;
	if (ownerType === 'Organization') {
		base = `/orgs/${encodeURIComponent(owner)}/repos?type=all&per_page=100&sort=full_name`;
	} else if (authed.login.toLowerCase() === owner.toLowerCase()) {
		// /users/{user}/repos hides private repos; use /user/repos for the token owner
		base = `/user/repos?affiliation=owner&per_page=100&sort=full_name`;
	} else {
		base = `/users/${encodeURIComponent(owner)}/repos?type=all&per_page=100&sort=full_name`;
	}

	const repos: GhRepo[] = [];
	for (let page = 1; page <= 10; page++) {
		const batch = await gh<GhRepo[]>(`${base}&page=${page}`);
		const mapped = batch
			.filter((r) => r.full_name.toLowerCase().startsWith(`${owner.toLowerCase()}/`))
			.map((r) => ({
				id: r.id,
				name: r.name,
				full_name: r.full_name,
				private: r.private,
			}));
		repos.push(...mapped);
		if (batch.length < 100) break;
	}
	return repos;
}

export async function createIssue(
	fullName: string,
	title: string,
	body: string,
): Promise<GhIssue> {
	const [owner, repo] = fullName.split('/');
	if (!owner || !repo) throw new Error(`Invalid repo: ${fullName}`);

	return gh<GhIssue>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ title, body }),
	});
}

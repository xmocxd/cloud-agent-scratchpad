/**
 * Short-lived pending create-issue payloads keyed for select-menu customIds.
 * Survives between context-menu invoke and repo selection.
 */
export type PendingIssue = {
	body: string;
	title: string;
	userId: string;
	createdAt: number;
};

const TTL_MS = 15 * 60 * 1000;
const pending = new Map<string, PendingIssue>();

function prune(): void {
	const now = Date.now();
	for (const [id, value] of pending) {
		if (now - value.createdAt > TTL_MS) pending.delete(id);
	}
}

export function putPending(id: string, value: Omit<PendingIssue, 'createdAt'> | PendingIssue): void {
	prune();
	pending.set(id, {
		body: value.body,
		title: value.title,
		userId: value.userId,
		createdAt: 'createdAt' in value && value.createdAt ? value.createdAt : Date.now(),
	});
}

export function takePending(id: string): PendingIssue | undefined {
	prune();
	const value = pending.get(id);
	if (value) pending.delete(id);
	return value;
}

export function peekPending(id: string): PendingIssue | undefined {
	prune();
	return pending.get(id);
}

const TITLE_MAX = 256;
const TITLE_SOFT = 100;

/** First line of body → issue title, truncated for GitHub. */
export function titleFromBody(body: string): string {
	const firstLine = body.split(/\r?\n/, 1)[0]?.trim() || 'Untitled';
	if (firstLine.length <= TITLE_SOFT) {
		return firstLine.slice(0, TITLE_MAX);
	}
	const soft = firstLine.slice(0, TITLE_SOFT - 1).trimEnd();
	return `${soft}…`.slice(0, TITLE_MAX);
}

/** Build issue body from Discord message content / attachments. No Discord links. */
export function bodyFromMessage(content: string, attachmentUrls: string[]): string {
	const text = content.trim();
	if (text) return text;

	if (attachmentUrls.length > 0) {
		return ['(no message text)', '', ...attachmentUrls].join('\n');
	}

	return '(no message text)';
}

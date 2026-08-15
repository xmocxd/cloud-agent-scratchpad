import {
	ActionRowBuilder,
	ApplicationCommandType,
	ContextMenuCommandBuilder,
	MessageContextMenuCommandInteraction,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
} from 'discord.js';
import { createIssue, listOwnerRepos } from '../github.js';
import { getLastUsedMap, markUsed, sortByLastUsed } from '../last-used.js';
import { putPending, takePending } from '../pending.js';
import { bodyFromMessage, titleFromBody } from '../title.js';

export const CREATE_ISSUE_COMMAND_NAME = 'Create Issue';
export const REPO_SELECT_PREFIX = 'create-issue:repo:';

export const createIssueCommand = new ContextMenuCommandBuilder()
	.setName(CREATE_ISSUE_COMMAND_NAME)
	.setType(ApplicationCommandType.Message);

const MAX_OPTIONS = 25;

export async function handleCreateIssueContext(
	interaction: MessageContextMenuCommandInteraction,
): Promise<void> {
	await interaction.deferReply({ ephemeral: true });

	const message = interaction.targetMessage;
	const attachmentUrls = [...message.attachments.values()].map((a) => a.url);
	const body = bodyFromMessage(message.content ?? '', attachmentUrls);
	const title = titleFromBody(body);

	let repos;
	try {
		repos = await listOwnerRepos();
	} catch (err) {
		const detail = err instanceof Error ? err.message : String(err);
		await interaction.editReply(`Failed to list GitHub repos: ${detail}`);
		return;
	}

	if (repos.length === 0) {
		await interaction.editReply('No repositories found for `GITHUB_OWNER`.');
		return;
	}

	const lastUsed = await getLastUsedMap();
	const sorted = sortByLastUsed(repos, lastUsed);
	const truncated = sorted.length > MAX_OPTIONS;
	const options = sorted.slice(0, MAX_OPTIONS).map((repo) => ({
		label: repo.name.slice(0, 100),
		description: (repo.private ? 'private' : 'public').slice(0, 100),
		value: repo.full_name.slice(0, 100),
	}));

	const pendingId = `${interaction.id}`;
	putPending(pendingId, {
		body,
		title,
		userId: interaction.user.id,
	});

	const select = new StringSelectMenuBuilder()
		.setCustomId(`${REPO_SELECT_PREFIX}${pendingId}`)
		.setPlaceholder('Choose a repository')
		.addOptions(options);

	const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

	const note = truncated
		? `\n_Showing top ${MAX_OPTIONS} repos by last use; ${sorted.length - MAX_OPTIONS} omitted._`
		: '';

	await interaction.editReply({
		content: `Create issue **${title}** — choose a repo:${note}`,
		components: [row],
	});
}

export async function handleRepoSelect(interaction: StringSelectMenuInteraction): Promise<void> {
	const pendingId = interaction.customId.slice(REPO_SELECT_PREFIX.length);
	const pending = takePending(pendingId);

	if (!pending) {
		await interaction.update({
			content: 'This create-issue prompt expired. Right-click the message and try again.',
			components: [],
		});
		return;
	}

	if (pending.userId !== interaction.user.id) {
		// Put it back so the original user can still complete it
		putPending(pendingId, pending);
		await interaction.reply({
			content: 'Only the user who started Create Issue can pick the repo.',
			ephemeral: true,
		});
		return;
	}

	const fullName = interaction.values[0];
	if (!fullName) {
		await interaction.update({
			content: 'No repository selected.',
			components: [],
		});
		return;
	}

	await interaction.update({
		content: `Creating issue in \`${fullName}\`…`,
		components: [],
	});

	try {
		const issue = await createIssue(fullName, pending.title, pending.body);
		await markUsed(fullName);
		await interaction.editReply({
			content: `Created [${fullName}#${issue.number}](${issue.html_url}): ${issue.title}`,
		});
	} catch (err) {
		const detail = err instanceof Error ? err.message : String(err);
		await interaction.editReply({
			content: `Failed to create issue in \`${fullName}\`: ${detail}`,
		});
	}
}

import 'dotenv/config';
import {
	Client,
	Events,
	GatewayIntentBits,
	MessageContextMenuCommandInteraction,
	Partials,
} from 'discord.js';
import {
	CREATE_ISSUE_COMMAND_NAME,
	REPO_SELECT_PREFIX,
	handleCreateIssueContext,
	handleRepoSelect,
} from './commands/create-issue.js';

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('Missing DISCORD_TOKEN');

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
	partials: [Partials.Channel],
});

client.once(Events.ClientReady, (c) => {
	console.log(`Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
	try {
		if (interaction.isMessageContextMenuCommand()) {
			if (interaction.commandName === CREATE_ISSUE_COMMAND_NAME) {
				await handleCreateIssueContext(interaction as MessageContextMenuCommandInteraction);
			}
			return;
		}

		if (interaction.isStringSelectMenu()) {
			if (interaction.customId.startsWith(REPO_SELECT_PREFIX)) {
				await handleRepoSelect(interaction);
			}
		}
	} catch (err) {
		console.error('Interaction error:', err);
		const detail = err instanceof Error ? err.message : String(err);
		if (interaction.isRepliable()) {
			const payload = { content: `Something went wrong: ${detail}`, ephemeral: true };
			if (interaction.deferred || interaction.replied) {
				await interaction.followUp(payload).catch(() => undefined);
			} else {
				await interaction.reply(payload).catch(() => undefined);
			}
		}
	}
});

await client.login(token);

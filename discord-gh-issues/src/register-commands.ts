import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { createIssueCommand } from './commands/create-issue.js';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token) throw new Error('Missing DISCORD_TOKEN');
if (!clientId) throw new Error('Missing DISCORD_CLIENT_ID');

const rest = new REST({ version: '10' }).setToken(token);
const body = [createIssueCommand.toJSON()];

if (guildId) {
	await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
	console.log(`Registered guild commands for ${guildId}`);
} else {
	await rest.put(Routes.applicationCommands(clientId), { body });
	console.log('Registered global application commands');
}

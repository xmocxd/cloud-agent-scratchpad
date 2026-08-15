# discord-gh-issues

Long-running Discord bot that creates GitHub issues from a message context menu.

Right-click a message → **Apps** → **Create Issue** → pick a repo. The message text becomes the issue body; the first line (truncated) becomes the title. Repos are listed for a single `GITHUB_OWNER` (public and private), ordered by last use in this app.

## Setup

1. Create a Discord application and bot at https://discord.com/developers/applications
2. Enable the **Message Content Intent** under Bot → Privileged Gateway Intents
3. Invite the bot to your server with `applications.commands` scope
4. Create a GitHub PAT with access to the owner’s public and private repos and Issues write
   - Classic: `repo`
   - Fine-grained: repository list + Issues read/write on the target owner’s repos
5. Copy `.env.example` to `.env` and fill in values

```bash
npm install
npm run register-commands
npm start
```

Use `DISCORD_GUILD_ID` while iterating so command updates appear immediately. Omit it to register globally (can take up to ~1 hour to propagate).

## Env

| Variable | Purpose |
| --- | --- |
| `DISCORD_TOKEN` | Bot token |
| `DISCORD_CLIENT_ID` | Application ID |
| `DISCORD_GUILD_ID` | Optional guild for fast command registration |
| `GITHUB_TOKEN` | PAT for listing repos and creating issues |
| `GITHUB_OWNER` | User or org whose repos appear in the picker |

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

## Deploy

This is a **long-running Node process** (Discord gateway). It is not a Cloudflare Worker / serverless app. You need a host that keeps the process online 24/7 and preferably a writable volume for `data/last-used.json` (repo sort order). Without a volume, last-used order resets on restart but the bot still works.

**Requirements:** Node `>=22.12`, the env vars above, outbound HTTPS to Discord and `api.github.com`.

### Docker Compose (recommended)

From `discord-gh-issues/`:

```bash
cp .env.example .env
# fill in DISCORD_* and GITHUB_* (omit DISCORD_GUILD_ID for global commands in prod)

docker compose up -d --build
docker compose logs -f
```

The image runs `register-commands` once on start, then starts the bot. Data is stored in the `bot-data` volume.

Useful commands:

```bash
docker compose restart
docker compose down
```

### Plain Node on a VPS

```bash
cd discord-gh-issues
npm ci
# set env via .env or your process manager
npm run register-commands   # once per command change; skip DISCORD_GUILD_ID in prod
npm start
```

Keep it alive with systemd, pm2, or similar. Point a persistent directory at `data/` (or leave the default `discord-gh-issues/data`) so last-used order survives restarts.

Example systemd unit (`/etc/systemd/system/discord-gh-issues.service`):

```ini
[Unit]
Description=Discord GitHub issues bot
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/opt/discord-gh-issues
EnvironmentFile=/opt/discord-gh-issues/.env
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now discord-gh-issues
```

### Notes

- Re-run `npm run register-commands` (or recreate the container) after changing the context menu command definition.
- Rotate `DISCORD_TOKEN` / `GITHUB_TOKEN` in the host secrets or `.env`; never commit them.
- One replica only — do not run multiple gateway instances with the same bot token.

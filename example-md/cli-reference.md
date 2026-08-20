# CloudSync CLI Reference

Complete reference documentation for the CloudSync command-line interface (CLI). This guide covers all available commands, options, and usage examples.

## Installation

### npm (Recommended)

```bash
npm install -g @cloudsync/cli
```

### Homebrew (macOS)

```bash
brew tap cloudsync/tools
brew install cloudsync-cli
```

### Verify Installation

```bash
cloudsync --version
```

## Global Options

These options are available for all commands:

| Option | Description |
|--------|-------------|
| `--help, -h` | Show help for command |
| `--version, -v` | Show version number |
| `--profile <name>` | Use specific auth profile |
| `--workspace <id>` | Override default workspace |
| `--project <id>` | Specify project context |
| `--config <path>` | Use custom config file |
| `--json` | Output in JSON format |
| `--quiet, -q` | Suppress non-essential output |
| `--verbose` | Enable verbose output |
| `--debug` | Enable debug logging |
| `--no-color` | Disable colored output |

## Authentication Commands

### cloudsync auth login

Authenticate with CloudSync.

```bash
cloudsync auth login [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--profile <name>` | Save credentials to named profile |
| `--api-key <key>` | Authenticate with API key |
| `--sso` | Use SSO authentication |
| `--force` | Force re-authentication |

**Examples:**

```bash
# Interactive browser login
cloudsync auth login

# Login with API key
cloudsync auth login --api-key cs_live_xxx

# Create named profile
cloudsync auth login --profile work
```

### cloudsync auth logout

Clear stored credentials.

```bash
cloudsync auth logout [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--profile <name>` | Logout specific profile |
| `--all` | Logout all profiles |

### cloudsync auth status

Check authentication status.

```bash
cloudsync auth status [options]
```

**Output:**

```
Authentication Status
=====================
Profile: default
User: developer@example.com
Workspace: Engineering Team (ws_xyz789)
Token expires: 2024-01-20 15:30:00
API Key: cs_live_...abc (valid)
```

### cloudsync auth token

Manage authentication tokens.

```bash
cloudsync auth token <subcommand>
```

**Subcommands:**

```bash
cloudsync auth token show      # Display current token
cloudsync auth token refresh   # Refresh expired token
cloudsync auth token revoke    # Revoke current token
```

## Project Commands

### cloudsync init

Initialize a new CloudSync project.

```bash
cloudsync init [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--name <name>` | Project name |
| `--workspace <id>` | Target workspace |
| `--sync-mode <mode>` | Sync mode (bidirectional/upload/download) |
| `--template <name>` | Use project template |
| `--force` | Overwrite existing config |

**Examples:**

```bash
# Interactive initialization
cloudsync init

# Non-interactive
cloudsync init --name my-project --sync-mode bidirectional

# From template
cloudsync init --template nodejs
```

### cloudsync project

Manage projects.

```bash
cloudsync project <subcommand> [options]
```

**Subcommands:**

```bash
# List projects
cloudsync project list [--workspace <id>] [--status <status>]

# Create project
cloudsync project create <name> [--workspace <id>] [--description <desc>]

# Show project details
cloudsync project show <project-id>

# Update project
cloudsync project update <project-id> [--name <name>] [--description <desc>]

# Delete project
cloudsync project delete <project-id> [--force]

# Archive/unarchive
cloudsync project archive <project-id>
cloudsync project unarchive <project-id>
```

**Examples:**

```bash
# List all active projects
cloudsync project list --status active

# Create project in specific workspace
cloudsync project create "New Project" --workspace ws_xyz789

# Update project description
cloudsync project update proj_abc123 --description "Updated description"
```

## Sync Commands

### cloudsync sync start

Start file synchronization.

```bash
cloudsync sync start [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--watch` | Watch for changes (default) |
| `--once` | Sync once and exit |
| `--direction <dir>` | Force direction (upload/download) |
| `--dry-run` | Show what would be synced |

**Examples:**

```bash
# Start continuous sync
cloudsync sync start

# One-time sync
cloudsync sync start --once

# Dry run
cloudsync sync start --dry-run
```

### cloudsync sync stop

Stop synchronization.

```bash
cloudsync sync stop [options]
```

### cloudsync sync status

Check sync status.

```bash
cloudsync sync status [options]
```

**Output:**

```
Sync Status: Active
Direction: Bidirectional
Last sync: 2 minutes ago
Pending changes: 3 files (125 KB)
Watch status: Running
```

### cloudsync sync reset

Reset sync state.

```bash
cloudsync sync reset [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--full` | Full reset (re-scan all files) |
| `--to-version <ver>` | Reset to specific version |

### cloudsync push

Force push local changes.

```bash
cloudsync push [path] [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--force` | Overwrite cloud versions |
| `--dry-run` | Preview changes |

### cloudsync pull

Force pull cloud changes.

```bash
cloudsync pull [path] [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--force` | Overwrite local versions |
| `--dry-run` | Preview changes |

## File Commands

### cloudsync files

Manage files in projects.

```bash
cloudsync files <subcommand> [options]
```

**Subcommands:**

```bash
# List files
cloudsync files list [--path <prefix>] [--recursive]

# Show file info
cloudsync files info <path>

# Download file
cloudsync files download <path> [--output <local-path>]

# Upload file
cloudsync files upload <local-path> [--to <remote-path>]

# Delete file
cloudsync files delete <path> [--force]

# Move/rename file
cloudsync files move <source> <destination>

# Copy file
cloudsync files copy <source> <destination>

# Lock/unlock file
cloudsync files lock <path> [--reason <reason>] [--duration <time>]
cloudsync files unlock <path>
```

**Examples:**

```bash
# List files in directory
cloudsync files list --path src/ --recursive

# Download specific file
cloudsync files download src/config.json --output ./local-config.json

# Lock file for editing
cloudsync files lock src/important.js --reason "Refactoring" --duration 2h
```

## History Commands

### cloudsync history

View and manage sync history.

```bash
cloudsync history <subcommand> [options]
```

**Subcommands:**

```bash
# List history
cloudsync history list [--limit <n>] [--since <date>]

# Show version details
cloudsync history show <version-id>

# Restore version
cloudsync history restore <version-id> [--path <path>]

# Compare versions
cloudsync history diff <version1> <version2>
```

**Examples:**

```bash
# View last 20 sync events
cloudsync history list --limit 20

# Restore specific version
cloudsync history restore ver_abc123

# Compare two versions
cloudsync history diff ver_001 ver_002
```

## Conflict Commands

### cloudsync conflicts

Manage sync conflicts.

```bash
cloudsync conflicts <subcommand> [options]
```

**Subcommands:**

```bash
# List conflicts
cloudsync conflicts list [--status <status>]

# Show conflict details
cloudsync conflicts show <conflict-id>

# Resolve conflict
cloudsync conflicts resolve <conflict-id> --keep <local|cloud>

# Resolve all
cloudsync conflicts resolve-all --strategy <strategy>
```

**Examples:**

```bash
# List unresolved conflicts
cloudsync conflicts list --status pending

# Resolve keeping local version
cloudsync conflicts resolve cnf_abc123 --keep local
```

## Workspace Commands

### cloudsync workspace

Manage workspaces.

```bash
cloudsync workspace <subcommand> [options]
```

**Subcommands:**

```bash
# List workspaces
cloudsync workspace list

# Create workspace
cloudsync workspace create <name> [--description <desc>]

# Switch workspace
cloudsync workspace use <workspace-id>

# Show current workspace
cloudsync workspace current

# Update workspace
cloudsync workspace update <workspace-id> [options]

# Delete workspace
cloudsync workspace delete <workspace-id> [--force]
```

### cloudsync workspace members

Manage workspace members.

```bash
cloudsync workspace members <subcommand> [options]
```

**Subcommands:**

```bash
# List members
cloudsync workspace members list

# Invite member
cloudsync workspace members invite <email> --role <role>

# Update member role
cloudsync workspace members update <email> --role <role>

# Remove member
cloudsync workspace members remove <email>
```

## Configuration Commands

### cloudsync config

Manage configuration.

```bash
cloudsync config <subcommand> [options]
```

**Subcommands:**

```bash
# List all settings
cloudsync config list

# Get specific setting
cloudsync config get <key>

# Set setting
cloudsync config set <key> <value>

# Reset setting
cloudsync config reset <key>

# Show config file path
cloudsync config path

# Validate configuration
cloudsync config validate

# Edit config in editor
cloudsync config edit
```

**Examples:**

```bash
# Set sync interval
cloudsync config set sync.interval 10

# Enable debug logging
cloudsync config set log_level debug

# Validate config
cloudsync config validate
```

## Webhook Commands

### cloudsync webhooks

Manage webhooks.

```bash
cloudsync webhooks <subcommand> [options]
```

**Subcommands:**

```bash
# List webhooks
cloudsync webhooks list

# Create webhook
cloudsync webhooks create --url <url> --events <events>

# Update webhook
cloudsync webhooks update <webhook-id> [options]

# Delete webhook
cloudsync webhooks delete <webhook-id>

# Test webhook
cloudsync webhooks test <webhook-id>

# View deliveries
cloudsync webhooks deliveries <webhook-id>
```

## Diagnostic Commands

### cloudsync diagnose

Run diagnostics.

```bash
cloudsync diagnose [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--network` | Network diagnostics only |
| `--performance` | Performance analysis |
| `--full` | Complete diagnostic report |
| `--output <file>` | Save report to file |

### cloudsync debug

Debug utilities.

```bash
cloudsync debug <subcommand>
```

**Subcommands:**

```bash
cloudsync debug patterns <path>      # Test pattern matching
cloudsync debug file-match <path>    # Check if file is synced
cloudsync debug file-info <path>     # File details
cloudsync debug watcher              # Watcher status
cloudsync debug locks                # View file locks
cloudsync debug env                  # Environment variables
cloudsync debug memory               # Memory usage
```

### cloudsync logs

View logs.

```bash
cloudsync logs [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--lines <n>` | Number of lines |
| `--follow, -f` | Follow log output |
| `--level <level>` | Filter by level |
| `--export` | Export logs |
| `--days <n>` | Include logs from last n days |

## Utility Commands

### cloudsync diff

Show pending changes.

```bash
cloudsync diff [path] [options]
```

### cloudsync cache

Manage cache.

```bash
cloudsync cache <subcommand>
```

**Subcommands:**

```bash
cloudsync cache clear    # Clear all caches
cloudsync cache stats    # Show cache statistics
```

### cloudsync version

Show version information.

```bash
cloudsync version [--check-update]
```

### cloudsync update

Update CLI to latest version.

```bash
cloudsync update [--channel <channel>]
```

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 3 | Authentication error |
| 4 | Network error |
| 5 | Conflict error |
| 6 | Permission denied |
| 7 | Resource not found |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CLOUDSYNC_API_KEY` | API key for authentication |
| `CLOUDSYNC_WORKSPACE` | Default workspace ID |
| `CLOUDSYNC_PROJECT` | Default project ID |
| `CLOUDSYNC_CONFIG_PATH` | Custom config file path |
| `CLOUDSYNC_LOG_LEVEL` | Log level (debug/info/warn/error) |
| `CLOUDSYNC_NO_COLOR` | Disable colored output |
| `CLOUDSYNC_ENV` | Environment (development/production) |

## Shell Completion

### Bash

```bash
cloudsync completion bash >> ~/.bashrc
source ~/.bashrc
```

### Zsh

```bash
cloudsync completion zsh >> ~/.zshrc
source ~/.zshrc
```

### Fish

```bash
cloudsync completion fish > ~/.config/fish/completions/cloudsync.fish
```

## Configuration File

Default location: `.cloudsync/config.yaml`

```yaml
version: 2
project:
  name: my-project
  id: proj_abc123

sync:
  mode: bidirectional
  interval: 5

patterns:
  include:
    - "**/*"
  exclude:
    - "node_modules/**"
```

## See Also

- [Getting Started Guide](./getting-started.md)
- [Configuration Guide](./configuration-guide.md)
- [API Reference](./api-reference.md)
- [Troubleshooting](./troubleshooting.md)

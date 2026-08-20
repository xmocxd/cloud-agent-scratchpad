# Getting Started with CloudSync Platform

Welcome to CloudSync, a powerful cloud-based synchronization platform designed for modern development teams. This guide will walk you through the initial setup process, core concepts, and help you get your first project running.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** version 18.0 or higher
- **npm** version 9.0 or higher (or yarn 1.22+)
- **Git** version 2.30 or higher
- A supported operating system: macOS 12+, Windows 10/11, or Ubuntu 20.04+

You'll also need:

- A CloudSync account (free tier available)
- Basic familiarity with command-line interfaces
- An IDE or text editor of your choice

## Installation

### Using npm (Recommended)

The fastest way to get started is using npm to install the CloudSync CLI globally:

```bash
npm install -g @cloudsync/cli
```

Verify the installation by checking the version:

```bash
cloudsync --version
```

You should see output similar to:

```
CloudSync CLI v3.2.1
Node.js v18.17.0
Platform: darwin-arm64
```

### Using Homebrew (macOS)

For macOS users, you can also install via Homebrew:

```bash
brew tap cloudsync/tools
brew install cloudsync-cli
```

### Manual Installation

If you prefer manual installation or need to install in an air-gapped environment:

1. Download the appropriate binary from our releases page
2. Extract the archive to your preferred location
3. Add the binary location to your system PATH
4. Verify installation with `cloudsync --version`

## Authentication

### Initial Login

After installation, authenticate with your CloudSync account:

```bash
cloudsync auth login
```

This opens your default browser for OAuth authentication. After successful authentication, you'll see:

```
✓ Authentication successful
✓ Credentials stored in ~/.cloudsync/credentials
✓ Default workspace set to: personal
```

### API Key Authentication

For CI/CD environments or headless servers, use API key authentication:

```bash
export CLOUDSYNC_API_KEY="your-api-key-here"
cloudsync auth verify
```

You can generate API keys from the CloudSync dashboard under Settings → API Keys.

### Multiple Accounts

CloudSync supports multiple account profiles. To add another account:

```bash
cloudsync auth login --profile work
```

Switch between profiles using:

```bash
cloudsync config set profile work
```

## Creating Your First Project

### Project Initialization

Navigate to your project directory and initialize CloudSync:

```bash
cd your-project
cloudsync init
```

The interactive wizard guides you through configuration:

```
? Project name: my-awesome-project
? Description: A sample project for testing CloudSync
? Sync mode: (Use arrow keys)
  ❯ Bidirectional - Changes sync both ways
    Upload only - Local changes push to cloud
    Download only - Cloud changes pull to local
? Include patterns: **/*
? Exclude patterns: node_modules/**, .git/**, *.log
```

This creates a `.cloudsync/config.yaml` file in your project root:

```yaml
version: 2
project:
  name: my-awesome-project
  description: A sample project for testing CloudSync
  id: proj_abc123xyz

sync:
  mode: bidirectional
  conflict_resolution: newer_wins
  
patterns:
  include:
    - "**/*"
  exclude:
    - "node_modules/**"
    - ".git/**"
    - "*.log"
    - ".cloudsync/**"

hooks:
  pre_sync: []
  post_sync: []
```

### Understanding Sync Modes

CloudSync offers three synchronization modes, each suited for different workflows:

**Bidirectional Sync**

The default mode where changes flow in both directions. When you modify a file locally, it syncs to the cloud. When a teammate modifies a file in the cloud, it syncs to your local machine.

**Upload Only**

Changes only flow from local to cloud. This is useful for backup scenarios and publishing workflows.

**Download Only**

Changes only flow from cloud to local. Common use cases include read-only access to shared resources and deployment targets.

### Starting Synchronization

Begin syncing your project:

```bash
cloudsync sync start
```

The first sync performs a full scan and upload:

```
Scanning project files...
Found 1,247 files (45.3 MB)
Uploading to cloud...
████████████████████████████████████████ 100%
✓ Initial sync complete
✓ Watching for changes...
```

## Core Concepts

### Workspaces

Workspaces are the top-level organizational unit in CloudSync. They contain projects, team members, and shared settings.

```bash
cloudsync workspace list
cloudsync workspace create "Engineering Team"
cloudsync workspace use eng-team
```

### Projects

Projects represent individual codebases or file collections being synchronized. Each project has a unique identifier, configuration settings, and sync history.

### Versions and History

CloudSync maintains a complete history of all synchronized changes:

```bash
cloudsync history list --limit 20
cloudsync history restore ver_001
```

### Conflict Resolution

When the same file is modified both locally and in the cloud, CloudSync must resolve the conflict. Available strategies include `newer_wins`, `local_wins`, `cloud_wins`, `manual`, and `merge`.

## Common Commands Reference

```bash
# Authentication
cloudsync auth login
cloudsync auth logout
cloudsync auth status

# Project Management
cloudsync init
cloudsync sync start
cloudsync sync stop
cloudsync sync status

# File Operations
cloudsync push
cloudsync pull
cloudsync diff

# History
cloudsync history list
cloudsync history restore

# Configuration
cloudsync config list
cloudsync config set KEY VAL
```

## Next Steps

Now that you have CloudSync running, explore these topics:

1. **Team Collaboration** - Learn how to share projects with your team
2. **Advanced Configuration** - Deep dive into configuration options
3. **Webhooks and Integrations** - Connect CloudSync to your workflow
4. **Security Best Practices** - Secure your synchronized data

Happy syncing!

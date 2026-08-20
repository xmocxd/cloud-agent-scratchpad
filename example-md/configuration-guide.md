# CloudSync Configuration Guide

This comprehensive guide covers all configuration options available in CloudSync, from basic project settings to advanced enterprise configurations.

## Configuration File Overview

CloudSync uses YAML configuration files located at `.cloudsync/config.yaml` in your project root.

### Configuration File Structure

```yaml
version: 2

project:
  name: my-project
  description: Optional project description
  id: proj_auto_generated

sync:
  mode: bidirectional
  conflict_resolution: newer_wins
  interval: 5
  batch_size: 100

patterns:
  include:
    - "**/*"
  exclude:
    - "node_modules/**"
    - ".git/**"

hooks:
  pre_sync: []
  post_sync: []

advanced:
  preserve_timestamps: true
  follow_symlinks: false
  max_file_size: "100MB"
```

### Configuration Precedence

1. **Default values** - Built-in defaults
2. **Global configuration** - `~/.cloudsync/config.yaml`
3. **Project configuration** - `.cloudsync/config.yaml`
4. **Environment variables** - `CLOUDSYNC_*` prefixed
5. **Command-line flags** - Runtime overrides

## Synchronization Settings

### Sync Modes

**Bidirectional Mode** (Default)

```yaml
sync:
  mode: bidirectional
```

Changes flow in both directions—ideal for collaborative development.

**Upload Only Mode**

```yaml
sync:
  mode: upload
```

Changes flow only from local to cloud. Use for backups and publishing.

**Download Only Mode**

```yaml
sync:
  mode: download
```

Changes flow only from cloud to local. Use for deployment targets.

### Conflict Resolution Strategies

| Strategy | Description |
|----------|-------------|
| `newer_wins` | Most recent modification wins |
| `local_wins` | Local changes take precedence |
| `cloud_wins` | Cloud changes take precedence |
| `manual` | Prompts for each conflict |
| `merge` | Attempts automatic merge |

### Sync Timing

```yaml
sync:
  interval: 5          # Check interval in seconds
  debounce_ms: 500     # Delay before syncing
  batch_size: 100      # Max files per batch
  retry_attempts: 3    # Retry configuration
```

## File Patterns

### Include Patterns

```yaml
patterns:
  include:
    - "**/*"           # Include all files
    - "src/**/*"       # Or be specific
    - "*.json"
```

### Exclude Patterns

```yaml
patterns:
  exclude:
    - "node_modules/**"
    - ".git/**"
    - "*.log"
    - ".env"
    - "*.pem"
    - "dist/**"
```

### Pattern Syntax

| Pattern | Description | Example |
|---------|-------------|---------|
| `*` | Any characters except `/` | `*.js` |
| `**` | Any characters including `/` | `**/*.js` |
| `?` | Single character | `file?.txt` |
| `{a,b}` | Alternatives | `*.{js,ts}` |

## Lifecycle Hooks

### Pre-Sync Hooks

```yaml
hooks:
  pre_sync:
    - "npm run lint"
    - command: "npm run build"
      timeout: 60000
      working_directory: "./frontend"
```

### Post-Sync Hooks

```yaml
hooks:
  post_sync:
    - "npm run notify"
    - command: "./scripts/post-sync.sh"
      env:
        SYNC_RESULT: "${CLOUDSYNC_RESULT}"
```

### Hook Environment Variables

| Variable | Description |
|----------|-------------|
| `CLOUDSYNC_PROJECT_ID` | Project identifier |
| `CLOUDSYNC_SYNC_DIRECTION` | upload, download, or both |
| `CLOUDSYNC_FILES_COUNT` | Number of files synced |
| `CLOUDSYNC_RESULT` | success or failure |

## Advanced Settings

### File Handling

```yaml
advanced:
  preserve_timestamps: true
  follow_symlinks: false
  max_file_size: "100MB"
  checksum_algorithm: sha256
  compression: auto
```

### Performance Tuning

```yaml
advanced:
  performance:
    watcher:
      use_polling: false
      poll_interval: 1000
    memory:
      max_heap: "512MB"
    network:
      connect_timeout: 30000
      max_connections: 4
```

### Logging Configuration

```yaml
advanced:
  logging:
    level: info
    file: ".cloudsync/cloudsync.log"
    max_size: "10MB"
    max_files: 5
```

## Environment-Specific Configuration

```yaml
sync:
  mode: bidirectional
  interval: 5

environments:
  development:
    sync:
      interval: 2
  
  production:
    sync:
      mode: upload
      conflict_resolution: cloud_wins
```

Set active environment:

```bash
export CLOUDSYNC_ENV=production
cloudsync sync start --env production
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CLOUDSYNC_API_KEY` | API key for authentication |
| `CLOUDSYNC_WORKSPACE` | Default workspace ID |
| `CLOUDSYNC_ENV` | Active environment |
| `CLOUDSYNC_SYNC_MODE` | Sync mode override |
| `CLOUDSYNC_LOG_LEVEL` | Logging level |

## Configuration Validation

```bash
cloudsync config validate
```

## Example Configurations

### Web Development Project

```yaml
version: 2
project:
  name: react-app

sync:
  mode: bidirectional
  interval: 3

patterns:
  include:
    - "src/**"
    - "public/**"
    - "package.json"
  exclude:
    - "node_modules/**"
    - "build/**"
    - ".env*"

hooks:
  pre_sync:
    - "npm run lint"
```

### CI/CD Pipeline

```yaml
version: 2
project:
  name: deployment-artifacts

sync:
  mode: upload
  conflict_resolution: local_wins

patterns:
  include:
    - "dist/**"
    - "docker/**"
  exclude:
    - "**/*.map"

hooks:
  pre_sync:
    - "npm run build:prod"
  post_sync:
    - "./scripts/deploy.sh"
```

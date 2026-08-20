# CloudSync Troubleshooting Guide

This guide helps you diagnose and resolve common issues with CloudSync. Whether you're experiencing sync problems, authentication errors, or performance issues, you'll find solutions here.

## Quick Diagnostics

Before diving into specific issues, run the diagnostic command:

```bash
cloudsync diagnose
```

This performs a comprehensive check of system information, network connectivity, authentication, and local environment.

## Authentication Issues

### "Authentication Failed" Error

**Causes and Solutions:**

1. **Invalid API key format:**
   ```bash
   # Verify key format (should start with cs_live_ or cs_test_)
   echo $CLOUDSYNC_API_KEY | head -c 10
   ```

2. **Expired or revoked key:**
   ```bash
   cloudsync auth status
   # If revoked, create new key from dashboard
   ```

3. **Key not properly exported:**
   ```bash
   env | grep CLOUDSYNC
   export CLOUDSYNC_API_KEY="cs_live_your_key_here"
   ```

### OAuth Token Issues

```bash
# Check token expiration
cloudsync auth token-info

# Refresh token manually
cloudsync auth refresh

# Re-authenticate if needed
cloudsync auth login --force
```

### MFA Problems

**Lost MFA Device:**
1. Use backup codes
2. Contact workspace admin for reset
3. Use account recovery

**MFA Codes Not Working:**
```bash
# Check system time (TOTP requires accurate time)
date
sudo ntpdate -s time.nist.gov
```

## Sync Issues

### Files Not Syncing

**Step 1: Check sync status:**
```bash
cloudsync sync status
```

**Step 2: Verify file isn't excluded:**
```bash
cloudsync debug file-match path/to/file.txt
```

**Step 3: Check file size:**
```bash
cloudsync debug file-info path/to/large-file.zip
```

**Step 4: Force sync:**
```bash
cloudsync sync push path/to/file.txt --force
```

### Sync Stuck or Hanging

1. **Check for locked files:**
   ```bash
   cloudsync debug locks
   cloudsync debug locks release
   ```

2. **Restart sync daemon:**
   ```bash
   cloudsync sync stop
   cloudsync sync start
   ```

3. **Clear sync state:**
   ```bash
   cp .cloudsync/state.json .cloudsync/state.json.backup
   cloudsync sync reset
   cloudsync sync start
   ```

### Conflict Resolution Problems

**Repeated Conflicts:**
```bash
cloudsync conflicts list --file path/to/file.txt
cloudsync debug file-versions path/to/file.txt
```

**Manual Resolution:**
```bash
cloudsync conflicts resolve path/to/file.txt --keep local
# or
cloudsync conflicts resolve path/to/file.txt --keep cloud
```

## Performance Issues

### Slow Synchronization

**Diagnose the bottleneck:**
```bash
cloudsync diagnose --performance
```

**Optimize configuration:**
```yaml
sync:
  batch_size: 200
  interval: 10

advanced:
  performance:
    max_connections: 8
    compression: zstd
```

### High CPU Usage

**Check file watcher:**
```bash
cloudsync debug watcher-stats
```

**On Linux, increase inotify limits:**
```bash
echo 'fs.inotify.max_user_watches=524288' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**Reduce watched directories:**
```yaml
patterns:
  exclude:
    - "node_modules/**"
    - ".git/**"
    - "vendor/**"
```

### High Memory Usage

```bash
cloudsync debug memory
```

**Reduce memory:**
```yaml
advanced:
  performance:
    memory:
      max_heap: "256MB"
      read_buffer: "32KB"
```

## Network Issues

### Connection Timeouts

**Increase timeout values:**
```yaml
advanced:
  network:
    connect_timeout: 60000
    read_timeout: 120000
```

**Test connectivity:**
```bash
curl -v https://api.cloudsync.example.com/health
```

### SSL/TLS Errors

**Update CA certificates:**
```bash
# Ubuntu
sudo apt update && sudo apt install ca-certificates
```

**Corporate proxy with SSL inspection:**
```yaml
network:
  ca_cert: "/path/to/corporate-ca.pem"
```

## File System Issues

### Permission Denied Errors

```bash
# Check file permissions
ls -la path/to/file.txt

# Fix ownership
sudo chown $USER:$USER path/to/file.txt

# Fix permissions
chmod 644 path/to/file.txt
```

### File Watcher Limits (Linux)

```bash
# Check current limit
cat /proc/sys/fs/inotify/max_user_watches

# Increase limit permanently
echo 'fs.inotify.max_user_watches=524288' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Disk Space Issues

```bash
# Check disk usage
df -h
du -sh .cloudsync/

# Clear caches
cloudsync cache clear
rm -rf .cloudsync/backups/*
cloudsync versions prune --older-than 30d
```

## Configuration Issues

### Config File Not Loading

```bash
cloudsync config path
cloudsync config validate
```

**Common YAML errors:**
- Using tabs instead of spaces
- Missing quotes for special characters

### Pattern Matching Issues

```bash
cloudsync debug patterns --interactive
```

## Hook Failures

### Pre-Sync Hook Errors

```bash
cloudsync hooks run pre_sync --verbose
```

**Common issues:**
1. Script not executable: `chmod +x script.sh`
2. Missing dependencies
3. Wrong working directory

### Hook Timeout

```yaml
hooks:
  pre_sync:
    - command: "npm run build"
      timeout: 300000  # 5 minutes
```

## Logging and Debugging

### Enable Debug Logging

```bash
CLOUDSYNC_LOG_LEVEL=debug cloudsync sync start
# or
cloudsync config set log_level debug
```

### View Logs

```bash
cloudsync logs --lines 100
cloudsync logs --follow
cloudsync logs --level error
cloudsync logs --export --days 7 > cloudsync-logs.txt
```

## Recovery Procedures

### Recover from Corrupted State

```bash
cp -r .cloudsync .cloudsync.backup
cloudsync sync reset --to-version ver_abc123
# or full reset
cloudsync sync reset --full
cloudsync init --force
```

### Recover Deleted Files

```bash
cloudsync files list-deleted --project proj_abc123
cloudsync files restore path/to/deleted-file.txt
cloudsync files restore path/to/file.txt --version ver_xyz789
```

## Getting Help

### Collect Diagnostic Information

```bash
cloudsync diagnose --full --output diagnostic-report.json
cloudsync logs --export --days 7 >> diagnostic-report.txt
cloudsync config show --sanitize >> diagnostic-report.txt
```

### Support Channels

- **Documentation**: https://docs.cloudsync.example.com
- **Community Forum**: https://community.cloudsync.example.com
- **GitHub Issues**: https://github.com/cloudsync/cli/issues
- **Email Support**: support@cloudsync.example.com

When contacting support, include:
1. CloudSync CLI version
2. Operating system and version
3. Diagnostic report
4. Steps to reproduce the issue
5. Error messages (full text)

# CloudSync Performance Optimization Guide

This guide covers techniques and best practices for optimizing CloudSync performance, from configuration tuning to infrastructure considerations for large-scale deployments.

## Performance Overview

CloudSync performance depends on several factors:

- **Network bandwidth and latency**
- **File system characteristics**
- **Project size and structure**
- **Configuration settings**
- **Hardware resources**

### Performance Metrics

Key metrics to monitor:

| Metric | Target | Critical |
|--------|--------|----------|
| Sync latency (small files) | < 500ms | > 2s |
| Sync latency (large files) | < 5s/MB | > 15s/MB |
| File watcher events/sec | < 1000 | > 5000 |
| Memory usage | < 512MB | > 1GB |
| CPU usage | < 20% | > 50% |

## Baseline Performance Testing

### Run Performance Benchmark

```bash
cloudsync benchmark [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--files <n>` | Number of test files |
| `--size <size>` | Test file sizes |
| `--duration <time>` | Test duration |
| `--report <file>` | Save report |

**Example Output:**

```
CloudSync Performance Benchmark
===============================
Test Configuration:
  Files: 1000
  Sizes: 1KB, 100KB, 1MB, 10MB
  Duration: 5 minutes

Results:
  Upload throughput: 15.2 MB/s
  Download throughput: 22.8 MB/s
  Average latency: 125ms
  P95 latency: 450ms
  P99 latency: 890ms

File Type Performance:
  1KB files: 45 files/sec
  100KB files: 38 files/sec
  1MB files: 12 files/sec
  10MB files: 1.5 files/sec

Recommendations:
  ✓ Network performance: GOOD
  ⚠ Consider enabling compression for large files
  ⚠ High small-file count - consider batching
```

### Continuous Monitoring

```bash
# Enable performance monitoring
cloudsync config set monitoring.performance true

# View real-time metrics
cloudsync metrics watch

# Export metrics for analysis
cloudsync metrics export --format prometheus > metrics.txt
```

## Configuration Optimization

### Sync Settings

```yaml
sync:
  # Sync interval (seconds)
  # Lower = more responsive, higher = less overhead
  interval: 5  # Default: 5, Range: 1-3600
  
  # Debounce delay for rapid changes (milliseconds)
  # Prevents syncing every keystroke during active editing
  debounce_ms: 500  # Default: 500, Range: 100-5000
  
  # Maximum files per sync batch
  # Higher = better throughput, lower = more responsive
  batch_size: 100  # Default: 100, Range: 10-1000
  
  # Retry configuration
  retry_attempts: 3
  retry_delay: 1000  # Base delay in ms
  retry_backoff: exponential
```

### Network Settings

```yaml
advanced:
  network:
    # Connection timeout (ms)
    connect_timeout: 30000
    
    # Read timeout (ms)
    read_timeout: 60000
    
    # Keep-alive interval (ms)
    keepalive_interval: 30000
    
    # Concurrent upload/download connections
    max_connections: 4  # Default: 4, Range: 1-16
    
    # Enable HTTP/2 multiplexing
    http2: true
```

### Bandwidth Management

```yaml
sync:
  bandwidth:
    # Upload limit (bytes/second, 0 = unlimited)
    upload_limit: 0
    
    # Download limit (bytes/second)
    download_limit: 0
    
    # Scheduled limits (for office hours)
    schedule:
      - name: work_hours
        start: "09:00"
        end: "17:00"
        days: [mon, tue, wed, thu, fri]
        upload_limit: 5242880    # 5 MB/s
        download_limit: 10485760  # 10 MB/s
```

### Compression Settings

```yaml
advanced:
  # Compression algorithm
  # Options: none, gzip, zstd, auto
  compression: auto
  
  # Compression level (1-9)
  # Higher = better compression, more CPU
  compression_level: 6
  
  # Minimum file size for compression (bytes)
  compression_threshold: 1024  # 1KB
  
  # Skip compression for these types (already compressed)
  compression_skip:
    - "*.jpg"
    - "*.png"
    - "*.gif"
    - "*.mp4"
    - "*.zip"
    - "*.gz"
```

## File System Optimization

### File Watcher Configuration

```yaml
advanced:
  watcher:
    # Use native file system events (recommended)
    use_polling: false
    
    # Polling interval if use_polling is true
    poll_interval: 1000
    
    # Ignore permission-only changes
    ignore_permission_changes: true
    
    # Coalesce rapid events
    coalesce_threshold_ms: 100
    
    # Maximum events to queue
    max_queue_size: 10000
```

### Linux inotify Optimization

```bash
# Check current limits
cat /proc/sys/fs/inotify/max_user_watches
cat /proc/sys/fs/inotify/max_user_instances

# Increase limits (temporary)
sudo sysctl fs.inotify.max_user_watches=524288
sudo sysctl fs.inotify.max_user_instances=1024

# Increase limits (permanent)
echo 'fs.inotify.max_user_watches=524288' | sudo tee -a /etc/sysctl.conf
echo 'fs.inotify.max_user_instances=1024' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### macOS FSEvents Optimization

```yaml
advanced:
  watcher:
    # FSEvents latency (seconds)
    fsevents_latency: 0.5  # Default: 0.5, Range: 0.1-5.0
```

### Windows Optimization

```yaml
advanced:
  watcher:
    # ReadDirectoryChangesW buffer size
    win_buffer_size: 65536  # 64KB
```

## Pattern Optimization

### Efficient Exclusion Patterns

```yaml
patterns:
  exclude:
    # Exclude large directories first (most impactful)
    - "node_modules/**"
    - ".git/**"
    - "vendor/**"
    - "__pycache__/**"
    
    # Build artifacts
    - "dist/**"
    - "build/**"
    - ".next/**"
    - "target/**"
    
    # IDE/editor files
    - ".idea/**"
    - ".vscode/**"
    - "*.swp"
    
    # Large media files
    - "**/*.mp4"
    - "**/*.mov"
    - "**/*.iso"
```

### Pattern Performance Tips

1. **Order matters**: Place most frequently matched patterns first
2. **Be specific**: `node_modules/**` is faster than `**/node_modules/**`
3. **Avoid complex globs**: `**/**/file.txt` is slow
4. **Use directory patterns**: `dir/**` is faster than `dir/*` for deep trees

### Test Pattern Performance

```bash
# Measure pattern matching time
cloudsync debug patterns --benchmark

# Output:
# Pattern Performance Analysis
# ============================
# Total files scanned: 45,231
# Pattern matching time: 125ms
# 
# Slowest patterns:
#   1. **/*.log (23ms)
#   2. **/temp/** (18ms)
#   3. **/*.tmp (15ms)
```

## Memory Optimization

### Memory Configuration

```yaml
advanced:
  memory:
    # Maximum heap size
    max_heap: "512MB"  # Default, Range: 128MB-4GB
    
    # File read buffer size
    read_buffer: "64KB"  # Default, Range: 4KB-1MB
    
    # Maximum cached file entries
    max_cached_entries: 50000
    
    # Cache TTL (seconds)
    cache_ttl: 300
```

### Reduce Memory Usage

```bash
# Check current memory usage
cloudsync debug memory

# Clear caches
cloudsync cache clear

# Reduce index size for large projects
cloudsync config set advanced.indexing.max_cached_entries 10000
```

### Memory Profiling

```bash
# Enable memory profiling
cloudsync sync start --memory-profile

# View memory report
cloudsync debug memory --detailed
```

## Large Project Optimization

### Strategies for Large Projects

**Projects with 100K+ files:**

```yaml
sync:
  # Increase batch size
  batch_size: 500
  
  # Longer debounce for active development
  debounce_ms: 1000
  
  # Less frequent full scans
  interval: 30

advanced:
  # Incremental scanning
  indexing:
    incremental: true
    checkpoint_interval: 10000
  
  # Parallel processing
  parallel_uploads: 8
  parallel_downloads: 8
```

**Projects with large files (>100MB):**

```yaml
advanced:
  # Chunked transfer for large files
  chunking:
    enabled: true
    chunk_size: "8MB"  # Default: 4MB
    parallel_chunks: 4
  
  # Resume interrupted transfers
  resumable_uploads: true
  resumable_downloads: true
```

### Selective Sync

For very large projects, sync only what you need:

```yaml
patterns:
  include:
    # Only sync specific directories
    - "src/**"
    - "config/**"
    - "package.json"
  exclude:
    - "**/*"  # Exclude everything else
```

### Project Splitting

Consider splitting large monorepos:

```bash
# Create separate projects for different areas
cloudsync project create frontend --workspace eng
cloudsync project create backend --workspace eng
cloudsync project create shared --workspace eng
```

## Network Optimization

### Reduce Latency

```yaml
advanced:
  network:
    # Enable connection pooling
    connection_pool: true
    max_pool_size: 10
    
    # Enable TCP no-delay
    tcp_nodelay: true
    
    # DNS caching
    dns_cache_ttl: 300
```

### Handle High Latency Networks

```yaml
advanced:
  network:
    # Increase timeouts for high-latency connections
    connect_timeout: 60000
    read_timeout: 120000
    
    # More aggressive retry
    retry_attempts: 5
    retry_delay: 2000
```

### Proxy Optimization

```yaml
network:
  proxy:
    http: "http://proxy:8080"
    https: "http://proxy:8080"
    
    # Bypass proxy for local resources
    no_proxy: "localhost,127.0.0.1,.internal"
    
    # Connection reuse through proxy
    keep_alive: true
```

## Monitoring and Alerting

### Enable Performance Monitoring

```yaml
monitoring:
  performance:
    enabled: true
    
    # Metrics collection interval
    interval: 60  # seconds
    
    # Alert thresholds
    alerts:
      sync_latency_p95: 5000  # ms
      error_rate: 0.05  # 5%
      queue_size: 10000
```

### Prometheus Metrics

```yaml
monitoring:
  prometheus:
    enabled: true
    port: 9090
    path: /metrics
```

Available metrics:

```
cloudsync_sync_duration_seconds
cloudsync_files_synced_total
cloudsync_bytes_transferred_total
cloudsync_sync_errors_total
cloudsync_pending_changes
cloudsync_memory_usage_bytes
cloudsync_cpu_usage_percent
```

### Grafana Dashboard

Import the CloudSync dashboard:

```bash
cloudsync monitoring export-dashboard > cloudsync-dashboard.json
# Import into Grafana
```

## Troubleshooting Performance

### Identify Bottlenecks

```bash
# Full performance analysis
cloudsync diagnose --performance

# Output:
# Performance Analysis
# ====================
# 
# Bottlenecks Detected:
#   1. HIGH: File watcher overloaded (5,234 events/sec)
#      Recommendation: Add exclusion patterns for node_modules
#   
#   2. MEDIUM: Network latency (avg 450ms)
#      Recommendation: Check network connection
#   
#   3. LOW: Memory pressure (using 78% of limit)
#      Recommendation: Increase max_heap or reduce cache size
```

### Common Performance Issues

**Slow sync startup:**
```bash
# Check index size
cloudsync debug index-stats

# Rebuild index if corrupted
cloudsync sync reset --rebuild-index
```

**High CPU usage:**
```bash
# Check watcher stats
cloudsync debug watcher-stats

# Reduce watched directories
cloudsync config set patterns.exclude '["node_modules/**", ".git/**"]'
```

**Slow large file transfers:**
```bash
# Enable chunked transfer
cloudsync config set advanced.chunking.enabled true

# Increase chunk parallelism
cloudsync config set advanced.chunking.parallel_chunks 8
```

## Performance Checklist

### Initial Setup
- [ ] Configure appropriate exclusion patterns
- [ ] Set sync interval based on workflow
- [ ] Enable compression for text-heavy projects
- [ ] Configure bandwidth limits if needed

### Large Projects
- [ ] Increase batch size
- [ ] Enable incremental indexing
- [ ] Consider project splitting
- [ ] Use selective sync

### Network
- [ ] Test baseline performance
- [ ] Configure timeouts appropriately
- [ ] Enable connection pooling
- [ ] Set up proxy if required

### Monitoring
- [ ] Enable performance monitoring
- [ ] Set up alerts
- [ ] Configure metrics export
- [ ] Review performance regularly

## See Also

- [Configuration Guide](./configuration-guide.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [Architecture Overview](./architecture-overview.md)

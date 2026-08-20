# CloudSync Migration Guide

This guide helps you migrate to CloudSync from other synchronization solutions, import existing data, and transition your team's workflows smoothly.

## Migration Overview

### Supported Migration Sources

CloudSync provides migration tools for:

- **Dropbox** - Full folder structure and sharing permissions
- **Google Drive** - Files, folders, and collaborative settings
- **OneDrive** - Personal and business accounts
- **AWS S3** - Buckets and object metadata
- **FTP/SFTP** - Legacy file servers
- **Local directories** - Direct import from filesystem
- **Other sync tools** - Generic import format

### Migration Process

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Source System  │────▶│  Migration Tool │────▶│   CloudSync     │
│  (Dropbox, etc) │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       │
   1. Connect              2. Transform            3. Import
   - Authenticate          - Map structure         - Create project
   - Scan files            - Convert metadata      - Upload files
   - Export data           - Preserve history      - Set permissions
```

## Pre-Migration Checklist

### Assessment

Before migrating, assess your current setup:

```bash
# Install migration tools
npm install -g @cloudsync/migrate

# Analyze source system
cloudsync-migrate analyze --source dropbox --account your-account
```

Output:
```
Source Analysis: Dropbox
========================
Total files: 45,231
Total size: 125.4 GB
Folder depth: 12 levels
File types: 847 unique extensions
Shared folders: 23
Team members: 15
Last modified: 2024-01-15

Estimated migration time: 4-6 hours
Estimated CloudSync storage: 125.4 GB

Potential issues:
  ⚠ 3 files exceed 5GB (CloudSync limit)
  ⚠ 12 filenames contain invalid characters
  ⚠ 2 circular symlinks detected
```

### Planning

1. **Choose migration window**: Schedule during low-activity period
2. **Notify team**: Communicate timeline and expectations
3. **Backup data**: Ensure source data is backed up
4. **Test migration**: Run test migration with subset of data

## Migrating from Dropbox

### Connect Dropbox Account

```bash
# Authenticate with Dropbox
cloudsync-migrate auth dropbox

# Verify connection
cloudsync-migrate verify dropbox
```

### Map Folder Structure

```yaml
# migration-config.yaml
source:
  type: dropbox
  account: your-dropbox-email@example.com

mapping:
  # Map Dropbox folders to CloudSync projects
  folders:
    "/Work/Projects":
      project: work-projects
      workspace: engineering
    "/Work/Shared":
      project: shared-resources
      workspace: engineering
    "/Personal":
      project: personal-files
      workspace: personal

  # File transformations
  transformations:
    # Rename patterns
    rename:
      - from: "*.dropbox"
        to: ""  # Remove .dropbox extension
    
    # Exclude patterns
    exclude:
      - "*.tmp"
      - ".dropbox.cache/**"
      - "Icon\r"

options:
  preserve_timestamps: true
  preserve_permissions: true
  include_deleted: false
```

### Execute Migration

```bash
# Dry run first
cloudsync-migrate run --config migration-config.yaml --dry-run

# Execute migration
cloudsync-migrate run --config migration-config.yaml

# Monitor progress
cloudsync-migrate status
```

### Migrate Sharing Permissions

```bash
# Export Dropbox sharing settings
cloudsync-migrate export-permissions dropbox > permissions.json

# Review and edit permissions mapping
# Edit permissions.json as needed

# Import to CloudSync
cloudsync-migrate import-permissions permissions.json
```

## Migrating from Google Drive

### Authentication

```bash
# OAuth authentication
cloudsync-migrate auth google-drive

# Service account (for Workspace)
cloudsync-migrate auth google-drive \
  --service-account /path/to/service-account.json \
  --domain company.com
```

### Handle Google Formats

Google Docs, Sheets, and Slides need conversion:

```yaml
# migration-config.yaml
source:
  type: google-drive

transformations:
  google_formats:
    docs:
      export_as: docx  # or pdf, txt, html
    sheets:
      export_as: xlsx  # or csv, pdf
    slides:
      export_as: pptx  # or pdf
    drawings:
      export_as: png   # or svg, pdf
```

### Preserve Collaboration

```yaml
options:
  # Preserve Google Drive collaboration metadata
  preserve_comments: true
  preserve_suggestions: false  # Resolve before migration
  preserve_version_history: true
  max_versions: 10
```

## Migrating from AWS S3

### Configure S3 Access

```bash
# Using AWS credentials
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key

cloudsync-migrate auth s3 --region us-east-1
```

### Bucket Migration

```yaml
# migration-config.yaml
source:
  type: s3
  bucket: my-bucket
  prefix: "data/"  # Optional: migrate only specific prefix

mapping:
  project: s3-migration
  workspace: data-team

options:
  # S3-specific options
  include_metadata: true
  storage_class_filter:
    - STANDARD
    - STANDARD_IA
  # Exclude Glacier (requires restore first)
```

### Large-Scale Migration

For buckets with millions of objects:

```bash
# Generate manifest first
cloudsync-migrate manifest s3://my-bucket > manifest.json

# Parallel migration with manifest
cloudsync-migrate run \
  --manifest manifest.json \
  --parallel 10 \
  --resume-from checkpoint.json
```

## Migrating from FTP/SFTP

### Connect to Server

```bash
# FTP
cloudsync-migrate auth ftp \
  --host ftp.example.com \
  --user ftpuser

# SFTP with key
cloudsync-migrate auth sftp \
  --host sftp.example.com \
  --user sftpuser \
  --key ~/.ssh/id_rsa
```

### Migration Configuration

```yaml
source:
  type: sftp
  host: sftp.example.com
  path: /data/files

mapping:
  project: legacy-files
  workspace: migration

options:
  follow_symlinks: false
  preserve_permissions: true
  exclude_hidden: true
```

## Data Import

### Direct File Import

For local directories or mounted drives:

```bash
# Import directory
cloudsync import /path/to/files \
  --project my-project \
  --workspace my-workspace

# With options
cloudsync import /path/to/files \
  --project my-project \
  --preserve-structure \
  --exclude "*.log" \
  --exclude "tmp/**"
```

### Bulk Import with Manifest

```json
// import-manifest.json
{
  "version": 1,
  "project": "bulk-import",
  "files": [
    {
      "source": "/data/file1.txt",
      "destination": "documents/file1.txt",
      "metadata": {
        "author": "alice@example.com",
        "tags": ["important", "reviewed"]
      }
    },
    {
      "source": "/data/file2.pdf",
      "destination": "reports/file2.pdf"
    }
  ]
}
```

```bash
cloudsync import --manifest import-manifest.json
```

### Import from Archive

```bash
# ZIP file
cloudsync import archive.zip --project my-project

# TAR.GZ
cloudsync import backup.tar.gz --project my-project --strip-components 1
```

## Post-Migration Tasks

### Verification

```bash
# Verify file integrity
cloudsync-migrate verify \
  --source dropbox \
  --project migrated-project

# Compare file counts
cloudsync-migrate compare \
  --source dropbox \
  --destination proj_abc123
```

Output:
```
Migration Verification Report
=============================
Source files: 45,231
Destination files: 45,228

Discrepancies:
  - 3 files skipped (exceeded size limit)
    - /large-video-1.mp4 (6.2 GB)
    - /large-video-2.mp4 (5.8 GB)
    - /backup.zip (7.1 GB)

Checksum verification: PASSED (45,228/45,228)
```

### Update References

Update any external references to your files:

```bash
# Generate URL mapping
cloudsync-migrate url-map \
  --source dropbox \
  --project migrated-project \
  > url-mapping.json

# Use mapping to update references in your codebase
```

### Team Transition

```bash
# Invite team members
cloudsync workspace members invite-bulk team-emails.txt

# Share migrated projects
cloudsync project share migrated-project --team "Engineering"

# Send transition notification
cloudsync notify email \
  --template migration-complete \
  --to team@company.com
```

### Decommission Source

After successful migration and verification:

1. Set source system to read-only
2. Monitor for any access attempts
3. Maintain source for rollback period (30-90 days recommended)
4. Export final audit logs
5. Delete source data

## Rollback Procedures

### Partial Rollback

```bash
# Restore specific files from source
cloudsync-migrate restore \
  --source dropbox \
  --files "path/to/file1.txt,path/to/file2.txt"
```

### Full Rollback

```bash
# Export from CloudSync
cloudsync export proj_abc123 --output /backup/cloudsync-export

# Re-enable source system
# Re-upload to source if needed
```

## Migration Best Practices

### Phased Migration

For large organizations:

1. **Phase 1**: Migrate archived/cold data
2. **Phase 2**: Migrate shared resources
3. **Phase 3**: Migrate active projects
4. **Phase 4**: Migrate personal folders

### Parallel Operation

Run both systems in parallel during transition:

```yaml
# Sync between source and CloudSync
sync:
  mode: bidirectional
  sources:
    - type: dropbox
      path: /Work
    - type: cloudsync
      project: work-files
```

### Communication Plan

```markdown
## Migration Timeline

**Week 1**: Preparation
- [ ] Announce migration plan
- [ ] Collect feedback
- [ ] Finalize mapping

**Week 2**: Test Migration
- [ ] Migrate test data
- [ ] Verify integrity
- [ ] Train early adopters

**Week 3**: Production Migration
- [ ] Execute migration
- [ ] Monitor progress
- [ ] Address issues

**Week 4**: Transition
- [ ] Enable CloudSync for all users
- [ ] Set Dropbox to read-only
- [ ] Support and troubleshoot

**Week 5+**: Stabilization
- [ ] Monitor usage
- [ ] Gather feedback
- [ ] Decommission source
```

## Troubleshooting Migration

### Common Issues

**Files Not Migrating:**
```bash
# Check migration logs
cloudsync-migrate logs --level error

# Retry failed files
cloudsync-migrate retry --failed-only
```

**Permission Errors:**
```bash
# Verify source permissions
cloudsync-migrate check-permissions --source dropbox

# Fix permission mapping
cloudsync-migrate fix-permissions --project proj_abc123
```

**Checksum Mismatches:**
```bash
# Identify mismatched files
cloudsync-migrate verify --checksum-only

# Re-migrate specific files
cloudsync-migrate run --files mismatched-files.txt --force
```

### Getting Help

- Migration documentation: https://docs.cloudsync.example.com/migration
- Migration support: migration@cloudsync.example.com
- Community forum: https://community.cloudsync.example.com/c/migration

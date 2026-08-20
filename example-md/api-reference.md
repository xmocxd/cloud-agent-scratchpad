# CloudSync API Reference

This document provides comprehensive documentation for the CloudSync REST API. The API enables programmatic access to all CloudSync features.

## API Overview

### Base URL

All API requests should be made to:

```
https://api.cloudsync.example.com/v2
```

### Rate Limiting

API requests are rate limited based on your plan:

| Plan | Requests/minute | Requests/day |
|------|-----------------|--------------|
| Free | 60 | 1,000 |
| Pro | 300 | 50,000 |
| Team | 1,000 | 500,000 |
| Enterprise | Custom | Custom |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 299
X-RateLimit-Reset: 1705312800
```

## Authentication

### API Keys

Include the key in the `Authorization` header:

```bash
curl -H "Authorization: Bearer cs_live_abc123xyz" \
     https://api.cloudsync.example.com/v2/projects
```

### OAuth 2.0

For applications acting on behalf of users:

**Scopes:**

| Scope | Description |
|-------|-------------|
| `read` | Read-only access to projects and files |
| `write` | Create and modify projects and files |
| `delete` | Delete projects and files |
| `admin` | Full administrative access |

## Projects

### List Projects

```
GET /projects
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `workspace_id` | string | Filter by workspace |
| `status` | string | Filter by status: `active`, `paused`, `archived` |
| `limit` | integer | Results per page (default: 20, max: 100) |

**Response:**

```json
{
  "data": [
    {
      "id": "proj_abc123",
      "name": "my-project",
      "status": "active",
      "file_count": 1247,
      "total_size": 47513600,
      "created_at": "2024-01-10T08:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 10,
    "offset": 0,
    "has_more": true
  }
}
```

### Create Project

```
POST /projects
```

**Request Body:**

```json
{
  "name": "new-project",
  "workspace_id": "ws_xyz789",
  "sync_mode": "bidirectional"
}
```

### Update Project

```
PATCH /projects/{project_id}
```

### Delete Project

```
DELETE /projects/{project_id}
```

## Files

### List Files

```
GET /projects/{project_id}/files
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `path` | string | Filter by path prefix |
| `type` | string | Filter by type: `file`, `directory` |
| `limit` | integer | Results per page |

### Upload File

```
PUT /projects/{project_id}/files/{file_path}
```

### Download File

```
GET /projects/{project_id}/files/{file_path}/content
```

### Delete File

```
DELETE /projects/{project_id}/files/{file_path}
```

## Sync Operations

### Get Sync Status

```
GET /projects/{project_id}/sync/status
```

**Response:**

```json
{
  "project_id": "proj_abc123",
  "status": "syncing",
  "progress": {
    "files_total": 150,
    "files_completed": 87,
    "percentage": 58
  },
  "started_at": "2024-01-15T16:30:00Z"
}
```

### Trigger Sync

```
POST /projects/{project_id}/sync
```

## Webhooks

### Create Webhook

```
POST /webhooks
```

**Request Body:**

```json
{
  "url": "https://yourapp.com/webhooks/cloudsync",
  "events": ["sync.completed", "file.created"],
  "secret": "your-webhook-secret"
}
```

### Available Events

| Event | Description |
|-------|-------------|
| `sync.started` | Sync operation started |
| `sync.completed` | Sync completed successfully |
| `file.created` | New file synced |
| `file.updated` | Existing file updated |
| `file.deleted` | File deleted |
| `conflict.detected` | Sync conflict detected |

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "resource_not_found",
    "message": "Project not found",
    "request_id": "req_abc123xyz"
  }
}
```

### Common Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `invalid_request` | Malformed request |
| 401 | `unauthorized` | Invalid authentication |
| 403 | `forbidden` | Insufficient permissions |
| 404 | `resource_not_found` | Resource doesn't exist |
| 429 | `rate_limit_exceeded` | Too many requests |

## SDKs

### JavaScript/TypeScript

```bash
npm install @cloudsync/sdk
```

```typescript
import { CloudSync } from '@cloudsync/sdk';

const client = new CloudSync({
  apiKey: process.env.CLOUDSYNC_API_KEY
});

const projects = await client.projects.list();
```

### Python

```bash
pip install cloudsync-sdk
```

```python
from cloudsync import CloudSync

client = CloudSync(api_key=os.environ["CLOUDSYNC_API_KEY"])
projects = client.projects.list()
```

### Go

```bash
go get github.com/cloudsync/cloudsync-go
```

```go
client := cloudsync.NewClient(os.Getenv("CLOUDSYNC_API_KEY"))
projects, err := client.Projects.List(context.Background(), nil)
```

# CloudSync Webhooks and Integrations Guide

This guide covers how to integrate CloudSync with your existing tools and workflows using webhooks, native integrations, and the API.

## Webhooks Overview

Webhooks allow CloudSync to send real-time HTTP notifications to your applications when specific events occur.

### How Webhooks Work

```
┌─────────────────┐    Event occurs    ┌─────────────────┐
│   CloudSync     │ ────────────────▶  │  Your Endpoint  │
│   Platform      │    HTTP POST       │                 │
└─────────────────┘                    └─────────────────┘
```

### Webhook Security

All webhook requests include security headers:

| Header | Description |
|--------|-------------|
| `X-CloudSync-Signature` | HMAC-SHA256 signature of the payload |
| `X-CloudSync-Timestamp` | Unix timestamp when event was sent |
| `X-CloudSync-Delivery` | Unique delivery ID for idempotency |
| `X-CloudSync-Event` | Event type that triggered the webhook |

**Signature Verification (Node.js):**

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, timestamp, secret) {
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
    throw new Error('Webhook timestamp too old');
  }
  
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(`sha256=${expectedSignature}`),
    Buffer.from(signature)
  );
}
```

**Signature Verification (Python):**

```python
import hmac
import hashlib
import time

def verify_webhook_signature(payload, signature, timestamp, secret):
    current_time = int(time.time())
    if abs(current_time - int(timestamp)) > 300:
        return False
    
    signed_payload = f"{timestamp}.{payload}"
    expected_signature = hmac.new(
        secret.encode(),
        signed_payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(f"sha256={expected_signature}", signature)
```

## Creating Webhooks

### Via API

```bash
curl -X POST https://api.cloudsync.example.com/v2/webhooks \
  -H "Authorization: Bearer cs_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://yourapp.com/webhooks/cloudsync",
    "events": ["sync.completed", "file.created"],
    "secret": "whsec_your_secret_here"
  }'
```

### Via CLI

```bash
cloudsync webhooks create \
  --url "https://yourapp.com/webhooks/cloudsync" \
  --events "sync.completed,file.created"
```

## Webhook Events

### Sync Events

| Event | Description |
|-------|-------------|
| `sync.started` | Synchronization started |
| `sync.completed` | Synchronization completed |
| `sync.failed` | Synchronization failed |

### File Events

| Event | Description |
|-------|-------------|
| `file.created` | New file added |
| `file.updated` | File modified |
| `file.deleted` | File removed |

### Other Events

| Event | Description |
|-------|-------------|
| `conflict.detected` | Sync conflict detected |
| `project.created` | New project created |
| `member.added` | User added to workspace |

### Event Payload Example

```json
{
  "id": "evt_abc123xyz",
  "type": "sync.completed",
  "created_at": "2024-01-15T16:35:00Z",
  "data": {
    "sync_id": "sync_abc123",
    "direction": "upload",
    "files_synced": 150,
    "duration_ms": 45000
  },
  "metadata": {
    "workspace_id": "ws_xyz789",
    "project_id": "proj_abc123"
  }
}
```

## Webhook Best Practices

### Idempotency

Design handlers to be idempotent since CloudSync may retry failed deliveries:

```javascript
async function handleEvent(event) {
  if (await isEventProcessed(event.id)) {
    console.log(`Event ${event.id} already processed`);
    return;
  }
  
  await processEventLogic(event);
  await markEventProcessed(event.id);
}
```

### Respond Quickly

Acknowledge immediately and process asynchronously:

```javascript
app.post('/webhooks/cloudsync', async (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).send('Invalid signature');
  }
  
  await queue.add('process-webhook', req.body);
  res.status(200).send('Accepted');
});
```

### Retry Handling

CloudSync retries with exponential backoff:
- Attempt 1: Immediate
- Attempt 2: After 1 minute
- Attempt 3: After 5 minutes
- Attempt 4: After 30 minutes
- Attempt 5: After 2 hours

## Native Integrations

### Slack Integration

```yaml
integrations:
  slack:
    enabled: true
    channel: "#engineering-sync"
    notifications:
      sync_completed: true
      sync_failed: true
      conflicts: true
```

### GitHub Integration

**GitHub Actions Workflow:**

```yaml
name: CloudSync Deploy

on:
  push:
    branches: [main]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup CloudSync
        uses: cloudsync/setup-action@v2
        with:
          api-key: ${{ secrets.CLOUDSYNC_API_KEY }}
      
      - name: Sync to Cloud
        run: cloudsync sync push --wait
```

### GitLab Integration

```yaml
# .gitlab-ci.yml
sync_to_cloud:
  stage: sync
  image: cloudsync/cli:latest
  script:
    - cloudsync auth login --api-key $CLOUDSYNC_API_KEY
    - cloudsync sync push --wait
  only:
    - main
```

### Jira Integration

```yaml
integrations:
  jira:
    enabled: true
    url: "https://company.atlassian.net"
    project: "SYNC"
    issue_types:
      sync_failure: "Bug"
      conflict: "Task"
```

## Building Custom Integrations

### Using the SDK

**Node.js:**

```javascript
const { CloudSync } = require('@cloudsync/sdk');

const client = new CloudSync({
  apiKey: process.env.CLOUDSYNC_API_KEY
});

client.on('sync.completed', async (event) => {
  console.log(`Sync completed: ${event.data.files_synced} files`);
  await triggerDeployment(event.data.project_id);
});

client.connect();
```

**Python:**

```python
from cloudsync import CloudSync

client = CloudSync(api_key=os.environ["CLOUDSYNC_API_KEY"])

@client.on("sync.completed")
def handle_sync_completed(event):
    print(f"Sync completed: {event['data']['files_synced']} files")
    trigger_deployment(event['data']['project_id'])

client.connect()
```

### Webhook Handler Example

```javascript
const express = require('express');
const app = express();

app.post('/webhooks/cloudsync', express.json(), async (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case 'sync.completed':
      await notifyTeam(`Sync completed: ${event.data.files_synced} files`);
      break;
    case 'sync.failed':
      await createIncident(event.data.error);
      break;
    case 'conflict.detected':
      await notifyOwner(event.data.file_path);
      break;
  }
  
  res.status(200).send('OK');
});

app.listen(3000);
```

## Integration Recipes

### Deploy on Sync

```javascript
client.on('sync.completed', async (event) => {
  if (event.data.direction === 'upload') {
    await exec('npm run deploy');
    await notifySlack('Deployment triggered');
  }
});
```

### Backup Notifications

```javascript
client.on('sync.completed', async (event) => {
  const summary = {
    files: event.data.files_synced,
    size: formatBytes(event.data.bytes_transferred),
    duration: formatDuration(event.data.duration_ms)
  };
  
  await sendEmail({
    to: 'admin@company.com',
    subject: 'Daily Backup Complete',
    body: `Backed up ${summary.files} files (${summary.size})`
  });
});
```

### Conflict Escalation

```javascript
client.on('conflict.detected', async (event) => {
  const conflict = event.data;
  
  await createJiraTicket({
    summary: `Sync conflict: ${conflict.file_path}`,
    description: `
      Local: ${conflict.local_version.modified_by}
      Cloud: ${conflict.cloud_version.modified_by}
    `,
    priority: 'High'
  });
});
```

## Testing Webhooks

### Local Development

Use ngrok for local testing:

```bash
ngrok http 3000
# Use the ngrok URL when creating webhooks
```

### Webhook Replay

```bash
# Replay a specific event
cloudsync webhooks replay evt_abc123

# Test webhook endpoint
cloudsync webhooks test https://yourapp.com/webhooks/cloudsync
```

## Monitoring Integrations

### Webhook Delivery Status

```bash
cloudsync webhooks deliveries list --webhook wh_abc123
cloudsync webhooks deliveries show del_xyz789
```

### Integration Health

```bash
cloudsync integrations status
cloudsync integrations test slack
```

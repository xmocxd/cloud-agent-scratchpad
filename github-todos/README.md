# GitHub Todos

Aggregate open GitHub issues (public + private) from repos you own. Hosted as an Astro app on Cloudflare Workers, protected by Cloudflare Access — no custom login code.

## Stack

| Piece | Purpose |
| --- | --- |
| **Astro** | SSR UI that renders the issue list |
| **GitHub Issues Search API** | One authenticated call for open issues across your owned repos |
| **`GITHUB_TOKEN` secret** | Fine-grained or classic PAT with `issues:read` + access to private repos |
| **Cloudflare Workers** | Hosts the SSR app (Astro’s Cloudflare adapter targets Workers, not Pages) |
| **Cloudflare Access** | Login gate in front of the Worker so private issue data stays off the public web |
| **GitHub Actions** | Builds and deploys with Wrangler on push |

## Setup

1. Create a GitHub PAT that can read issues on your private repos.
2. Local:
   ```bash
   cd github-todos
   cp .dev.vars.example .dev.vars
   # put your PAT in .dev.vars
   npm install
   npm run dev
   ```
3. Production secrets (once):
   ```bash
   cd github-todos
   npx wrangler secret put GITHUB_TOKEN
   ```
4. Repo secrets for Actions: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
5. Deploy: push to `main` (paths under `github-todos/`) or run the workflow manually.

## Cloudflare Access (auth)

Access sits in front of the Worker. The app never implements accounts.

1. Cloudflare Zero Trust → **Access** → **Applications** → Add application
2. Type: Self-hosted; set your Worker hostname / custom domain
3. Policy: allow your email (OTP) or a Google/GitHub identity provider
4. Save — unauthenticated visitors hit the Access login, not your issue list

### Free tier (approx.)

- **Zero Trust / Access**: free plan includes a limited seat count (commonly 50 users)
- **Workers**: free tier request/CPU limits apply to SSR
- Enough for a personal dashboard; scale or paid plans only if you share widely

## Notes

- Search uses `is:issue is:open user:<you>` (owned repos). Org-wide aggregation can be added later with extra `org:` qualifiers.
- Bugs / Todos filters match label names containing `bug` or `todo`/`task`.

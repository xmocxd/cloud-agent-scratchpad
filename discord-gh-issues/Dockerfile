FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY tsconfig.json ./
COPY src ./src

# Persist last-used repo order across restarts
VOLUME ["/app/data"]

ENV NODE_ENV=production

# Register commands once at container start, then run the gateway bot.
# Override CMD if you register commands separately in CI.
CMD ["sh", "-c", "npx tsx src/register-commands.ts && npx tsx src/index.ts"]

FROM node:22

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# Workspace manifests (pnpm needs all package.json files present)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

RUN pnpm install --frozen-lockfile

# Source
COPY apps/backend/ ./apps/backend/

# Generate Prisma client, then compile TypeScript
RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend build

WORKDIR /app/apps/backend

EXPOSE 3000

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

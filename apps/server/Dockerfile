FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN pnpm install --filter @carrypet/server --filter @carrypet/shared

COPY apps/server ./apps/server
COPY packages/shared ./packages/shared

WORKDIR /app/apps/server

RUN pnpm prisma:generate
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]

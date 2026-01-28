# CarryPet MVP Monorepo

This repo will host the CarryPet MVP: a two-sided marketplace that connects pet owners with vetted drivers for safe pet transport.

## Prerequisites
- Node.js 18+
- pnpm 9+
- Docker + Docker Compose (for PostgreSQL + API)
- Expo CLI (for mobile apps)

## Repository Structure
- `apps/mobile-owner`: Expo React Native owner app (placeholder)
- `apps/mobile-driver`: Expo React Native driver app (placeholder)
- `apps/server`: NestJS API (scaffolded)
- `packages/shared`: Shared types/constants (placeholder)

## Getting Started

### Install dependencies
```bash
pnpm install
```

### Run the API (scaffold)
```bash
pnpm --filter @carrypet/server start:dev
```

### Health check
```bash
curl http://localhost:3000/health
```

### Docker Compose (Postgres + API)
```bash
cp .env.example .env
docker compose up --build
```

### Prisma
```bash
pnpm --filter @carrypet/server prisma:generate
pnpm --filter @carrypet/server prisma:migrate
```

## Next Steps
- Implement auth, trips, payments, matching, and admin modules
- Create the mobile apps

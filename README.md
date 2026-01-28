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
pnpm --filter @carrypet/server prisma:seed
```

### Mobile Apps (Expo)
```bash
pnpm --filter @carrypet/mobile-owner start
pnpm --filter @carrypet/mobile-driver start
```

### Mock Payments
Set `DARAJA_ENV=mock` in `.env` to use mock responses for M-Pesa STK requests.
Use `POST /payments/mpesa/callback` with a payload like:
```json
{ "Body": { "stkCallback": { "ResultCode": 0, "CheckoutRequestID": "mpesa-<tripId>-<timestamp>" } } }
```

## Next Steps
- Flesh out UI flows for owner/driver apps (trip requests, offers, status tracking)
- Add background jobs for matching expiration and payment reconciliation
- Add real Daraja STK integration and webhook verification

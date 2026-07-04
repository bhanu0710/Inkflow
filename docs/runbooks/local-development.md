# Local Development Runbook

## Purpose

Run InkFlow locally with the same foundation used by Docker Compose.

## Environment Files

Create local environment files from examples:

```bash
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

## Commands

```bash
npm install
npm run lint
npm run build
npm test
docker compose up --build
```

## Notes

Local `.env` files must not be committed.

# SQF Documentation Generator

Monorepo scaffold for generating SQF Edition 10 food safety documentation from a multi-step questionnaire.

## Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, TanStack Query, Zustand, Lucide React.
- Backend: Rust, Actix-web, SQLx, async-openai.
- Database: PostgreSQL.
- Deployment: Docker Compose locally, Railway-ready backend Dockerfile.

## Local Development

```sh
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up --build
```

The frontend runs at `http://localhost:3000`, and the backend health check is available at `http://localhost:8080/health`.

## Manual Checks

```sh
cd backend && cargo check
cd frontend && npm install && npm run build
docker compose config
```

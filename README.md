# HookBridge

High-throughput webhook ingestion, deduplication and relay hub.

HookBridge is a pnpm monorepo containing an API server, a web dashboard, a CLI, and shared types.

## Project Structure

```
HookBridge/
├── apps/
│   ├── api/      # Hono + Socket.io server, Prisma, BullMQ, Redis (@hookbridge/api)
│   ├── web/      # Next.js + Tailwind dashboard (@hookbridge/web)
│   └── cli/      # `hookbridge` command-line client (commander, socket.io-client)
├── packages/
│   └── types/    # Shared TypeScript types (@hookbridge/types)
├── docker-compose.yml   # Postgres 16 + Redis 7
├── .env.example
└── pnpm-workspace.yaml
```

## Tech Stack

- **API:** Hono, Socket.io, Prisma (PostgreSQL), BullMQ, ioredis, Zod
- **Web:** Next.js, Tailwind CSS
- **CLI:** Commander, socket.io-client
- **Tooling:** TypeScript, pnpm workspaces, tsx, Docker Compose

## Prerequisites

- Node.js >= 20
- pnpm
- Docker (for Postgres and Redis)

## Getting Started

```bash
# 1. Install dependencies (also runs `prisma generate`)
pnpm install

# 2. Configure environment
cp .env.example .env

# 3. Start Postgres and Redis
docker compose up -d

# 4. Run database migrations
pnpm db:migrate

# 5. Start the apps (separate terminals)
pnpm dev:api   # http://localhost:4000
pnpm dev:web   # Next.js dashboard
pnpm dev:cli   # CLI
```

Health check: `GET http://localhost:4000/health`

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | `hookbridge` | Postgres credentials (docker-compose) |
| `PORT` | `4000` | API port |
| `DATABASE_URL` | `postgresql://hookbridge:hookbridge@localhost:5434/hookbridge?schema=public` | Prisma connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection |
| `CORS_ORIGIN` | `http://localhost:3001` | Allowed origin for API and Socket.io |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | API URL used by the web app |
| `HOOKBRIDGE_SERVER` | `http://localhost:4000` | API URL used by the CLI |

> Postgres is exposed on host port **5434**; Redis on **6379**.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev:api` | Run API in watch mode |
| `pnpm dev:web` | Run web dashboard |
| `pnpm dev:cli` | Run CLI |
| `pnpm build` | Build all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run Prisma migrations |

## License

Private / unlicensed.

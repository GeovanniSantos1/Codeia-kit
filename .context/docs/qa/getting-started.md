---
slug: getting-started
category: getting-started
generatedAt: 2026-01-19T17:51:06.558Z
updatedAt: 2026-03-04
---

# How do I set up and run this project?

## Getting Started

### Prerequisites

- Node.js v18+ (LTS recommended)
- npm
- PostgreSQL database (local, Docker, or hosted)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd workspace

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your DATABASE_URL, Clerk keys, Asaas keys, OpenRouter key
```

### Database Setup

```bash
# Sync schema to database (development)
npm run db:push

# Or create a migration (production)
npm run db:migrate
```

### Running

```bash
# Development server (port 5000)
npm run dev

# Production build
npm run build
npm run start
```

### First Steps

1. Sign up via Clerk authentication
2. Access the dashboard at `/dashboard`
3. Create your first client at `/clients/new`
4. Create a loan for the client at `/loans/new`
5. Monitor due dates via `/alerts/today` and `/alerts/overdue`

### Admin Access

Set `ADMIN_EMAILS` or `ADMIN_USER_IDS` in `.env` to access `/admin`.

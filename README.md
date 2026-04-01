# DevBoard

Freelance marketplace for software projects with full workflow: authentication, jobs, proposals, contracts, delivery review, notifications, ratings, and payment flow.

## Author

This project is created and maintained by **NgoHuuThuan**.

- GitHub: https://github.com/Nhthuando

## Highlights

- Role-based platform: `CLIENT` and `DEV`
- JWT authentication (`/api/auth/login`, `/api/auth/register`, `/api/auth/me`)
- Job posting and proposal workflow
- Contract lifecycle with delivery/review flow
- Notifications and reviews
- Payment integration and webhook support (Stripe)
- Frontend wired to real backend APIs (no mock data on core pages)

## Tech Stack

### Frontend (`client`)

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Radix UI + custom UI components

### Backend (`server`)

- Node.js + Express 5
- Prisma ORM
- PostgreSQL (Neon-compatible)
- JWT + bcryptjs
- Stripe + Cloudinary integration

## Repository Structure

```text
DevBoard/
|- client/   # Next.js frontend
|- server/   # Express API + Prisma
`- README.md
```

## Quick Start

### 1) Clone repository

```bash
git clone https://github.com/Nhthuando/DevBoard.git
cd DevBoard
```

### 2) Setup backend

```bash
cd server
npm install
```

Create `server/.env` with at least:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your_jwt_secret"
PORT=5000

# Optional, used by payment/release features
CLIENT_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
AUTO_RELEASE_JOB_ENABLED="false"
AUTO_RELEASE_INTERVAL_MS="900000"
AUTO_RELEASE_BATCH_SIZE="50"
DATE_REVIEW_LIMIT="7"
CLOUDINARY_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

Run backend:

```bash
npm start
```

Backend runs at `http://localhost:5000`.

### 3) Setup frontend

```bash
cd ../client
npm install
```

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Scripts

### Frontend (`client`)

- `npm run dev` - start Next.js dev server
- `npm run build` - production build
- `npm run start` - run production build
- `npm run lint` - lint source

### Backend (`server`)

- `npm start` - run API server via nodemon

## API Base URL

Frontend API client is configured in `client/lib/api.ts`:

- `NEXT_PUBLIC_API_URL` (recommended)
- fallback: `http://localhost:5000/api`

## Notes

- If login page loads but login request fails, ensure backend is running and CORS origin matches your frontend URL.
- Keep `.env` files private and do not commit secrets.

## Copyright

© 2026 DevBoard By Ngo Huu Thuan. All rights reserved.

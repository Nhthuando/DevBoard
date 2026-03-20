# 🖥️ DevBoard

> A modern freelance job board built for developers — where every line of code gets fairly compensated.

---

## ✨ Overview

**DevBoard** bridges the gap between clients who need software built and developers who build it. From job posting to final payment, every step of the workflow is handled in one place — with secure escrow to protect both sides.

```
Client posts job → Developer submits proposal → Client selects developer → Escrow via Stripe → Done ✅
```

---

## 🚀 Features

- 🔐 **JWT Authentication** — Secure register & login with role-based access
- 👥 **Role System** — Separate flows for `CLIENT` and `DEV`
- 📋 **Job Posting** — Clients can post, edit, and manage job listings
- 📨 **Proposal System** — Developers can browse and apply to open jobs
- 💳 **Stripe Escrow** — Payments are held securely until project delivery
- 🛡️ **RBAC Middleware** — Route-level protection based on user role

---

## 🛠️ Tech Stack

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

### Infrastructure
![Neon](https://img.shields.io/badge/Neon-00E599?style=flat&logo=neon&logoColor=black)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=flat&logo=stripe&logoColor=white)

---

## 📁 Project Structure

```
server/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Auth, RBAC
│   ├── routes/          # API routes
│   ├── lib/             # Prisma singleton
│   └── validation/      # Zod schemas
├── prisma/
│   └── schema.prisma
└── index.js
```

---

## 🔧 Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL (or Neon account)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/devboard.git
cd devboard/server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start the server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="your_secret_key"
PORT=5000
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register account | Public |
| POST | `/api/auth/login` | Login & get token | Public |
| GET | `/api/auth/me` | Get current user | Authenticated |

### Jobs *(coming soon)*
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/jobs` | Post a new job | CLIENT only |
| GET | `/api/jobs` | Browse all jobs | DEV only |
| POST | `/api/jobs/:id/apply` | Apply to a job | DEV only |

---

## 🔒 Auth Flow

```
1. Register → password hashed với bcrypt
2. Login    → JWT token trả về (expires 1h)
3. Request  → gửi token trong Authorization header
4. Server   → verify token → check role → allow/deny
```

---

## 👤 Author

**Huu Thuan**
> Building things, one endpoint at a time.

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/your-username)

---

## 📄 License

MIT © Huu Thuan

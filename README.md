# FinanceTrack – Personal Finance Management Platform

A complete full-stack personal finance management web application built with **React + Node.js + Express + MongoDB**.

> Final Year College Project — Infoziant Internship

---

## Live Deployment

| Service | URL |
|---|---|
| **Frontend** | https://frontend-tau-livid-99.vercel.app |
| **Backend API** | https://financetrack-backend-ckrl.onrender.com |
| **Database** | MongoDB Atlas (cloud) |

### Demo Credentials
| Role | Email | Password |
|---|---|---|
| Admin | admin@financetrack.com | Admin@1234 |
| User | Register a new account | — |

---

## Features

| Feature | Details |
|---|---|
| Authentication | JWT registration, login, logout, profile management, password change |
| Transactions | Add, edit, delete, filter, search income and expenses |
| Budgets | Monthly budgets per category with real-time usage tracking |
| Budget Email Alerts | Automatic emails at 90% and 100% budget usage via Brevo API |
| Dashboard | Summary cards and 4 interactive Recharts visualisations |
| Reports | Full transaction history with date/category filters and CSV export |
| Categories | System categories + user-created personal categories |
| Admin Panel | User management, category management, system statistics |
| Responsive UI | Works on mobile, tablet and desktop |

---

## Technology Stack

### Frontend
- React 18
- Vite
- React Router v6
- Axios
- Recharts
- React Hot Toast

### Backend
- Node.js 18
- Express.js
- JWT (jsonwebtoken)
- bcryptjs
- Mongoose ODM
- Nodemailer / Brevo HTTP API

### Database
- MongoDB Atlas (production)
- Mongoose schemas with validation

### Deployment
- Frontend: Vercel
- Backend: Render (Node.js free tier)
- Database: MongoDB Atlas free tier

---

## Database Design

### User
```
_id          ObjectId
fullName     String (required)
email        String (unique, required)
password     String (bcrypt hashed, select: false)
role         String (USER | ADMIN, default: USER)
active       Boolean (default: true)
createdAt    Date
updatedAt    Date
```

### Category
```
_id          ObjectId
name         String (required, min 2 chars)
type         String (INCOME | EXPENSE)
description  String
owner        ObjectId → User (null = system category)
isSystem     Boolean
createdAt    Date
updatedAt    Date
Index: { name, type, owner } unique
```

### Transaction
```
_id              ObjectId
user             ObjectId → User
type             String (INCOME | EXPENSE)
amount           Number (min 0.01)
category         ObjectId → Category
description      String
transactionDate  Date
createdAt        Date
updatedAt        Date
Index: { user, transactionDate }
```

### Budget
```
_id        ObjectId
user       ObjectId → User
category   ObjectId → Category
amount     Number (min 0.01)
month      Number (1–12)
year       Number
createdAt  Date
updatedAt  Date
Index: { user, category, month, year } unique
```

### BudgetNotification
```
_id        ObjectId
user       ObjectId → User
budget     ObjectId → Budget
category   ObjectId → Category
month      Number
year       Number
threshold  Number (90 | 100)
sentAt     Date
status     String (sent | failed)
Index: { budget, threshold, month, year } unique
```

---

## API Documentation

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login, returns JWT |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/users/profile | JWT | Get current user |
| PUT | /api/users/profile | JWT | Update full name |
| PUT | /api/users/change-password | JWT | Change password |

### Transactions
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/transactions | JWT | List with filters & pagination |
| POST | /api/transactions | JWT | Create transaction |
| GET | /api/transactions/:id | JWT | Get one |
| PUT | /api/transactions/:id | JWT | Update |
| DELETE | /api/transactions/:id | JWT | Delete |

**Query params for GET /api/transactions:**
`page, size, sortBy, sortDir, type, categoryId, startDate, endDate, search`

### Categories
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/categories | JWT | System + user categories |
| POST | /api/categories | JWT | Create personal category |
| PUT | /api/categories/:id | JWT | Update own category |
| DELETE | /api/categories/:id | JWT | Delete own category |

### Budgets
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/budgets | JWT | All budgets with spent/remaining |
| POST | /api/budgets | JWT | Create budget |
| PUT | /api/budgets/:id | JWT | Update budget |
| DELETE | /api/budgets/:id | JWT | Delete budget |
| GET | /api/dashboard/budget-analysis | JWT | Current month analysis |

### Dashboard
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/dashboard/summary | JWT | Income, expenses, balance |
| GET | /api/dashboard/monthly | JWT | Monthly trends |
| GET | /api/dashboard/categories | JWT | Category spending |

### Reports
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/reports/transactions | JWT | Paginated transaction history |
| GET | /api/reports/summary | JWT | Income/expense/net summary |
| GET | /api/reports/export | JWT | Download CSV |

### Admin (ADMIN role only)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/admin/stats | JWT + ADMIN | System statistics |
| GET | /api/admin/users | JWT + ADMIN | All users |
| PATCH | /api/admin/users/:id/toggle-active | JWT + ADMIN | Activate/deactivate user |
| GET | /api/admin/categories | JWT + ADMIN | System categories |
| POST | /api/admin/categories | JWT + ADMIN | Create system category |
| PUT | /api/admin/categories/:id | JWT + ADMIN | Update system category |
| DELETE | /api/admin/categories/:id | JWT + ADMIN | Delete system category |

### Health & Test
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /actuator/health | No | Health check |
| POST | /api/test/email | JWT | Send test email |
| POST | /api/test/trigger-alerts | JWT | Re-trigger budget alerts |

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free) or local MongoDB
- Brevo account (free) for email alerts

### 1. Clone the repository
```bash
git clone https://github.com/harshabasava970-bot/Finance-Track.git
cd Finance-Track
```

### 2. Backend Setup

```bash
cd backend-node
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/financetrack?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Email alerts via Brevo API
BREVO_API_KEY=xkeysib-your-brevo-api-key
SMTP_FROM=FinanceTrack <noreply@yourdomain.com>
```

```bash
npm start
# Backend starts on http://localhost:5000
```

On first start the backend automatically:
- Connects to MongoDB
- Seeds 20 system categories
- Creates default admin: admin@financetrack.com / Admin@1234

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
# Frontend starts on http://localhost:5173
```

---

## Deployment

### Frontend → Vercel
1. Import repo at [vercel.com](https://vercel.com)
2. Root Directory: `frontend`
3. Environment variable: `VITE_API_URL=https://your-backend.onrender.com`
4. Deploy

### Backend → Render
1. New Web Service → connect GitHub repo
2. Root Directory: `backend-node`
3. Runtime: Node
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variables:

| Variable | Value |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Random secret key (min 32 chars) |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | Your Vercel URL |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `BREVO_API_KEY` | From Brevo → SMTP & API → API Keys |
| `SMTP_FROM` | `FinanceTrack <your@email.com>` |

---

## Project Structure

```
Finance-Track/
├── backend-node/                  # Node.js + Express backend
│   └── src/
│       ├── config/               # Database, email, seed data
│       ├── controllers/          # Route handlers
│       ├── middleware/           # Auth, error handler
│       ├── models/               # Mongoose schemas
│       ├── routes/               # Express routers
│       ├── services/             # Budget alert service
│       ├── utils/                # API response helpers
│       └── server.js             # App entry point
├── frontend/                     # React + Vite
│   └── src/
│       ├── api/                  # Axios API calls
│       ├── components/           # Layout + common UI
│       ├── context/              # AuthContext
│       ├── pages/                # All page components
│       └── utils/                # Helpers
└── README.md
```

---

## Environment Variables Reference

### Backend
| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | No | Token TTL (default: 7d) |
| `FRONTEND_URL` | Yes | Allowed CORS origin |
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | production / development |
| `BREVO_API_KEY` | For emails | Brevo API key for budget alerts |
| `SMTP_FROM` | For emails | Sender display name and email |

### Frontend
| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend base URL |

---

## Email Alert Logic

Budget alerts are sent automatically via Brevo HTTP API:

- **90% alert**: sent once when spending first reaches 90% of monthly budget
- **100% alert**: sent once when spending first reaches or exceeds 100%
- Duplicate prevention: `BudgetNotification` collection with unique index on `(budget, threshold, month, year)`
- Triggered after every transaction create / update / delete
- To resend manually: Profile page → "Trigger Alerts" button

---

*Built for Final Year College Project — Infoziant Internship 2026*

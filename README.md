# 💰 FinanceTrack – Personal Finance Management Platform

A complete full-stack personal finance management web application built with **React + Spring Boot + MySQL**.

> 🎓 Final Year College Project

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Authentication | JWT-based registration, login, logout, profile management |
| 💳 Transactions | Add, edit, delete, filter, search income & expenses |
| 🎯 Budgets | Monthly budgets per category with real-time usage tracking |
| 📊 Dashboard | Summary cards + 4 interactive charts (Recharts) |
| 📈 Reports | Full transaction history with CSV export |
| 🛡️ Admin Panel | User management, category management, system stats |

---

## 🛠️ Technology Stack

### Frontend
- React 18 + Vite
- React Router v6
- Axios
- Recharts
- React Hot Toast

### Backend
- Java 21 + Spring Boot 3.2
- Spring Security + JWT (jjwt 0.12.5)
- Spring Data JPA + Hibernate
- Bean Validation
- OpenCSV (CSV export)

### Database
- MySQL 8 (production)
- H2 (testing)

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway.app
- **Database**: Railway MySQL

---

## 🗄️ Database Design

```
users           → id, fullName, email, password(BCrypt), role, active, createdAt
categories      → id, name, type(INCOME/EXPENSE), userId(nullable), systemCategory
transactions    → id, userId, categoryId, type, amount(DECIMAL), description, transactionDate
user_budgets    → id, userId, categoryId, amount(DECIMAL), budget_month, budget_year
```

---

## 🚀 Setup Instructions

### Prerequisites
- Java 21
- Maven 3.9+
- Node.js 18+
- MySQL 8

### 1. Clone the repository
```bash
git clone https://github.com/harshabasava970-bot/Finance-Track.git
cd Finance-Track
```

### 2. Backend Setup

#### Create MySQL database
```sql
CREATE DATABASE financetrack;
```

#### Configure environment
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials
```

#### Run the backend
```bash
cd backend
mvn spring-boot:run
# OR with environment variables:
DATABASE_URL=jdbc:mysql://localhost:3306/financetrack?useSSL=false&serverTimezone=UTC&createDatabaseIfNotExist=true \
DATABASE_USERNAME=root \
DATABASE_PASSWORD=yourpassword \
JWT_SECRET=YourSecretKey \
mvn spring-boot:run
```

Backend starts on **http://localhost:8080**

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env: set VITE_API_URL=http://localhost:8080
npm install
npm run dev
```

Frontend starts on **http://localhost:5173**

---

## 🔑 Default Admin Credentials

The app auto-creates an admin on first startup:
- **Email**: admin@financetrack.com
- **Password**: Admin@1234

> Change the password after first login!

---

## 🌐 API Overview

| Module | Endpoints |
|---|---|
| Auth | POST /api/auth/register, POST /api/auth/login |
| Users | GET/PUT /api/users/profile, PUT /api/users/change-password |
| Transactions | GET/POST /api/transactions, GET/PUT/DELETE /api/transactions/{id} |
| Categories | GET/POST /api/categories, PUT/DELETE /api/categories/{id} |
| Budgets | GET/POST /api/budgets, GET/PUT/DELETE /api/budgets/{id} |
| Dashboard | GET /api/dashboard/summary, /monthly, /categories, /budget-analysis |
| Reports | GET /api/reports/transactions, /summary, /export (CSV) |
| Admin | GET /api/admin/users, /stats, /categories |

---

## 🧪 Running Tests

```bash
cd backend
mvn test -Dspring.profiles.active=test
```

**14 tests** covering:
- User registration & login
- Password hashing
- Transaction CRUD
- Authorization (user isolation)
- Budget creation & calculations
- Duplicate budget prevention

---

## ☁️ Deployment

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) and import the repo
2. Set **Root Directory** to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-backend.railway.app`
4. Deploy

### Backend → Railway
1. Go to [railway.app](https://railway.app) and create a new project
2. Add a **MySQL** plugin
3. Connect GitHub repo, set root to `/`
4. Set environment variables:
   ```
   DATABASE_URL=jdbc:mysql://<host>:<port>/railway
   DATABASE_USERNAME=<from Railway MySQL>
   DATABASE_PASSWORD=<from Railway MySQL>
   JWT_SECRET=<generate a strong random key>
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Railway uses `railway.json` to build and start automatically

---

## 📁 Project Structure

```
Finance-Track/
├── backend/                  # Spring Boot application
│   ├── src/main/java/com/financetrack/
│   │   ├── config/           # Security, DataInitializer
│   │   ├── controller/       # REST controllers
│   │   ├── dto/              # Request/Response DTOs
│   │   ├── entity/           # JPA entities
│   │   ├── exception/        # Global exception handler
│   │   ├── repository/       # Spring Data JPA repos
│   │   ├── security/         # JWT, UserDetails
│   │   └── service/          # Business logic
│   └── src/test/             # JUnit 5 integration tests
└── frontend/                 # React + Vite application
    └── src/
        ├── api/              # Axios API calls
        ├── components/       # Layout + common components
        ├── context/          # AuthContext
        ├── pages/            # All page components
        └── utils/            # Helpers (currency, dates)
```

---

## 📋 Environment Variables Reference

### Backend
| Variable | Description | Default |
|---|---|---|
| DATABASE_URL | MySQL JDBC URL | localhost:3306/financetrack |
| DATABASE_USERNAME | DB user | root |
| DATABASE_PASSWORD | DB password | (empty) |
| JWT_SECRET | JWT signing secret | (hardcoded fallback) |
| JWT_EXPIRATION | Token TTL in ms | 86400000 (24h) |
| FRONTEND_URL | Allowed CORS origin | http://localhost:5173 |
| PORT | Server port | 8080 |

### Frontend
| Variable | Description | Default |
|---|---|---|
| VITE_API_URL | Backend base URL | http://localhost:8080 |

---

*Built with ❤️ for a Final Year College Project Demonstration*

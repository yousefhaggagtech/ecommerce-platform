# ecommerce-platform
A production-ready, full-stack E-commerce platform built with modern web technologies and Clean Architecture principles. Designed to deliver a high-performance, minimalist shopping experience tailored for clothing brands.

Developed by [Yousef](https://github.com/yousefhaggagtech)

---

## 🚀 Features (MVP)

* **Authentication:** Secure JWT-based authentication (Register, Login, Session persistence).
* **Product Engine:** Advanced filtering, searching, and pagination built securely on the backend.
* **Robust Shopping Cart:** Client-side state management with local storage synchronization to prevent data loss.
* **Order Management:** Complete checkout flow with inventory decrement and status tracking.
* **Modern UI/UX:** Clean, minimalist, and mobile-first design focused on seamless user experience and high conversion rates.
* **Clean Architecture:** Strict separation of concerns (Controllers, Services, Models) for maximum scalability and maintainability,(lazy loading, code splitting, clean API design)

---

## 🛠️ Tech Stack

**Frontend (Client)**
* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS + Shadcn/ui
* **Server State:** TanStack Query (React Query)
* **Client State:** Zustand

**Backend (Server)**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB
* **ORM:** Mongoose
* **Security:** bcryptjs, jsonwebtoken, helmet, cors

---

## 📂 Monorepo Structure

```text
ecommerce-platform/
├── backend/                  # Node.js REST API
│   ├── src/
│   │   ├── controller/       # Route logic
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express routes
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Helper functions
│   │   ├── app.ts            # Express app setup
│   │   └── server.ts         # Server entry point
│   └── package.json
├── frontend/                 # Next.js Application
│   ├── src/
│   │   ├── app/              # Next.js Pages (Presentation / UI Layer)
│   │   ├── components/       # Reusable UI (Presentation / UI Layer)
│   │   ├── domain/           # Core Entities & Interfaces (e.g., Product, Cart, 
│   │   ├── application/      # Use Cases, State (Zustand), and Custom Hooks
│   │   ├── infrastructure/   # API Clients (Axios), External Services, DTOs
│   └── package.json
└── README.md
````

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18+)
    
- MongoDB (Local or Atlas)
    

### 1. Clone the repository

Bash

```
git clone [https://github.com/yousefhaggagtech/your-repo-name.git](https://github.com/yousefhaggagtech/your-repo-name.git)
cd your-repo-name
```

### 2. Environment Variables

Create a `.env` file in the `backend` directory using the provided example:

**backend/.env.example**

مقتطف الرمز

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=30d
NODE_ENV=development
```

Create a `.env.local` file in the `frontend` directory:

**frontend/.env.local**

مقتطف الرمز

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Install & Run

**Backend:**

Bash

```
cd backend
npm install
npm run dev
```

**Frontend:**

Bash

```
cd frontend
npm install
npm run dev
```

---

## 📈 Future Roadmap (Scaling Phase)
- Real payment gateway integration.
- Admin dashboard for inventory and sales analytics.
- Verified purchase review system.
- Advanced MongoDB Atlas Search integration.
- Caching layer (e.g., Redis) for performance optimization

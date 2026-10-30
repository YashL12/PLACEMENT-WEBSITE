# GECRPlacement — Placement Portal & Coding Practice Arena

> **Government Engineering College, Rajkot (GECR) · Computer Department**  
> High-performance, resource-efficient placement preparation platform engineered for free-tier constraints (0.1 vCPU, 512 MB RAM).

---

## 🎯 Architecture & Strict Free-Tier Optimizations

The platform is engineered to run reliably on free hosting tiers (Render Web Service + Vercel):

1. **Zero Backend Compilers / Sandbox Overhead**:
   - The 0.1 vCPU / 512 MB backend **never** compiles or executes student code directly.
   - Java, JavaScript, and Python code execution is securely proxied to an external Judge0 provider with request validation, size restrictions (max 32 KB), timeouts (15s), and concurrency controls.
   - **SQL execution is 100% client-side** using SQLite compiled to WebAssembly (`sql.js`). The engine is lazy-loaded only when a student opens a SQL problem, resulting in zero server CPU or RAM usage for database problems.

2. **Minimal Query & Database Projection Strategy**:
   - Problem listing endpoints (`/api/coding-questions`) return lightweight cards with tight MongoDB projections. Full problem statements, test case arrays, and solutions are **excluded** from the list view.
   - Question solutions are stored server-side and fetched strictly on-demand (`/api/coding-questions/:slug/solution?lang=...`) when the student explicitly clicks **Show Solution**.
   - Stable indexed sorting by `difficultyRank` (Easy → Medium → Hard) and pagination (20 questions per page) eliminate expensive memory sorting.

3. **Privacy-First Zero-DB Solved State**:
   - No student authentication or database writes are required for coding practice.
   - Solved status is computed and stored locally in browser `localStorage` (`gecr_solved_questions`) only when **100% of public sample test cases pass**.

4. **Frontend Bundle & Lazy Loading**:
   - Built with React 19, Vite, and Tailwind CSS.
   - The SQL WebAssembly runtime (`sql-wasm.wasm` and `sql.js`) is automatically code-split into a separate dynamic chunk, keeping the initial page load bundle small (~127 kB gzipped).

---

## 📁 Repository Structure

```text
├── client/                     # Frontend Application (React 19 + Vite + Tailwind CSS)
│   ├── public/                 # Static assets (logos, icons, sql-wasm.wasm)
│   ├── src/
│   │   ├── components/         # Navbar, Footer, CodeEditor, CodingQuestionCard, etc.
│   │   ├── context/            # AuthContext (admin authentication)
│   │   ├── pages/              # CodingPracticePage, CodingWorkspacePage, HomePage, CompaniesPage, etc.
│   │   ├── services/           # api.js, sqlRunner.js (SQLite WebAssembly execution)
│   │   └── utils/              # solvedStorage.js (localStorage management)
│   └── package.json
│
├── server/                     # Backend API Service (Node.js + Express + Mongoose)
│   ├── scripts/
│   │   ├── seed-coding-questions.js   # Idempotent question bank seeder (with --dry-run)
│   │   ├── test-api.js                # 20 automated integration tests
│   │   └── import-placement-data.js   # PYQ & Company data importer
│   ├── src/
│   │   ├── controllers/        # codingQuestionController, executeController, etc.
│   │   ├── middleware/         # auth, rate limiters, validation
│   │   ├── models/             # CodingQuestion, Company, Experience, etc.
│   │   ├── routes/             # codingQuestionRoutes, executeRoutes, companyRoutes, etc.
│   │   └── server.js           # Express app entry point
│   └── package.json
│
├── .env.example                # Sample environment configuration template
├── .gitignore                  # Git hygiene rules (protects .env, node_modules, builds)
└── README.md                   # This documentation guide
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18+ (tested on Node v22)
- MongoDB instance (MongoDB Atlas or local `mongodb://127.0.0.1:27017/placement_portal`)

### 1. Backend Setup

```bash
cd server
npm install

# Copy environment template
cp ../.env.example .env
# Edit .env with your MongoDB URI and secrets
```

Run database seeder (safe and idempotent upserts):
```bash
# Dry-run validation (no DB writes)
npm run seed-coding-dry

# Live seed (imports/updates verified placement question bank)
npm run seed-coding
```

Start the backend API:
```bash
npm run dev
# Server runs on http://localhost:5000
```

Run automated backend tests:
```bash
npm test
# Runs 20 automated API tests verifying endpoints, queries, and security guards
```

### 2. Frontend Setup

```bash
cd client
npm install

# Start Vite development server
npm run dev
# App runs on http://localhost:5173
```

Build for production:
```bash
npm run build
```

---

## ⚙️ Environment Variables Configuration

### Backend (`server/.env`)

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Backend port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` or `mongodb://127.0.0.1:27017/placement_portal` |
| `JWT_SECRET` | Secret key for signing admin JWT tokens | `your_secure_jwt_secret` |
| `CLIENT_ORIGIN` | Allowed CORS origin for frontend | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | `production` or `development` |
| `JUDGE0_API_URL` | Primary Judge0 CE execution endpoint | `https://ce.judge0.com` or RapidAPI URL |
| `JUDGE0_API_KEY` | Judge0 or RapidAPI key (kept server-side) | `your_judge0_api_key` |
| `JUDGE0_FALLBACK_URL` | Optional secondary execution provider | `https://judge0-ce.p.rapidapi.com` |
| `JUDGE0_FALLBACK_KEY` | Optional secondary provider key | `your_fallback_api_key` |

> 🔒 **Security Guarantee**: Execution API keys and database credentials are strictly server-side and never exposed to the client bundle.

---

## 🌐 Production Deployment Guide

### Deploy Backend to Render (Free Web Service)
1. Link your GitHub repository in [Render Dashboard](https://dashboard.render.com).
2. Choose **Web Service** with runtime `Node`.
3. Set **Root Directory** to `server`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add Environment Variables in Render Settings:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: Random 32+ character string.
   - `CLIENT_ORIGIN`: Your production Vercel frontend URL (e.g., `https://gecrplacement.vercel.app`).
   - `JUDGE0_API_URL` & `JUDGE0_API_KEY`: External execution provider credentials.

### Deploy Frontend to Vercel (Free Frontend Hosting)
1. Import the repository in [Vercel Dashboard](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variable:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://gecrplacement-api.onrender.com/api`).

---

## 📈 Optimization Roadmap & Next Steps for Higher Performance

If you want to optimize the platform even further, here are high-impact, free optimizations to implement:

1. **Cloudflare CDN Edge Caching (₹0)**:
   - Route your custom domain through Cloudflare Free Tier.
   - Set Cache Rules for static routes: cache `/api/coding-questions/meta` for 10 minutes at the edge. This reduces Render backend requests by up to 80%.

2. **PWA / Service Worker Offline Problem Caching (₹0)**:
   - Enable `vite-plugin-pwa` so questions, statements, and schemas are cached locally on students' laptops or phones.
   - Students will be able to read and solve problems even during spotty campus Wi-Fi.

3. **Monaco / CodeMirror Extension (Optional)**:
   - The current custom editor has zero overhead (0 KB dependencies) and provides line numbers, auto-indent, tab indentation, and keybindings. If students request autocomplete or minimap, `@uiw/react-codemirror` can be added via dynamic `React.lazy()` import to avoid affecting initial page load.

4. **Expand Question Bank Seeding**:
   - The seeder script (`server/scripts/seed-coding-questions.js`) supports incremental upserts. You can append new question objects or parse campus placement questionnaires directly into the array and run `npm run seed-coding` without risking existing data.

5. **Render Spin-Up Warmer (Cron)**:
   - Free Render services spin down after 15 minutes of inactivity. You can set up a free uptime monitor (e.g., Cron-Job.org or UptimeRobot) to ping `/api/health` every 14 minutes, keeping the server instantly responsive for students.

---

## 🛡️ License & Attributions

Developed for the students of **Government Engineering College, Rajkot (GECR)**.  
All placement experiences and company information are contributed by students and alumni for educational and placement preparation purposes.

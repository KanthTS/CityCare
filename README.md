# CityCare


AI-powered civic issue management platform. Citizens report problems (potholes, water
leakage, streetlights, garbage, drainage, fallen trees, etc.) with a photo and GPS
location; a rule-based AI engine classifies the issue, estimates severity, recommends a
department, and offers safe self-fix guidance where appropriate. Reports that need
municipal attention flow through verification → assignment → resolution → citizen
verification, with duplicate detection, notifications, maps and admin analytics.

## Stack

- **Frontend:** React + Vite + Tailwind CSS v4 + React Router + Leaflet (OpenStreetMap) + Recharts
- **Backend:** Node.js + Express + Mongoose
- **Database:** MongoDB (local)
- **Auth:** JWT + bcrypt, role-based (citizen / worker / admin)
- **AI:** Deterministic rule-based classification engine (no external API key needed) — see `backend/src/utils/aiEngine.js`
- **Images:** Stored on local disk, served from `/uploads`

## Prerequisites

- Node.js 18+
- MongoDB running locally on `mongodb://127.0.0.1:27017`

## Setup

### 1. Backend

```bash
cd backend
npm install
npm run seed   # creates departments + default admin account
npm run dev    # starts API on http://localhost:5050
```

Default admin login: `admin@civicfix.gov` / `Admin@12345` (see `backend/.env`).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev    # starts app on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to the backend on port 5050.

## Notes

- Port 5000 is used by macOS AirPlay Receiver, so the backend runs on **5050** instead.
- The "AI" is a deterministic, self-contained rule engine (keyword + image-hash based) —
  no external API key required. Swap `backend/src/utils/aiEngine.js` for a real vision
  model call (e.g. Claude with an image) if you want true ML-based classification later.
- Dangerous issue categories (electrical infrastructure, structural damage, stray
  animals, etc.) never offer self-fix guidance — they always route to the municipal
  authority.

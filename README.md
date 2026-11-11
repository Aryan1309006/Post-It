# Post-It

Post-It is split into an Express/MongoDB backend and a React frontend styled with Tailwind CSS.

## Requirements

- Node.js 20.19+ or 22.12+
- MongoDB

## Setup

Install the workspace dependencies from the repository root:

```bash
npm install
```

Create `backend/.env` with:

```env
MONGO_URL=your-mongodb-connection-string
JWT_SECRET=your-secret
PORT=3000
```

Run the backend and frontend in separate terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

Open the frontend URL printed by Vite (normally `http://localhost:5173`). Its development server proxies API requests and uploaded images to the backend.

To run only the backend:

```bash
npm start
```

Backend code, models, views, uploads, and environment configuration are in `backend/`; React source and Vite configuration are in `frontend/`. The root `package.json` manages both workspaces.

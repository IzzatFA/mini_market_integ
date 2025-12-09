# Mini Market App (Yuk Belanja!)

A full-stack e-commerce application built with React (Frontend) and Express/Node.js (Backend).

## Prerequisites

- Node.js installed
- Supabase account and project

## Installation

1.  **Clone the repository**
2.  **Install dependencies**

    ```bash
    # Backend
    cd backend
    npm install

    # Frontend
    cd ../frontend
    npm install
    ```

## Configuration

1.  **Backend**
    - Copy `.env.example` to `.env` in the `backend` folder.
    - Fill in your `SUPABASE_URL` and `SUPABASE_KEY`.
    - Set `PORT=3000` (or your preferred port).

2.  **Frontend**
    - Copy `.env.example` to `.env` in the `frontend` folder (if you have environment variables).

## Running the App

### Backend

```bash
cd backend
npm run dev
# or for production
npm start
```

### Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` (default Vite port).
The backend API usage can be viewed at `http://localhost:3000/api-docs` (Swagger UI).

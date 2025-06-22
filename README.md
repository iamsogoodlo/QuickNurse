
# QuickNurse: On-Demand Nursing Care

This project is a platform connecting patients with registered nurses for on-demand healthcare services. It includes a frontend built with React, Vite, and TypeScript, and a backend API built with Node.js, Express, and MongoDB.

## Project Structure

It's recommended to have the frontend and backend in separate sibling directories:

```
QuickNurse_Main_Directory/
├── quicknurse-frontend/  (Contains Vite config, index.html, src/, package.json for frontend)
└── quicknurse-api/       (Contains server.js, models/, routes/, package.json for backend)
```

## Recent Enhancements

The platform now supports real-time nurse location tracking, photo-based document
verification, and fixed pricing with distance and time surcharges. Nurses can
view monthly revenue, jobs taken, and ratings directly on their dashboard.

### Database Collections
The backend now defines four main MongoDB collections:
* **Nurses** – registered caregivers and their availability
* **Patients** – user profiles and medical details
* **OrdersReceived** – incoming service requests awaiting fulfillment
* **OrdersFulfilled** – records of completed or cancelled visits

## Prerequisites

*   Node.js (v18 or later recommended) and npm
*   MongoDB Atlas account (or a local MongoDB instance)

## Backend Setup (`quicknurse-api`)

1.  **Navigate to the Backend Directory:**
    Open a terminal and change to your backend project folder:
    ```bash
    cd path/to/your/quicknurse-api
    ```

2.  **Create `.env` File:**
    A sample environment file is included as `quicknurse-api/.env.example`.
    Copy it and replace the placeholders with your actual credentials:
    ```bash
    cp quicknurse-api/.env.example quicknurse-api/.env
    ```
    Edit `.env` so it contains something like:
    ```env
    MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/quicknurse?retryWrites=true&w=majority
    JWT_SECRET=YOUR_VERY_STRONG_JWT_SECRET_KEY_GOES_HERE
    PORT=5001
    NODE_ENV=development
    ```
    *   Ensure your MongoDB Atlas IP whitelist allows connections from your IP address.
    *   The `quicknurse` database will be created if it doesn't exist.

3.  **Install Dependencies:**
    ```bash
    npm install
    ```

4.  **Run the Backend Development Server:**
    ```bash
    npm run dev
    ```
    The API server should start, typically on `http://localhost:5001`. Look for console messages indicating a successful database connection and server startup. Keep this terminal window open.

## Frontend Setup (`quicknurse-frontend` or your frontend root)

Your frontend is built using Vite.

1.  **Navigate to the Frontend Directory:**
    Open a **new, separate terminal window** and change to your frontend project folder (the one containing `vite.config.ts`, `index.html`, and the frontend `package.json`):
    ```bash
    cd path/to/your/quicknurse-frontend
    ```

2.  **Install Dependencies:**
    This step is crucial for making the `vite` command available.
    ```bash
    npm install
    ```

3.  **Configure API Base URL (if not already done):**
    A sample `.env.example` is provided in the project root. Copy it then edit if your API is not running on `http://localhost:5001`:
    ```bash
    cp .env.example .env
    # then edit .env and set VITE_API_BASE_URL="https://your-api.example.com/api"
    ```
    If no `.env` file is provided, the app falls back to `http://localhost:5001/api` for local development.

4.  **Run the Frontend Development Server:**
    ```bash
    npm run dev
    ```
    The Vite development server will start, typically on `http://localhost:5173` (or the next available port). Open this URL in your web browser.

## Using the Application

*   Ensure both the backend API server and the frontend Vite development server are running.
*   Access the frontend URL (e.g., `http://localhost:5173`) in your browser.
*   You should be able to register, log in, and use the application features.

## Troubleshooting

*   **`sh: vite: command not found` (Frontend):** Make sure you have run `npm install` in your frontend project directory.
*   **`Error: Cannot find module './db/connection'` (Backend):** Ensure the file `quicknurse-api/db/connection.js` exists and is correctly placed. Also, check that `server.js` is trying to import it correctly.
*   **"Failed to fetch" errors in browser:**
    *   Verify your backend API server is running (check its terminal window).
    *   Check for CORS errors in the browser's developer console (though `app.use(cors())` in the backend should handle this for local development).
    *   Ensure `API_BASE_URL` in the frontend `constants.ts` is correct.
*   **Database Connection Errors (Backend):**
    *   Double-check your `MONGODB_URI` in the backend `.env` file.
    *   Verify your internet connection.
    *   Ensure your IP is whitelisted in MongoDB Atlas.
    *   If `npm install` fails with ETARGET errors for multer, ensure your `api/package.json` uses `multer` version `^1.4.5-lts.2`.

This README should help you and others get the project running smoothly.

## Nurse Dashboard Prototype
A prototype HTML dashboard is available in `nurse-dashboard.html` with placeholders for real-time features.

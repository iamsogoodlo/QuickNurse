
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

5.  **Seed the Database with Test Accounts (Run Once):**
    Populate MongoDB with sample nurses and patients so you can log in immediately. You can run the seed command from the project root (it forwards to the API folder) **or** from inside `quicknurse-api`:
    ```bash
    npm run seed            # from the project root
    # or
    cd quicknurse-api && npm run seed
    ```
    The script prints each email/password combination. Use these credentials when testing logins.

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

4.  **Provide a Google Maps API Key:**
    The map feature now loads Google Maps. Add your key to `.env`:
    ```bash
    echo "VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE" >> .env
    ```

5.  **Run the Frontend Development Server:**
    ```bash
    npm run dev
    ```
    The Vite development server will start, typically on `http://localhost:5173` (or the next available port). Open this URL in your web browser.

## Combined Development Mode

After the initial setup you can run both the backend and frontend together from the repository root:

```bash
npm run dev:all
```

This uses `concurrently` to start the API server in `api/` and the Vite dev server so you can develop in one terminal window.

## Using the Application

*   Ensure both the backend API server and the frontend Vite development server are running.
*   Access the frontend URL (e.g., `http://localhost:5173`) in your browser.
*   You should be able to register, log in, and use the application features.

## Troubleshooting

*   **`sh: vite: command not found` (Frontend):** Make sure you have run `npm install` in your frontend project directory.
*   **Blank screen after pulling updates:** New dependencies may have been added. Run `npm install` again in the frontend folder to ensure all packages are installed. This is often required if the patient dashboard page appears completely blank after a pull.
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
*   **"Invalid credentials" when logging in:** Make sure the seed script completed successfully. It hashes passwords before saving, so if you inserted your own data manually, the passwords may not be hashed. Re-run `npm run seed` in the `api` directory and try again.

This README should help you and others get the project running smoothly.

## Nurse Dashboard Prototype
A prototype HTML dashboard is available in `nurse-dashboard.html` with placeholders for real-time features.

## Mock Testing Setup

For development without a real backend, a mock database is included in the `mock` directory. It defines clusters of nurses and patients around New York City. Use the **Test Mode** button on the authentication page to quickly log in as any test user. The mock API found in `mock/mockApi.ts` simulates fetching nearby nurses and creating orders.

## Database Test Seed

You can populate your MongoDB instance with a few predefined nurses and patients. Run the following from the `api` directory:

```bash
npm run seed
```

The script prints the credentials for each account. Default logins are:

**Nurses**
- `nurse1@example.com` / `nursepass`
- `nurse2@example.com` / `nursepass`
- `nurse3@example.com` / `nursepass`

**Patients**
- `patient1@example.com` / `patientpass`
- `patient2@example.com` / `patientpass`

All accounts share a fixed location near Times Square in New York City so you can reliably test nearby search and booking features.

## Example End-to-End Demo

   curl -X POST http://localhost:5001/api/auth/patient/login \
     -H 'Content-Type: application/json' \
     -d '{"email":"patient1@example.com","password":"patientpass"}'
   ```

   Copy the `token` and `patient.patient_id` values from the JSON response.

   ```bash
   curl -X POST http://localhost:5001/api/orders \
     -H 'Content-Type: application/json' \
     -H "Authorization: Bearer PATIENT_TOKEN" \

   ```bash
   curl -X POST http://localhost:5001/api/auth/nurse/login \
     -H 'Content-Type: application/json' \
     -d '{"email":"nurse1@example.com","password":"nursepass"}'
   ```

   ```bash
   curl -X PUT http://localhost:5001/api/orders/demo_order1/accept \
     -H 'Content-Type: application/json' \
     -H "Authorization: Bearer NURSE_TOKEN" \
     -d '{"nurseId":"NURSE_ID"}'
   ```


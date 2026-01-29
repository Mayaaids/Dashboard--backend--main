# TALOS Backend & Dashboard

Backend for TALOS Live Registrations, with [Google Sheets](https://docs.google.com/spreadsheets/d/1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk/edit?usp=sharing) integration and a live dashboard.

**Integration:** Frontend (dashboard + register form) + Backend (API) + Google Sheet all work together. One server serves both UI and API.

## Quick start

**From project root:** Double-click **`START_SYSTEM.bat`** (in `Dashboard--backend--main`).  
It starts the backend (which serves the frontend), installs deps if needed, and opens the dashboard.

**From this folder:**

1. **First time:** Double-click **`INSTALL_AND_START.bat`**  
   - Installs dependencies and starts the server.  
   - If install fails, run in a terminal:  
     `npm config set offline false` → `npm install --legacy-peer-deps` → `npm start`

2. **Next times:** Double-click **`RUN_AND_OPEN_DASHBOARD.bat`**  
   - Starts the server and opens the dashboard in your browser.

3. **Dashboard:** [http://localhost:5000](http://localhost:5000) · **Register form:** [http://localhost:5000/register](http://localhost:5000/register)  
   - Dashboard refreshes every 10 seconds from the Google Sheet.

## Google Sheets (live data)

- See **`GOOGLE_SHEETS_SETUP.md`** for Service Account setup.  
- Add `GS_CLIENT_EMAIL` and `GS_PRIVATE_KEY` to `.env` (from `.env.example`).  
- Share the [TALOS Live Registrations](https://docs.google.com/spreadsheets/d/1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk/edit?usp=sharing) sheet with the service account email (Editor).

Without Sheets config, the app still runs and uses mock data.

## Scripts

| File | Purpose |
|------|---------|
| `../START_SYSTEM.bat` | **Start everything** (from project root): backend + open dashboard |
| `INSTALL_AND_START.bat` | Install deps + start server (first run) |
| `RUN_AND_OPEN_DASHBOARD.bat` | Start server + open dashboard |
| `OPEN_DASHBOARD.bat` | Open http://localhost:5000 only |

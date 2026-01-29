# TALOS Registration System - Status & Troubleshooting Guide

## Current System Status

### ✅ What's Already Configured

1. **Backend Server** (Port 5000)
   - Express.js server ready to run
   - Static file serving for frontend
   - API endpoints for registration and stats
   - MongoDB support (optional)

2. **Frontend Dashboard**
   - Live registration counter
   - Event distribution charts
   - Recent registrations ticker
   - Real-time refresh (10 seconds)
   - Responsive design

3. **Registration Form**
   - HTML form at `/register`
   - Fields: Name, Email, Team, Event, College
   - Auto-saves to backend and Google Sheets

4. **Google Sheets Integration**
   - Automatic header creation
   - Real-time data sync
   - Service account authentication
   - Error handling with fallbacks

### ⚙️ Configuration Checklist

#### Backend Configuration (.env)
```
✓ SHEET_ID: 1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk
? GS_CLIENT_EMAIL: [needs Google Service Account]
? GS_PRIVATE_KEY: [needs Google Service Account]
? MONGO_URI: [optional - defaults to demo mode]
```

#### Frontend Configuration (public/config.js)
```
✓ BACKEND_URL: Uses window.location.origin (auto-detected)
✓ SPREADSHEET_ID: Correctly set to 1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk
✓ REFRESH_INTERVAL: 10000ms (10 seconds)
✓ Column mapping: Matches Sheet structure
```

---

## Quick Start Commands

### 1. Navigate to Backend Directory
```bash
cd c:\Users\MAYA\Downloads\Dashboard--backend--main\Dashboard--backend--main\symposium-backend
```

### 2. Verify Integration
```bash
VERIFY_INTEGRATION.bat
```

### 3. Start System
```bash
START_INTEGRATION.bat
```

### 4. Open in Browser
```
http://localhost:5000 (Dashboard)
http://localhost:5000/register (Registration Form)
```

---

## Testing the Connection

### Test 1: Is Backend Running?
```bash
# PowerShell
$response = Invoke-WebRequest -Uri "http://localhost:5000" -ErrorAction SilentlyContinue
if ($response.StatusCode -eq 200) { Write-Host "✅ Backend is running" }
```

### Test 2: Can Frontend Reach Backend?
```bash
# PowerShell
$stats = Invoke-WebRequest -Uri "http://localhost:5000/api/register/stats" -ErrorAction SilentlyContinue | ConvertFrom-Json
Write-Host "Total registrations: $($stats.total)"
```

### Test 3: Submit Test Registration
```bash
curl -X POST http://localhost:5000/api/register `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "team": "Test Team",
    "event": "Test Event",
    "college": "Test College"
  }'
```

### Test 4: Check Google Sheets Data
```bash
curl http://localhost:5000/api/register/excel
```

---

## Troubleshooting

### ❌ "Cannot connect to localhost:5000"

**Solutions:**
1. Verify Node.js is installed: `node --version`
2. Check port 5000 is available:
   ```bash
   netstat -ano | findstr :5000
   ```
   If something is using port 5000, either close it or use:
   ```bash
   $env:PORT=3000; npm start
   ```

3. Verify server is actually running:
   ```bash
   npm start
   ```
   Should show: `🚀 Server running on port 5000`

### ❌ "Google Sheets not syncing"

**Check Credentials:**
1. Verify `.env` has GS_PRIVATE_KEY:
   ```bash
   findstr "GS_PRIVATE_KEY" .env
   ```

2. Verify GS_CLIENT_EMAIL is set:
   ```bash
   findstr "GS_CLIENT_EMAIL" .env
   ```

3. Check sheet sharing:
   - Open your Google Sheet
   - Click Share
   - Add the service account email (from `.env`)
   - Give "Editor" access

4. Verify SHEET_ID is correct:
   - The sheet URL format: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

### ❌ "Dashboard shows 'Disconnected'"

**Solutions:**
1. Check browser console for errors: `F12` → Console tab
2. Verify backend is running: `http://localhost:5000`
3. Check for CORS issues:
   - Backend has `cors()` middleware enabled
   - Check if firewall is blocking port 5000

4. Try manual refresh: `Ctrl+F5`

### ❌ "Form submission fails silently"

**Solutions:**
1. Check browser console errors: `F12`
2. Verify backend is accepting POST requests:
   ```bash
   curl -X POST http://localhost:5000/api/register -H "Content-Type: application/json" -d '{"name":"test"}'
   ```

3. Check if data is in Google Sheets anyway (sheet sync may work even if UI shows error)

### ❌ "MongoDB connection fails"

**This is OK!** The system has a fallback:
- Logs show: `⚠️ MongoDB connection failed. Running in DEMO mode with mock data.`
- The app still works with in-memory mock data
- Real data goes to Google Sheets

To use MongoDB:
1. Install MongoDB locally or use Atlas
2. Update MONGO_URI in `.env`
3. Restart server

### ❌ "Missing dependencies"

**Solution:**
```bash
npm install
```

This installs:
- express (web server)
- mongoose (MongoDB)
- googleapis (Google Sheets API)
- cors (cross-origin requests)
- dotenv (environment variables)

---

## Real-Time Data Flow Verification

### Scenario: Submit a registration and verify it appears everywhere

1. **Step 1:** Open Dashboard
   ```
   http://localhost:5000
   ```
   Note the current participant count.

2. **Step 2:** Open Registration Form
   ```
   http://localhost:5000/register
   ```

3. **Step 3:** Submit a test registration
   ```
   Name: Test User
   Email: test@user.com
   Team: Test Team
   Event: Test Event
   College: Test College
   ```

4. **Step 4:** Check results

   **Backend Console:**
   ```
   ✅ Registration saved to MongoDB (if available)
   ✅ Data added to Google Sheets
   ```

   **Dashboard (auto-refresh in 10 seconds):**
   - Participant count increments
   - New entry in "Recent Registrations"

   **Google Sheet:**
   - New row appears with data
   - Timestamp auto-generated

5. **Step 5:** Verify API
   ```bash
   curl http://localhost:5000/api/register/stats
   curl http://localhost:5000/api/register/excel
   ```

---

## System Architecture Verification

```
User Browser                Backend (Node.js)           Google Sheets
     │                            │                          │
     ├─────GET /──────────────────→                          │
     │                            ├─────READ DATA────────────→
     │←────────HTML+JS────────────┤                          │
     │                            │←───────SHEET DATA────────┤
     │                            │                          │
     ├──POST /api/register────────→                          │
     │                            ├─────SAVE TO DB───────────→
     │                            ├─────APPEND TO SHEET──────→
     │←────JSON Response──────────┤                          │
     │                            │←───────CONFIRM───────────┤
     │                            │                          │
  (10 sec)                        │                          │
     ├─────GET /api/register/stats→                          │
     │                            ├─────QUERY MONGO──────────→
     │                            ├─────GET SHEET DATA───────→
     │←────JSON with stats────────┤                          │
     │                            │←───────SHEET DATA────────┤
```

---

## Performance Optimization Tips

1. **Reduce Refresh Rate** (if CPU usage high)
   - Edit `public/config.js`
   - Change `REFRESH_INTERVAL: 10000` to `30000` (30 seconds)

2. **Enable MongoDB**
   - Faster queries than Google Sheets
   - Set MONGO_URI in `.env`
   - Remove the fallback query to Google Sheets for better performance

3. **Limit Dashboard Records**
   - Edit `routes/register.js`
   - Add `{ $limit: 100 }` to queries

---

## Common Port Issues

### Check what's using port 5000
```bash
netstat -ano | findstr :5000
```

### Kill process using port 5000
```bash
# Get the PID from netstat
taskkill /PID {PID} /F

# Or change port
$env:PORT=3000; npm start
```

---

## Environment Variables Reference

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `SHEET_ID` | Google Sheet ID | Yes | `1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk` |
| `GS_CLIENT_EMAIL` | Service Account Email | Yes | `service@project.iam.gserviceaccount.com` |
| `GS_PRIVATE_KEY` | Service Account Key | Yes | `-----BEGIN PRIVATE KEY-----...` |
| `MONGO_URI` | MongoDB Connection | No | `mongodb://localhost:27017/symposium` |
| `PORT` | Server Port | No | `5000` (default) |

---

## Success Checklist

- [ ] Backend server starts without errors
- [ ] Dashboard loads at http://localhost:5000
- [ ] Registration form appears at http://localhost:5000/register
- [ ] Can submit registrations successfully
- [ ] Registrations appear in Google Sheets within 10 seconds
- [ ] Dashboard updates with new data every 10 seconds
- [ ] Charts and statistics display correctly
- [ ] Recent registrations ticker shows new entries
- [ ] No console errors in browser DevTools (F12)
- [ ] API endpoints respond correctly

---

## Next Steps

1. ✅ Verify integration: `VERIFY_INTEGRATION.bat`
2. ✅ Start system: `START_INTEGRATION.bat`
3. ✅ Test registration flow (see "Real-Time Data Flow Verification" above)
4. ✅ Deploy to production when ready

---

**Support Links:**
- Google Sheets API: https://developers.google.com/sheets/api
- Node.js: https://nodejs.org/
- Express.js: https://expressjs.com/
- MongoDB: https://www.mongodb.com/

---

*Last Updated: January 29, 2026*

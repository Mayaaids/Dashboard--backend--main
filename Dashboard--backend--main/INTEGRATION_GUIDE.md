# Frontend-Backend-Google Sheets Integration Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Dashboard: public/index.html + dashboard.js            │    │
│  │  Registration: public/register.html                      │    │
│  └─────────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP Requests (CORS enabled)
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Express Server: server.js (Port 5000)                  │    │
│  │  Routes: routes/register.js                             │    │
│  │  Database: MongoDB (optional, has fallback)             │    │
│  │  Google Sheets: googleSheet.js (live sync)              │    │
│  └─────────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────────┘
                         │ Google Sheets API
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│              GOOGLE SHEETS (Live Data)                          │
│  Sheet ID: 1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk      │
│  Columns: Name, Email, Team, Event, College, Timestamp         │
└─────────────────────────────────────────────────────────────────┘
```

## Setup Steps

### 1. Backend Setup

#### Step 1.1: Install Dependencies
```bash
cd c:\Users\MAYA\Downloads\Dashboard--backend--main\Dashboard--backend--main\symposium-backend
npm install
```

#### Step 1.2: Configure Environment (.env file)

Your `.env` file already exists at `symposium-backend/.env`:

```dotenv
SHEET_ID=1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk
GS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
MONGO_URI=mongodb://localhost:27017/symposium
```

**⚠️ IMPORTANT**: Get Google Service Account credentials:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a Service Account
3. Download the private key as JSON
4. Extract `private_key` and `client_email` from the JSON
5. Update `.env` with these values

#### Step 1.3: Start Backend Server
```bash
npm start
# Server runs on http://localhost:5000
```

### 2. Frontend Configuration

The frontend is already configured to connect to the backend. The main config file is:

**File:** `symposium-backend/public/config.js`

```javascript
const CONFIG = {
    BACKEND_URL: 'http://localhost:5000',
    SPREADSHEET_ID: '1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk',
    REFRESH_INTERVAL: 5000
};
```

### 3. Data Flow

#### Registration Flow (New Participant)
```
User fills register form at http://localhost:5000/register
    ↓
POST /api/register sends data to backend
    ↓
Backend saves to:
  - MongoDB (if available)
  - Google Sheets (via googleSheet.js)
    ↓
Success response returned to frontend
    ↓
User sees confirmation
```

#### Dashboard Data Flow (Live Updates)
```
Dashboard auto-refreshes every 5 seconds
    ↓
Fetches from /api/register/excel (Google Sheets data)
    ↓
Falls back to /api/register/stats (MongoDB data)
    ↓
Displays statistics and recent registrations
```

### 4. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Dashboard homepage |
| `/register` | GET | Registration form page |
| `/api/register` | POST | Submit new registration |
| `/api/register/stats` | GET | Get aggregated statistics |
| `/api/register/excel` | GET | Get all registration data from Google Sheets |

### 5. Testing the Integration

#### Test 1: Backend Server Status
```bash
curl http://localhost:5000
# Should return the dashboard HTML
```

#### Test 2: Registration Submission
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"team\":\"Test Team\",\"event\":\"Test Event\",\"college\":\"Test College\"}"
```

#### Test 3: Get Statistics
```bash
curl http://localhost:5000/api/register/stats
```

#### Test 4: Get All Data
```bash
curl http://localhost:5000/api/register/excel
```

### 6. Google Sheets Integration

#### Features:
- ✅ Auto-creates header row on first registration
- ✅ Appends new registrations in real-time
- ✅ Dashboard fetches latest data from Google Sheets
- ✅ Handles offline mode (falls back to mock data)

#### To Grant Google Sheets Access:
1. Share your Google Sheet with the service account email
2. Copy the service account email from `.env` (GS_CLIENT_EMAIL)
3. Open your Google Sheet
4. Click "Share" → Add the service account email
5. Give it "Editor" access

### 7. Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check if port 5000 is available: `netstat -ano \| findstr :5000` |
| Google Sheets not syncing | Verify credentials in `.env` and sheet sharing permissions |
| Dashboard shows "Disconnected" | Check browser console for CORS errors |
| MongoDB connection fails | Set MONGO_URI or let it run in demo mode |
| Frontend returns 404 | Ensure server is running: `http://localhost:5000` |

### 8. File Structure

```
symposium-backend/
├── server.js                 # Main Express server
├── googleSheet.js            # Google Sheets integration
├── package.json              # Dependencies
├── .env                       # Configuration (KEEP SAFE!)
├── routes/
│   └── register.js           # Registration API endpoints
├── models/
│   └── Registration.js       # MongoDB schema
└── public/
    ├── index.html            # Dashboard page
    ├── register.html         # Registration form
    ├── dashboard.js          # Dashboard logic (500 lines)
    ├── config.js             # Frontend config
    └── styles.css            # Styling
```

### 9. Start All Services

#### Option A: Using batch script
```bash
cd c:\Users\MAYA\Downloads\Dashboard--backend--main\Dashboard--backend--main\symposium-backend
RUN_AND_OPEN_DASHBOARD.bat
```

#### Option B: Manual Start
```bash
# Terminal 1 - Start backend
cd c:\Users\MAYA\Downloads\Dashboard--backend--main\Dashboard--backend--main\symposium-backend
npm start

# Terminal 2 - Open browser
start http://localhost:5000
```

## Key Technologies

- **Frontend**: HTML5, CSS3, Vanilla JavaScript, Chart.js
- **Backend**: Node.js, Express.js, Mongoose (MongoDB)
- **Database**: MongoDB (optional) + Google Sheets (required)
- **Authentication**: Google Service Account (for Sheets API)
- **Real-time Updates**: Server-side data refresh (polling every 5 seconds)

## Success Indicators

✅ Backend server starts without errors
✅ Dashboard loads at http://localhost:5000
✅ Registration form works at http://localhost:5000/register
✅ New registrations appear in Google Sheet within seconds
✅ Dashboard updates with live data every 5 seconds
✅ Statistics and charts display correctly

---

**Last Updated**: January 29, 2026

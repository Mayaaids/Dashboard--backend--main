# TALOS Registration System - Quick Integration Summary

## 🎯 What You Have

A fully integrated system connecting:
- **Frontend**: Dashboard + Registration Form (HTML/CSS/JavaScript)
- **Backend**: Node.js/Express server with API
- **Database**: Google Sheets (live sync) + MongoDB (optional)
- **Real-time**: 10-second refresh rate for live updates

---

## 🚀 Getting Started in 3 Steps

### Step 1: Navigate to Backend
```bash
cd c:\Users\MAYA\Downloads\Dashboard--backend--main\Dashboard--backend--main\symposium-backend
```

### Step 2: Verify Installation
```bash
VERIFY_INTEGRATION.bat
```

### Step 3: Start System
```bash
START_INTEGRATION.bat
```

**That's it!** The system is now running at `http://localhost:5000`

---

## 📍 Quick Links

| Function | URL |
|----------|-----|
| Dashboard | http://localhost:5000 |
| Registration | http://localhost:5000/register |
| API Stats | http://localhost:5000/api/register/stats |
| API Data | http://localhost:5000/api/register/excel |

---

## ✅ System Status

### All Connected!

```
┌─────────────────────────────────────────┐
│  Frontend (Dashboard + Form)  ✓          │
│  ↓ (HTTP)                               │
│  Backend (Express Server)     ✓          │
│  ↓ (Google API)                         │
│  Google Sheets (Live Data)    ✓          │
└─────────────────────────────────────────┘
```

### Data Flow
```
1. User fills form at /register
   ↓
2. Data sent to backend POST /api/register
   ↓
3. Backend saves to Google Sheets + MongoDB
   ↓
4. Dashboard fetches updated data every 10 sec
   ↓
5. Live counter & charts update automatically
```

---

## 🔧 Configuration

### .env (Backend Configuration)
```dotenv
SHEET_ID=1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk
GS_CLIENT_EMAIL=your-service@project.iam.gserviceaccount.com
GS_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
MONGO_URI=mongodb://localhost:27017/symposium (optional)
```

**Get Google Credentials:**
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create a Service Account
3. Download the JSON key
4. Copy the `private_key` and `client_email` to `.env`
5. Share your Google Sheet with the service account email

### config.js (Frontend Configuration)
```javascript
const CONFIG = {
    BACKEND_URL: 'http://localhost:5000',
    SPREADSHEET_ID: '1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk',
    REFRESH_INTERVAL: 10000
};
```

---

## 📊 Key Endpoints

### 1. Submit Registration
```bash
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "team": "Team A",
  "event": "Hackathon",
  "college": "MIT"
}
```

### 2. Get Statistics
```bash
GET /api/register/stats

Response:
{
  "total": 45,
  "teamWise": [
    { "_id": "Team A", "count": 12 },
    { "_id": "Team B", "count": 15 }
  ]
}
```

### 3. Get All Data
```bash
GET /api/register/excel

Response: [
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "team": "Team A",
    "event": "Hackathon",
    "college": "MIT",
    "timestamp": "1/29/2026 2:30 PM"
  },
  ...
]
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5000 already in use | `netstat -ano \| findstr :5000` then close the app |
| Cannot connect to backend | Verify `npm start` is running |
| Google Sheets not updating | Check credentials in `.env` and sheet sharing |
| Dashboard shows "Disconnected" | Check browser console (F12) and firewall |
| npm dependencies missing | Run `npm install` |

See **STATUS_AND_TROUBLESHOOTING.md** for detailed solutions.

---

## 📚 Documentation Files

1. **INTEGRATION_GUIDE.md** - Full setup and architecture
2. **STATUS_AND_TROUBLESHOOTING.md** - Detailed troubleshooting
3. **API_DOCUMENTATION.md** - Complete API reference
4. **VERIFY_INTEGRATION.bat** - Automated setup checker
5. **START_INTEGRATION.bat** - One-command startup

---

## 🎮 Testing the Connection

### Test 1: Is Backend Running?
```bash
curl http://localhost:5000
```

### Test 2: Submit a Registration
```bash
curl -X POST http://localhost:5000/api/register `
  -H "Content-Type: application/json" `
  -d '{"name":"Test","email":"test@test.com","team":"Test","event":"Test","college":"Test"}'
```

### Test 3: Check Dashboard
1. Open http://localhost:5000 in browser
2. Open Developer Tools (F12)
3. Check Console tab for any errors
4. Participant count should update

### Test 4: Verify Google Sheets
```bash
curl http://localhost:5000/api/register/excel
```

---

## 🏗️ Project Structure

```
symposium-backend/
├── server.js                   # Main Express server
├── googleSheet.js              # Google Sheets integration
├── package.json                # Dependencies
├── .env                         # Configuration (keep safe!)
│
├── routes/
│   └── register.js             # Registration API
│
├── models/
│   └── Registration.js         # MongoDB model
│
├── public/
│   ├── index.html              # Dashboard page
│   ├── register.html           # Registration form
│   ├── dashboard.js            # Dashboard logic (500 lines)
│   ├── config.js               # Frontend config
│   └── styles.css              # Styling
│
├── VERIFY_INTEGRATION.bat      # Auto-verification script
├── START_INTEGRATION.bat       # One-command startup
│
└── node_modules/               # Installed dependencies
```

---

## 🔑 Key Technologies

- **Frontend:** HTML5, CSS3, Vanilla JavaScript, Chart.js
- **Backend:** Node.js, Express.js 5.2.1
- **Database:** Google Sheets API, MongoDB 9.1.5 (optional)
- **Authentication:** Google Service Account (OAuth 2.0)
- **Real-time:** Server-side polling (10-second refresh)

---

## ✨ Features

✅ Live registration counter
✅ Event-wise distribution charts
✅ Recent registrations ticker
✅ Real-time dashboard updates
✅ Google Sheets auto-sync
✅ MongoDB fallback support
✅ Responsive design (mobile-friendly)
✅ CORS enabled for API
✅ Error handling with graceful fallbacks
✅ Demo mode when databases unavailable

---

## 📈 Next Steps

1. **Start System**
   ```bash
   START_INTEGRATION.bat
   ```

2. **Open Dashboard**
   ```
   http://localhost:5000
   ```

3. **Test Registration**
   - Go to http://localhost:5000/register
   - Fill the form and submit
   - Watch dashboard update in real-time

4. **Verify Google Sheets**
   - Check your Google Sheet
   - New rows should appear automatically

5. **Deploy to Production**
   - Update BACKEND_URL to production domain
   - Configure MongoDB for persistent storage
   - Set up Google Service Account credentials
   - Enable HTTPS

---

## 🆘 Need Help?

1. **For setup issues:** See INTEGRATION_GUIDE.md
2. **For troubleshooting:** See STATUS_AND_TROUBLESHOOTING.md
3. **For API usage:** See API_DOCUMENTATION.md
4. **For quick tests:** Use the curl commands above
5. **For logs:** Check terminal running `npm start`
6. **For browser errors:** Press F12 and check Console tab

---

## 📞 System Info

- **Backend Port:** 5000
- **Frontend Type:** Single Page Application (SPA)
- **Database:** Google Sheets (primary) + MongoDB (optional)
- **API Type:** REST (JSON)
- **CORS:** Enabled for all origins
- **Refresh Rate:** 10 seconds (configurable)
- **Demo Mode:** Auto-enabled when databases unavailable

---

## ✔️ Verification Checklist

- [ ] Node.js and npm installed
- [ ] Backend directory located
- [ ] Dependencies installed (npm install)
- [ ] .env configured with Google credentials
- [ ] Google Sheet shared with service account
- [ ] Backend server starts (npm start)
- [ ] Dashboard loads (http://localhost:5000)
- [ ] Registration form works
- [ ] Data syncs to Google Sheets
- [ ] API endpoints respond correctly

---

**Status:** ✅ READY TO USE

**Last Updated:** January 29, 2026

**System:** TALOS Registration Dashboard v1.0

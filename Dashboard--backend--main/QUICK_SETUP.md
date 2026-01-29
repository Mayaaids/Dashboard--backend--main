# 🚀 QUICK START - Get Running in 15 Minutes

## 3 Main Steps:

### 1️⃣ GET CREDENTIALS (5 min)
```
https://console.cloud.google.com
  ↓
Create Project → Enable Google Sheets API → Create Service Account
  ↓
Download JSON file with:
  • client_email
  • private_key
```

### 2️⃣ UPDATE CONFIG (2 min)
```
Edit: c:\...\symposium-backend\.env

Replace:
GS_CLIENT_EMAIL = your-email@project.iam.gserviceaccount.com
GS_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

Save ✅
```

### 3️⃣ START & OPEN (2 min)
```
Terminal:
cd c:\Users\MAYA\Downloads\Dashboard--backend--main\Dashboard--backend--main\symposium-backend
npm start

Browser:
http://localhost:5000

See your events! ✅
```

---

## 📋 One-Page Reference

| What | Where | What To Do |
|------|-------|-----------|
| **Get Credentials** | https://console.cloud.google.com | Create Service Account + Download JSON |
| **Update Config** | `symposium-backend\.env` | Paste client_email and private_key |
| **Share Sheet** | Google Sheet with service account email | Give Editor access |
| **Start Server** | Terminal: `npm start` | Wait for "✅ Google Sheets initialized" |
| **Open Dashboard** | Browser: http://localhost:5000 | See your events live! |
| **Test Form** | http://localhost:5000/register | Submit data → Check dashboard |

---

## ⚡ Terminal Commands (Copy & Paste)

```bash
# Step 1: Go to backend folder
cd c:\Users\MAYA\Downloads\Dashboard--backend--main\Dashboard--backend--main\symposium-backend

# Step 2: Start server
npm start

# Step 3: Open browser
http://localhost:5000
```

---

## 🎯 What You'll See

✅ **Dashboard at http://localhost:5000**
- Live participant counter
- Event cards (Crime Trace, Cyber Hunt, etc.)
- Charts with distribution
- Recent registrations ticker
- Updates every 10 seconds

✅ **Registration Form at http://localhost:5000/register**
- Simple form to add participants
- Data saves to Google Sheet instantly
- Counter on dashboard updates

---

## ✨ Data Flow

```
Your Google Sheet
    ↓ (Server reads)
Backend Fetches Data
    ↓ (Every 10 sec)
Dashboard Shows
    ↓
Events Display + Charts + Ticker
    ↓
Real-time Live System! ✅
```

---

## 📍 Key URLs

```
Dashboard:     http://localhost:5000
Register:      http://localhost:5000/register
API Stats:     http://localhost:5000/api/register/stats
API Data:      http://localhost:5000/api/register/excel
```

---

## 🔑 Important Files

```
.env                     ← Your credentials (keep safe!)
server.js               ← Backend server
public/index.html      ← Dashboard page
public/register.html   ← Registration form
googleSheet.js         ← Google Sheets connection
```

---

## ⚠️ Common Issues

| Issue | Fix |
|-------|-----|
| Port 5000 in use | Close other apps or use `set PORT=3000` |
| Google Sheets error | Verify .env credentials and sheet sharing |
| Dashboard empty | Wait 10 sec or check `curl http://localhost:5000/api/register/excel` |
| Form won't submit | Check browser console (F12) for errors |

---

## ✅ Success Indicators

✅ Terminal shows: "✅ Google Sheets initialized"
✅ Dashboard loads at http://localhost:5000
✅ Events display in cards
✅ Registrations appear in ticker
✅ Data syncs to Google Sheet

---

## 📚 Detailed Guides Available

- **VISUAL_SETUP_GUIDE.md** - Step-by-step with screenshots
- **SETUP_CHECKLIST.md** - Complete checklist to track progress
- **SETUP_EVERYTHING.md** - Detailed comprehensive guide
- **API_DOCUMENTATION.md** - How to use the APIs
- **QUICK_START.md** - Quick reference

---

**You're ready! Follow the 3 steps above and your dashboard will be live in 15 minutes! 🚀**

# ✅ COMPLETE SETUP CHECKLIST

## Part 1: Google Cloud Setup

### Getting Credentials
- [ ] Go to https://console.cloud.google.com
- [ ] Create new project: "TALOS Registration"
- [ ] Search and enable: "Google Sheets API"
- [ ] Go to Credentials section
- [ ] Create Service Account: "talos-service"
- [ ] Add JSON Key
- [ ] Download JSON file
- [ ] Open JSON file and note:
  - [ ] client_email: `_______________________`
  - [ ] private_key: `_______________________`

---

## Part 2: Update Configuration

### Update .env File
- [ ] Open: `symposium-backend\.env`
- [ ] Replace `GS_CLIENT_EMAIL` with your email from JSON
- [ ] Replace `GS_PRIVATE_KEY` with your key from JSON
- [ ] Make sure to keep the `"-----BEGIN PRIVATE KEY-----\n` format
- [ ] Save file (Ctrl+S)

**Your .env should look like:**
```
SHEET_ID=1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk
GS_CLIENT_EMAIL=talos-service@project-xxxxx.iam.gserviceaccount.com
GS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"
MONGO_URI=mongodb://localhost:27017/symposium
```

---

## Part 3: Share Google Sheet

### Grant Access
- [ ] Open Google Sheet: https://docs.google.com/spreadsheets/d/1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk/edit
- [ ] Click "Share"
- [ ] Paste service account email: `talos-service@project-xxxxx.iam.gserviceaccount.com`
- [ ] Choose "Editor" access
- [ ] Click "SHARE"

---

## Part 4: Format Sheet Data

### Verify Sheet Structure
- [ ] Row 1 has headers: Name | Email | Team | Event | College | Timestamp
- [ ] Row 2+ have your data (events like Crime Trace, Cyber Hunt, etc.)
- [ ] Data format is correct:
  - Name: Text
  - Email: Email format
  - Team: Team name
  - Event: **Event name (IMPORTANT!)**
  - College: College name
  - Timestamp: Date format

**Example data you should have:**
```
Row 1: Name | Email | Team | Event | College | Timestamp
Row 2: Rahul | rahul@example.com | Team A | Crime Trace | MIT | 1/29/2026
Row 3: Priya | priya@example.com | Team B | Cyber Hunt | Stanford | 1/29/2026
Row 4: Amit | amit@example.com | Team C | Code Sprint | IIT | 1/29/2026
```

---

## Part 5: Start Backend

### Launch Server
- [ ] Open Terminal (Windows + R → cmd → Enter)
- [ ] Navigate: `cd c:\Users\MAYA\Downloads\Dashboard--backend--main\Dashboard--backend--main\symposium-backend`
- [ ] Run: `npm start`
- [ ] Wait for message showing:
  - [ ] "🚀 Server running on port 5000"
  - [ ] "✅ Google Sheets initialized"
  - [ ] "📊 Dashboard: http://localhost:5000"

**Terminal should show:**
```
✅ MongoDB connected (or ⚠️ MongoDB connection failed - OK if running in demo)
✅ Google Sheets initialized (Sheet ID: 1iWSJua2nfds...)
🚀 Server running on port 5000
📊 Dashboard: http://localhost:5000
📝 Register: http://localhost:5000/register
📈 API: http://localhost:5000/api/register (GET /excel, /stats | POST /)
```

---

## Part 6: View Dashboard

### Open Your Dashboard
- [ ] Open Browser
- [ ] Go to: http://localhost:5000
- [ ] You should see:
  - [ ] Live registration counter with your sheet data count
  - [ ] Event cards showing all events from your sheet:
    - [ ] Crime Trace
    - [ ] Cyber Hunt
    - [ ] Code Sprint
    - [ ] (Your other events)
  - [ ] Event distribution chart
  - [ ] Recent registrations ticker
  - [ ] Connection status indicator (should show "CONNECTED" - green)

---

## Part 7: Test It End-to-End

### Registration Form Test
- [ ] Go to: http://localhost:5000/register
- [ ] Fill in test data:
  - [ ] Name: John Doe
  - [ ] Email: john@example.com
  - [ ] Team: Team A
  - [ ] Event: Crime Trace
  - [ ] College: MIT
- [ ] Click "SUBMIT"
- [ ] See confirmation: "Registration successful"
- [ ] Wait 10 seconds
- [ ] Go back to: http://localhost:5000
- [ ] Verify:
  - [ ] Counter increased by 1
  - [ ] New entry appears in "Recent Registrations" ticker
  - [ ] Event card updated

### Verify Google Sheet
- [ ] Go to your Google Sheet
- [ ] Check for new row with submitted data:
  - [ ] Name: John Doe
  - [ ] Email: john@example.com
  - [ ] Team: Team A
  - [ ] Event: Crime Trace
  - [ ] College: MIT
  - [ ] Timestamp: Current date/time

---

## Part 8: Test API Endpoints

### API Test 1: Get Statistics
```bash
curl http://localhost:5000/api/register/stats
```
- [ ] Should return JSON with total and team breakdown
- [ ] Example: `{"total": 5, "teamWise": [{"_id": "Team A", "count": 3}, ...]}`

### API Test 2: Get All Data
```bash
curl http://localhost:5000/api/register/excel
```
- [ ] Should return all registrations from Google Sheet
- [ ] Should include all your events

### API Test 3: Submit Registration (API)
```bash
curl -X POST http://localhost:5000/api/register -H "Content-Type: application/json" -d '{"name":"Test","email":"test@test.com","team":"Test","event":"Crime Trace","college":"Test"}'
```
- [ ] Should return 201 Created
- [ ] Should add to Google Sheet

---

## ✅ Final Verification

- [ ] Dashboard loads without errors
- [ ] All events display in cards
- [ ] Charts show event distribution
- [ ] Registration form works
- [ ] New registrations appear in ticker
- [ ] Data syncs to Google Sheet
- [ ] API endpoints respond correctly
- [ ] Browser console shows no errors (F12)
- [ ] Terminal shows no error messages

---

## 🎉 SUCCESS!

If all checkboxes are marked, your system is:
✅ Fully integrated
✅ Connected to Google Sheets
✅ Showing all your events
✅ Live and real-time
✅ Ready to use!

---

## 🆘 Troubleshooting

**If something isn't checked:**

### Server won't start?
```bash
# Check if port 5000 is available
netstat -ano | findstr :5000

# If something is using it, either close that app or use different port:
set PORT=3000
npm start
```

### Google Sheets error?
```bash
# Check if credentials are correct in .env
# Verify service account email is shared on sheet
# Restart server:
# Press Ctrl+C to stop
# Run: npm start
```

### Dashboard shows no data?
```bash
# Check API directly:
curl http://localhost:5000/api/register/excel

# If it returns error, check:
# 1. .env credentials are correct
# 2. Service account is shared on sheet
# 3. Sheet has data in rows 2+
```

### Form won't submit?
```bash
# Check browser console (F12)
# Check terminal for errors
# Make sure backend is running
```

---

## 📞 Quick Help

**Email:** Your service account email from .env
**Sheet ID:** 1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk
**Dashboard URL:** http://localhost:5000
**API Base:** http://localhost:5000/api/register

---

**You're ready to go! Complete this checklist and your dashboard will be live! 🚀**

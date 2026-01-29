# 🚀 Complete Setup Guide - Get Your Events On Dashboard

## Overview
We need to:
1. ✅ Get Google Service Account credentials
2. ✅ Update .env file with credentials
3. ✅ Share Google Sheet with service account
4. ✅ Start backend server
5. ✅ Open dashboard and see your events

**Total time: 15-20 minutes**

---

## STEP 1: Get Google Service Account Credentials (5 minutes)

### 1.1 Go to Google Cloud Console
→ Open: **https://console.cloud.google.com**

### 1.2 Create a New Project (if needed)
- Click **"Select a Project"** (top left)
- Click **"NEW PROJECT"**
- Name it: "TALOS Registration"
- Click **CREATE**
- Wait for it to load (takes 1-2 min)

### 1.3 Enable Google Sheets API
- In search bar (top), type: **"Google Sheets API"**
- Click on it
- Click **ENABLE**
- Wait 30 seconds for it to enable

### 1.4 Create Service Account
- In left menu, click **"Credentials"**
- Click **"+ CREATE CREDENTIALS"** (top)
- Choose **"Service Account"**
- Fill in:
  - Service account name: **talos-service**
  - Service account ID: *(auto-fills, leave it)*
- Click **CREATE AND CONTINUE**
- Click **CONTINUE** (optional roles page)
- Click **DONE**

### 1.5 Create and Download Key
- In **"Service Accounts"** section, click on **"talos-service"**
- Go to **"KEYS"** tab
- Click **"ADD KEY"** → **"Create new key"**
- Choose **JSON**
- Click **CREATE**
- ⬇️ **JSON file downloads automatically** (save it!)

### 1.6 Open Downloaded JSON File
- Find the downloaded file (usually in Downloads folder)
- Open it with Notepad/Text Editor
- You need to copy two things:
  - **"client_email"** (email address)
  - **"private_key"** (long text with -----BEGIN PRIVATE KEY-----)

---

## STEP 2: Update .env File With Credentials (2 minutes)

### 2.1 Open .env File
- Location: `c:\Users\MAYA\Downloads\Dashboard--backend--main\Dashboard--backend--main\symposium-backend\.env`
- Open with Notepad or VS Code

### 2.2 Copy Your Credentials

**From JSON file, find and copy:**

#### Find this in JSON:
```json
"client_email": "talos-service@YOUR-PROJECT.iam.gserviceaccount.com",
```

#### Replace in .env:
```dotenv
GS_CLIENT_EMAIL=talos-service@YOUR-PROJECT.iam.gserviceaccount.com
```

#### Find this in JSON:
```json
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...(LONG TEXT)...-----END PRIVATE KEY-----\n",
```

#### Replace in .env:
```dotenv
GS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...(LONG TEXT)...-----END PRIVATE KEY-----\n"
```

**⚠️ IMPORTANT: Keep the \n characters in the key!**

### 2.3 Save .env File
- **Ctrl+S** to save
- Close file

---

## STEP 3: Share Google Sheet With Service Account (2 minutes)

### 3.1 Open Your Google Sheet
→ **https://docs.google.com/spreadsheets/d/1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk/edit**

### 3.2 Share with Service Account
- Click **"Share"** button (top right)
- Paste this email (from your JSON file): 
  ```
  talos-service@YOUR-PROJECT.iam.gserviceaccount.com
  ```
- Choose **"Editor"** access
- Click **SHARE**
- Click **SHARE** again (confirmation dialog)

---

## STEP 4: Format Your Google Sheet (2 minutes)

### 4.1 Check Sheet Structure
Your sheet should have **Row 1 (Headers)**:
```
A: Name | B: Email | C: Team | D: Event | E: College | F: Timestamp
```

### 4.2 Add Sample Data
Add some test rows:
```
Row 2: Rahul | rahul@example.com | Team A | Crime Trace | MIT | 1/29/2026
Row 3: Priya | priya@example.com | Team B | Cyber Hunt | Stanford | 1/29/2026
Row 4: Amit | amit@example.com | Team A | Code Sprint | IIT | 1/29/2026
Row 5: Lisa | lisa@example.com | Team C | AI Challenge | Harvard | 1/29/2026
```

**Or use your existing data if you have it!**

---

## STEP 5: Start Backend Server (2 minutes)

### 5.1 Open Terminal
- Press **Windows + R**
- Type: `cmd`
- Press **Enter**

### 5.2 Navigate to Backend
```bash
cd c:\Users\MAYA\Downloads\Dashboard--backend--main\Dashboard--backend--main\symposium-backend
```

### 5.3 Start Server
```bash
npm start
```

**Wait for:**
```
🚀 Server running on port 5000
✅ Google Sheets initialized
```

---

## STEP 6: Open Dashboard & See Your Events (1 minute)

### 6.1 Open Browser
- Open: **http://localhost:5000**

### 6.2 What You Should See
✅ Live participant counter (shows your sheet data count)
✅ Event cards showing:
   - Crime Trace
   - Cyber Hunt
   - Code Sprint
   - AI Challenge
✅ Charts with event distribution
✅ Recent registrations ticker

---

## STEP 7: Test Registration Form (2 minutes)

### 7.1 Open Registration
- Go to: **http://localhost:5000/register**

### 7.2 Submit a Test Registration
- Name: Your Name
- Email: your@email.com
- Team: Team A
- Event: Crime Trace
- College: Your College
- Click **SUBMIT**

### 7.3 Verify It Works
- See "Registration successful" message
- Wait 10 seconds
- Go back to dashboard: **http://localhost:5000**
- Counter incremented ✅
- New entry in ticker ✅
- Check Google Sheet - new row appeared ✅

---

## ✅ Complete! Your Dashboard Now Shows:

✅ All events from Google Sheet
✅ Participant count per event
✅ Live registration counter
✅ Recent registrations ticker
✅ Event distribution charts
✅ Real-time updates every 10 seconds

---

## 🆘 Troubleshooting

### Problem: "Google Sheets initialization failed"

**Solution:**
1. Check .env credentials are correct
2. Make sure GS_CLIENT_EMAIL is shared on the sheet
3. Restart server: Stop (Ctrl+C) and run `npm start` again

### Problem: "Cannot read from Sheet"

**Solution:**
1. Verify sheet has headers in Row 1
2. Check sheet is shared with service account email
3. Verify SHEET_ID is correct in .env

### Problem: Dashboard shows no data

**Solution:**
1. Wait 10 seconds for auto-refresh
2. Check server terminal for errors
3. Try: `curl http://localhost:5000/api/register/excel`
4. Check browser console (F12) for errors

### Problem: Getting JSON file error

**Solution:**
1. Make sure you copied the ENTIRE private_key
2. Keep the \n characters
3. Wrap the key in quotes in .env

---

## 📞 Need Help?

If something doesn't work:
1. **Check terminal output** - look for error messages
2. **Check browser console** - Press F12, click Console tab
3. **Verify .env file** - Is it saved correctly?
4. **Verify sheet sharing** - Is service account email added with Editor access?

---

## 🎉 Success Indicators

✅ npm start shows "✅ Google Sheets initialized"
✅ Dashboard loads with data
✅ Events display in cards
✅ Charts show event distribution
✅ Registration form works
✅ New data appears in Google Sheet

---

**You're almost done! Follow these steps and your dashboard will show all events from Google Sheets! 🚀**

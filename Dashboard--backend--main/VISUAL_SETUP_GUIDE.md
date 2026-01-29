# 📋 STEP-BY-STEP VISUAL GUIDE

## Step 1: Get Google Credentials (5 min)

```
1. Go to: https://console.cloud.google.com
2. Click: "Select a Project" (top left)
3. Click: "NEW PROJECT"
4. Name: "TALOS Registration"
5. Click: "CREATE"
   
   [WAIT 1-2 minutes for project to load]

6. Search: "Google Sheets API"
7. Click: Google Sheets API result
8. Click: "ENABLE"
   
   [WAIT 30 seconds]

9. Left menu: Click "Credentials"
10. Click: "+ CREATE CREDENTIALS" (top)
11. Choose: "Service Account"
12. Name: "talos-service"
13. Click: "CREATE AND CONTINUE"
14. Click: "CONTINUE" (skip roles)
15. Click: "DONE"

16. Click: "talos-service" account
17. Go to: "KEYS" tab
18. Click: "ADD KEY" → "Create new key"
19. Choose: "JSON"
20. Click: "CREATE"
    
    📥 JSON file downloads!
```

---

## Step 2: Extract Credentials From JSON (2 min)

```
📄 Open downloaded JSON file with Notepad

Find these two lines:

Line 1: "client_email": "talos-service@project-xxxxx.iam.gserviceaccount.com"
        ↓ COPY THIS EMAIL

Line 2: "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA..."
        ↓ COPY EVERYTHING FROM -----BEGIN TO -----END\n
```

---

## Step 3: Update .env File (2 min)

```
📂 Open: symposium-backend\.env with Notepad

BEFORE:
┌─────────────────────────────────────────────────┐
│ GS_CLIENT_EMAIL=your-service-account@...       │
│ GS_PRIVATE_KEY="-----BEGIN PRIVATE KEY...      │
└─────────────────────────────────────────────────┘

AFTER (replace with your actual credentials):
┌─────────────────────────────────────────────────┐
│ GS_CLIENT_EMAIL=talos-service@project-xxxxx... │
│ GS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n  │
│ MIIEvQIBA...YOUR LONG KEY TEXT...\n            │
│ -----END PRIVATE KEY-----\n"                    │
└─────────────────────────────────────────────────┘

💾 Save: Ctrl+S
```

---

## Step 4: Share Google Sheet (2 min)

```
1. Open Google Sheet:
   https://docs.google.com/spreadsheets/d/1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk/edit

2. Click: "Share" button (top right)

3. Paste email from Step 2:
   talos-service@project-xxxxx.iam.gserviceaccount.com

4. Choose: "Editor" access

5. Click: "SHARE"

6. Click: "SHARE" (confirmation)

✅ Sheet is now accessible by your service account!
```

---

## Step 5: Format Sheet Data (2 min)

```
Your Google Sheet should look like:

┌──────────┬───────────────┬─────────┬──────────────┬────────┬──────────────┐
│ Name     │ Email         │ Team    │ Event        │ College│ Timestamp    │
├──────────┼───────────────┼─────────┼──────────────┼────────┼──────────────┤
│ Rahul    │ rahul@ex.com  │ Team A  │ Crime Trace  │ MIT    │ 1/29/2026    │
├──────────┼───────────────┼─────────┼──────────────┼────────┼──────────────┤
│ Priya    │ priya@ex.com  │ Team B  │ Cyber Hunt   │ Stanford│ 1/29/2026   │
├──────────┼───────────────┼─────────┼──────────────┼────────┼──────────────┤
│ Amit     │ amit@ex.com   │ Team A  │ Code Sprint  │ IIT    │ 1/29/2026    │
└──────────┴───────────────┴─────────┴──────────────┴────────┴──────────────┘

⬆️ Make sure Row 1 has headers!
⬆️ Your data starts from Row 2!
```

---

## Step 6: Start Backend (2 min)

```
Terminal Commands:

1. Press: Windows + R
2. Type: cmd
3. Press: Enter

4. Copy & Paste this:
   cd c:\Users\MAYA\Downloads\Dashboard--backend--main\Dashboard--backend--main\symposium-backend

5. Press: Enter

6. Copy & Paste this:
   npm start

7. Wait for this message:
   ┌────────────────────────────────────┐
   │ 🚀 Server running on port 5000     │
   │ ✅ Google Sheets initialized       │
   │ 📊 Dashboard: http://localhost:5000│
   └────────────────────────────────────┘
```

---

## Step 7: Open Dashboard (1 min)

```
🌐 Open Browser:

Go to: http://localhost:5000

You should see:
✅ Live Dashboard
✅ Participant Counter (shows your sheet count)
✅ Event Cards (Crime Trace, Cyber Hunt, etc.)
✅ Charts with Event Distribution
✅ Recent Registrations Ticker
✅ Real-time Updates
```

---

## Step 8: Test It (2 min)

```
1. Go to: http://localhost:5000/register

2. Fill Form:
   Name:    Your Name
   Email:   your@email.com
   Team:    Team A
   Event:   Crime Trace
   College: Your College

3. Click: "SUBMIT"

4. See: "Registration successful" ✅

5. Wait: 10 seconds

6. Go back to: http://localhost:5000

7. Check: 
   ✅ Counter increased
   ✅ New entry in ticker
   ✅ Check Google Sheet (new row added!)
```

---

## ✨ You're Done!

Your dashboard now shows:
- ✅ All events from Google Sheet
- ✅ Live participant count
- ✅ Event distribution
- ✅ Recent registrations
- ✅ Real-time updates every 10 seconds

---

## 🔴 If Something Goes Wrong

### Error: "Google Sheets initialization failed"
→ Check if credentials in .env are correct
→ Restart server (Ctrl+C then npm start)

### Error: "Cannot read from sheet"
→ Verify service account email is shared on sheet
→ Check sheet has headers in Row 1

### Dashboard shows no data
→ Wait 10 seconds for refresh
→ Check terminal for error messages
→ Open http://localhost:5000/api/register/excel in browser

### Form won't submit
→ Check browser console (F12)
→ Make sure backend is running
→ Try restarting server

---

**Follow these 8 steps and your dashboard will show all your events! 🚀**

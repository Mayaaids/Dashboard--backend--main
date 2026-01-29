# 🚀 Deploy to Production (Public URL)

## Option 1: Render (Recommended - Free Tier)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended) or email
3. Link your GitHub account

### Step 2: Create New Service
1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Fill in details:
   - **Name:** `symposium-dashboard`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

### Step 3: Add Environment Variables
Before deploying, add in **Environment** section:
```
SHEET_ID=1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk
GS_CLIENT_EMAIL=dashboard@safebuddy-gaurdian-10c86.iam.gserviceaccount.com
GS_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n[your full key]\n-----END PRIVATE KEY-----\n
```

### Step 4: Deploy
- Click **Create Web Service**
- Render automatically deploys from your GitHub repo
- Get your live URL: `https://your-app-name.onrender.com`

---

## Option 2: Railway.app (Free Tier)

### Step 1: Create Account
1. Go to https://railway.app
2. Sign in with GitHub
3. Create new project

### Step 2: Deploy from GitHub
1. Connect repository
2. Select `symposium-backend` folder
3. Add environment variables (same as Step 3 above)
4. Deploy automatically

---

## Option 3: Heroku (Paid - Starting $7/month)

If you prefer Heroku, instructions available on request.

---

## After Deployment

### Test Your Live Dashboard
- **Dashboard:** `https://your-app-name.onrender.com`
- **Register Form:** `https://your-app-name.onrender.com/register`
- **API:** `https://your-app-name.onrender.com/api/register/excel`

### Share with Others
Send them the URL! They can:
- View live dashboard with real-time data
- Submit registrations via form
- See instant updates

---

## Troubleshooting

**"Service unavailable"**
- Check environment variables are set correctly
- Verify `GS_PRIVATE_KEY` includes full `\n` line breaks

**"Cannot connect to Google Sheets"**
- Verify service account has Editor access to spreadsheet
- Check `SHEET_ID` is correct

**"Errors after deploy"**
- Click **Logs** in Render dashboard
- Check for missing environment variables

---

## Next Steps

1. Push this code to GitHub:
   ```bash
   git add .
   git commit -m "Update for production deployment"
   git push
   ```

2. Go to https://render.com and follow Step 1-4

3. Share your live URL with others!

Done! 🎉

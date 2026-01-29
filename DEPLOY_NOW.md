# 🚀 DEPLOY IN 1 MINUTE

## Click the button below to deploy:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Mayaaids/Dashboard--backend--main)

---

## That's it! Then:

1. **Add your Google Sheets Private Key** in the Render dashboard under Environment
2. Click **Deploy**
3. Get your live URL!

---

## Manual Deploy (If button doesn't work):

1. Go to: https://render.com
2. Sign in with GitHub
3. Click: **New Web Service**
4. Select: **Dashboard--backend--main** repo
5. Settings:
   - Root Directory: `Dashboard--backend--main/symposium-backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add Environment Variables:
   ```
   SHEET_ID = 1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk
   GS_CLIENT_EMAIL = dashboard@safebuddy-gaurdian-10c86.iam.gserviceaccount.com
   GS_PRIVATE_KEY = (your private key)
   ```
7. Click **Deploy**

---

✅ **Done! Your dashboard is live!**

Share the URL with others.

# Connect TALOS Live Registrations (Google Sheets) to the Backend

Your spreadsheet is already configured:

- **Sheet**: [TALOS Live Registrations](https://docs.google.com/spreadsheets/d/1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk/edit?usp=sharing)
- **Sheet ID**: `1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk`
- **Tab**: `Sheet1`
- **Columns**: Name (A), Email (B), Team (C), Event (D), College (E), Timestamp (F)

## 1. Create a Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Open **APIs & Services** → **Credentials** → **Create Credentials** → **Service Account**.
4. Name it (e.g. `talos-sheets`) and create.
5. Open the new service account → **Keys** → **Add Key** → **Create new key** → **JSON**. Download the JSON file.

## 2. Enable Google Sheets API

1. In Cloud Console, go to **APIs & Services** → **Library**.
2. Search for **Google Sheets API** and enable it.

## 3. Share the spreadsheet with the service account

1. Open the JSON key file. Copy:
   - `client_email` (e.g. `something@project.iam.gserviceaccount.com`)
2. Open your [TALOS Live Registrations](https://docs.google.com/spreadsheets/d/1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk/edit?usp=sharing) spreadsheet.
3. Click **Share**.
4. Paste the `client_email` and give it **Editor** access. Save.

## 4. Configure the backend

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set:

   ```env
   SHEET_ID=1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk
   GS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
   YOUR_PRIVATE_KEY_LINES_HERE
   -----END PRIVATE KEY-----"
   ```

   For `GS_PRIVATE_KEY`:
   - Use the `private_key` value from the JSON key file.
   - Keep the `\n` line breaks as in the JSON, or use real newlines inside the quotes.
   - The key must be wrapped in double quotes in `.env`.

## 5. Run the backend

```bash
npm install
npm start
```

- **Dashboard**: http://localhost:5000  
- **Registrations API**: `POST /api/register` (writes to Sheet1)  
- **Data API**: `GET /api/register/excel` (reads from Sheet1)

## 6. Behaviour

- The backend ensures **Sheet1** has a header row (`Name`, `Email`, `Team`, `Event`, `College`, `Timestamp`). If the first row is empty, it writes this header.
- New registrations are **appended** to Sheet1.
- The dashboard reads from `GET /api/register/excel`, which pulls data from Google Sheets.

If `GS_PRIVATE_KEY` or `GS_CLIENT_EMAIL` are missing, the app still runs but logs that Google Sheets integration is disabled and uses mock data.

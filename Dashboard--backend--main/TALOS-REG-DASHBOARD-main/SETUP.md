# 🚀 Setup Guide - F1 Live Registration Dashboard

## Step-by-Step Setup Instructions

### Prerequisites
- A Google account
- A web browser (Chrome, Firefox, Edge, Safari)
- Basic knowledge of Google Sheets

---

## Part 1: Prepare Your Google Sheet

### 1.1 Create Your Registration Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it something like "Event Registrations"

### 1.2 Set Up Columns

In the first row, add these headers:
- **Column A**: Timestamp
- **Column B**: Name  
- **Column C**: College
- **Column D**: Event

Your sheet should look like this:

```
| Timestamp           | Name      | College  | Event      |
|---------------------|-----------|----------|------------|
| 2024-01-15 10:30:00 | John Doe  | MIT      | Hackathon  |
```

### 1.3 Make Sheet Public

1. Click **Share** button (top right)
2. Click **Change to anyone with the link**
3. Set permission to **Viewer**
4. Click **Done**
5. Copy the link (you'll need it later)

### 1.4 Get Your Spreadsheet ID

From your sheet URL:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
```

Copy the `SPREADSHEET_ID_HERE` part - this is your Spreadsheet ID.

---

## Part 2: Enable Google Sheets API

### 2.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name it "F1 Dashboard" (or any name)
4. Click **Create**

### 2.2 Enable Google Sheets API

1. In the search bar, type "Google Sheets API"
2. Click on **Google Sheets API**
3. Click **Enable**

### 2.3 Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy your API key (you'll need it)
4. (Optional) Click **Restrict Key** → **API restrictions** → Select **Google Sheets API** → **Save**

---

## Part 3: Configure the Dashboard

### 3.1 Edit config.js

Open `config.js` and replace:

```javascript
const CONFIG = {
    API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY',        // ← Paste your API key here
    SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID',        // ← Paste your Spreadsheet ID here
    RANGE: 'Sheet1!A:D',                          // ← Change if your sheet name is different
    REFRESH_INTERVAL: 5000,                       // ← 5000 = 5 seconds
};
```

**Example:**
```javascript
const CONFIG = {
    API_KEY: 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    SPREADSHEET_ID: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    RANGE: 'Sheet1!A:D',
    REFRESH_INTERVAL: 5000,
};
```

### 3.2 Adjust Column Mapping (If Needed)

If your columns are in a different order, modify:

```javascript
COLUMNS: {
    TIMESTAMP: 0,  // Column A = 0, B = 1, C = 2, D = 3
    NAME: 1,
    COLLEGE: 2,
    EVENT: 3
}
```

---

## Part 4: Run the Dashboard

### Option A: Direct File Open (Simple)

1. Double-click `index.html`
2. It will open in your default browser
3. The dashboard should start loading data

**Note**: Some browsers may block local file access. If you see errors, use Option B.

### Option B: Local Server (Recommended)

#### Using Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Using Node.js:
```bash
npx http-server
```

#### Using PHP:
```bash
php -S localhost:8000
```

Then open: `http://localhost:8000`

---

## Part 5: Test Your Setup

### 5.1 Add Test Data

Add a few rows to your Google Sheet:
```
2024-01-15 10:30:00 | Alice Johnson | MIT | Hackathon
2024-01-15 10:31:00 | Bob Smith     | Stanford | Code Sprint
2024-01-15 10:32:00 | Carol White   | Harvard | AI Challenge
```

### 5.2 Verify Dashboard

1. Check the **Total Counter** shows the correct number
2. Verify **Event Cards** appear for each event
3. Confirm **Recent Registrations** ticker is scrolling
4. Check **Connection Status** shows "CONNECTED" (green dot)

---

## Troubleshooting

### ❌ "CONNECTION ERROR" Status

**Possible causes:**
1. API key is incorrect
2. Sheet is not public
3. Google Sheets API not enabled
4. Spreadsheet ID is wrong

**Solutions:**
- Double-check API key in `config.js`
- Verify sheet sharing settings
- Ensure Google Sheets API is enabled
- Check Spreadsheet ID matches your sheet URL

### ❌ No Data Showing

**Possible causes:**
1. Sheet range is incorrect
2. Column mapping is wrong
3. Sheet name doesn't match

**Solutions:**
- Check `RANGE` in `config.js` matches your sheet name
- Verify column order matches your sheet
- Try `Sheet1!A1:D1000` for explicit range

### ❌ CORS Errors in Browser Console

**Solution:**
- Use a local server (Option B above)
- Or deploy to a web server

### ❌ Dashboard Shows Demo Data

This means the API connection failed. Check:
- API key is correct
- Sheet is public
- Internet connection is working

---

## Advanced Configuration

### Custom Refresh Interval

Change how often data updates:
```javascript
REFRESH_INTERVAL: 3000,  // 3 seconds (faster)
REFRESH_INTERVAL: 10000, // 10 seconds (slower)
```

### Different Sheet Range

If your data starts from row 2:
```javascript
RANGE: 'Sheet1!A2:D1000'
```

If you have a named sheet:
```javascript
RANGE: 'Registrations!A:D'
```

### Multiple Sheets

To switch between sheets, just change the `RANGE`:
```javascript
RANGE: 'Sheet2!A:D'  // Different sheet
```

---

## Security Notes

⚠️ **Important**: Your API key will be visible in the browser. 

**Best Practices:**
1. Restrict your API key to Google Sheets API only
2. Set up API key restrictions in Google Cloud Console
3. Consider using Google Apps Script for production (more secure)
4. Don't share your API key publicly

---

## Next Steps

- Customize colors in `styles.css`
- Adjust layout for your screen size
- Add more events as needed
- Deploy to a web server for public access

---

## Need Help?

Check the main `README.md` for more details and examples.


# 🏁 F1 Live Registration Dashboard

A professional, Formula-1-inspired live registration dashboard that connects to Google Sheets and updates in real-time. Perfect for IT events, hackathons, college fests, and conferences.

![Dashboard Preview](https://via.placeholder.com/800x400/0a0a0a/e10600?text=F1+Dashboard)

## ✨ Features

- **🏁 F1-Inspired Design**: Dark theme with high-contrast colors (black, red, white, neon accents)
- **📊 Live Total Counter**: Large, bold counter that updates instantly as registrations arrive
- **🎯 Event-Wise Cards**: Pit-wall style panels showing individual event statistics
- **📈 Real-Time Analytics**: Percentage contributions, progress bars, and growth rates
- **🔄 Auto-Refresh**: Automatically fetches new data every 5 seconds (configurable)
- **📡 Google Sheets Integration**: Connects directly to your Google Sheets
- **🎨 Smooth Animations**: Professional transitions and update effects
- **📱 Responsive Design**: Works on large screens, projectors, and mobile devices

## 🚀 Quick Start

### 1. Setup Google Sheets

1. Create a Google Sheet with the following columns:
   - **Column A**: Timestamp
   - **Column B**: Name
   - **Column C**: College
   - **Column D**: Event

2. Make your sheet **public** (View → Anyone with the link can view)

3. Get your **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
   ```

### 2. Get Google Sheets API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

### 3. Configure the Dashboard

1. Open `config.js`
2. Replace the placeholder values:
   ```javascript
   const CONFIG = {
       API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY',
       SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID',
       RANGE: 'Sheet1!A:D',
       REFRESH_INTERVAL: 5000, // 5 seconds
   };
   ```

### 4. Run the Dashboard

1. Open `index.html` in a web browser
2. The dashboard will automatically start fetching data from your Google Sheet

## 📋 Google Sheets Format

Your Google Sheet should follow this format:

| Timestamp | Name | College | Event |
|-----------|------|---------|-------|
| 2024-01-15 10:30:00 | John Doe | MIT | Hackathon |
| 2024-01-15 10:31:00 | Jane Smith | Stanford | Code Sprint |
| 2024-01-15 10:32:00 | Alex Johnson | Harvard | AI Challenge |

**Note**: The first row can be headers. The dashboard will automatically skip it.

## 🎨 Customization

### Change Refresh Interval

Edit `config.js`:
```javascript
REFRESH_INTERVAL: 3000, // 3 seconds
```

### Adjust Column Mapping

If your sheet has different column order, edit `config.js`:
```javascript
COLUMNS: {
    TIMESTAMP: 0,  // Column A
    NAME: 1,       // Column B
    COLLEGE: 2,    // Column C
    EVENT: 3       // Column D
}
```

### Modify Colors

Edit `styles.css` and change the CSS variables:
```css
:root {
    --f1-red: #e10600;
    --f1-neon-blue: #00d4ff;
    --f1-neon-green: #00ff88;
    /* ... */
}
```

## 🔧 Advanced Setup

### Using Google Apps Script (Alternative Method)

If you prefer not to use API keys, you can use Google Apps Script:

1. Open your Google Sheet
2. Go to **Extensions** → **Apps Script**
3. Create a web app that returns JSON data
4. Update `dashboard.js` to fetch from your Apps Script URL

### Local Development Server

For best results, serve the files through a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 📊 Dashboard Components

### Total Counter
- Large, bold display showing total participants
- Updates with smooth animations
- F1 lap-counter style design

### Event Cards
- Individual panels for each event
- Shows registration count, percentage, and progress bar
- Click any event to open full event-wise sheet rows (all columns) in an on-screen table

### Recent Registrations Ticker
- Scrolling feed of latest registrations
- Shows name, event, and time ago

### Event Distribution Chart
- Bar chart showing event-wise distribution
- Updates automatically with new data

### Fastest Growing Event
- Removed (per your request)

## 🐛 Troubleshooting

### Dashboard shows "CONNECTION ERROR"
- Check that your Google Sheet is public
- Verify your API key is correct
- Ensure Google Sheets API is enabled in Google Cloud Console

### Data not updating
- Check browser console for errors
- Verify the sheet range matches your data
- Ensure column mapping is correct

### Demo Mode
If the API is not configured, the dashboard will automatically load demo data for testing.

## 📝 License

This project is open source and available for use in your events.

## 🤝 Contributing

Feel free to customize and enhance this dashboard for your specific needs!

## 📧 Support

For issues or questions, please check:
- Google Sheets API documentation
- Browser console for error messages
- Network tab for API request status

---

**Built with ❤️ for live event registrations**


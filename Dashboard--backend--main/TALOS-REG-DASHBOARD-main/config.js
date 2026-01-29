// Backend Configuration
// Connect to your Node.js/Express backend

const CONFIG = {
    // Backend API endpoint
    BACKEND_URL: 'http://localhost:5000',

    // Your Google Sheets ID (for reference)
    SPREADSHEET_ID: '1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk',

    // Refresh interval in milliseconds (default: 5 seconds)
    REFRESH_INTERVAL: 5000,

    // Column mapping (adjust based on your sheet structure)
    COLUMNS: {
        TIMESTAMP: 0,  // Column A
        NAME: 1,       // Column B
        EMAIL: 2,      // Column C
        TEAM: 3,       // Column D
        EVENT: 4       // Column E
    },
};
// If detection fails, set PAYMENT_INDEX to the 0-based column number (A=0, B=1, ...).
PAYMENT_HEADER_MATCH: /(payment|paid|fees|fee|transaction|txn|amount)/i,
    PAYMENT_INDEX: null
};

// For public sheets, you can use this URL format:
// https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/{RANGE}?key={API_KEY}


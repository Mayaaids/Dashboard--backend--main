// Backend Configuration — same origin when served from backend
const CONFIG = {
    BACKEND_URL: (typeof window !== 'undefined' && window.location && window.location.origin)
        ? window.location.origin
        : 'http://localhost:5000',

    // Your Google Sheets ID (for reference)
    SPREADSHEET_ID: '1iWSJua2nfdsw5jC9DKK-CA10zjYT6IpRhjLBCWJV8Mk',

    // Refresh interval in milliseconds (30 seconds to avoid Google Sheets quota limits)
    REFRESH_INTERVAL: 30000,

    // Column mapping — matches Sheet1 A:F (Name, Email, Team, Event, College, Timestamp)
    COLUMNS: {
        NAME: 0,
        EMAIL: 1,
        TEAM: 2,
        EVENT: 3,
        COLLEGE: 4,
        TIMESTAMP: 5
    },

    PAYMENT_HEADER_MATCH: /(payment|paid|fees|fee|transaction|txn|amount)/i,
    PAYMENT_INDEX: null
};

// Default headers for Excel columns (used when backend doesn't send explicit headers)
CONFIG.HEADERS = ['Name', 'Email', 'Team', 'Event', 'College', 'Timestamp'];

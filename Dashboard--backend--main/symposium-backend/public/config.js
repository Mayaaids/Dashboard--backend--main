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

// Event limits configuration
CONFIG.EVENT_LIMITS = {
    // Major events - maxLimit 300
    'PROMPTORIX': 300,
    'PAPER PRESENTATION': 300,
    'SPEAKQUIZY': 300,
    'EXPEDITION 404': 300,
    'CRIMETRACE': 300,
    'CRIME TRACE': 300,
    'PITCH PERFECT': 300,
    'STRANGER CODES': 300,
    'PREDICT G': 300,
    'PLOTVERSE': 300,
    'PIXORA': 300,
    
    // Special/minor events - maxLimit 100
    'BLOCKCHAIN': 100,
    'BLOCKCHAIN EVENT': 100,
    'INSIDE A BLOCKCHAIN': 100,
    'BYOG': 100,
    'BUILD YOUR OWN GAME': 100,
    'BYOG – BUILD YOUR OWN GAME': 100,
    'MINDTRACE': 100,
    'MIND TRACE': 100,
    'MINDTRACE – AI IN CYBERSECURITY': 100,
    'MIND TRACE – AI IN CYBERSECURITY': 100,
    'MCP': 100,
    'MCP&AI': 100,
    'MCP & AI': 100,
    'MCP&AI: BUILDING SMART AI AGENTS': 100,
    'MCP & AI: BUILDING SMART AI AGENTS': 100,
    'SPIKING NEURAL NETWORKS': 100,
    'SPIKING NEURAL': 100,
    'NEURAL NETWORKS': 100,
    
    // Custom limit events
    'RESOLUTION CAPTURES': 50,
    'RESOLUTION': 50
};

// Function to get maxLimit for an event
CONFIG.getMaxLimit = function(eventName) {
    if (!eventName) return 300; // Default to 300
    const normalized = String(eventName).trim().toUpperCase();
    
    // Direct match
    if (CONFIG.EVENT_LIMITS[normalized]) {
        return CONFIG.EVENT_LIMITS[normalized];
    }
    
    // Partial match for special events
    if (normalized.includes('RESOLUTION')) return 50;
    if (normalized.includes('BLOCKCHAIN')) return 100;
    if (normalized.includes('BYOG')) return 100;
    if (normalized.includes('MIND TRACE') || normalized.includes('MINDTRACE')) return 100;
    if (normalized.includes('MCP')) return 100;
    if (normalized.includes('SPIKING')) return 100;
    if (normalized.includes('NEURAL')) return 100;
    
    // Default to 300 for all other events
    return 300;
};

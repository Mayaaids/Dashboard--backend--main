# TALOS Backend API Documentation

## Base URL
```
http://localhost:5000
```

## Overview

The TALOS backend provides REST API endpoints for:
- Registering new participants
- Fetching registration statistics
- Retrieving data from Google Sheets
- Serving frontend static files

---

## Endpoints

### 1. Get Dashboard (Frontend)
```
GET /
```

**Description:** Serves the main dashboard HTML page

**Response:**
- HTML file (`public/index.html`)

**Example:**
```bash
curl http://localhost:5000
```

**Browser:**
```
http://localhost:5000
```

---

### 2. Get Registration Form
```
GET /register
```

**Description:** Serves the registration form page

**Response:**
- HTML file (`public/register.html`)

**Example:**
```bash
curl http://localhost:5000/register
```

**Browser:**
```
http://localhost:5000/register
```

---

### 3. Submit Registration
```
POST /api/register
```

**Description:** Creates a new registration and syncs to:
- MongoDB (if available)
- Google Sheets (in real-time)

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "team": "Team Alpha",
  "event": "Hackathon",
  "college": "MIT"
}
```

**Response (Success 201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "team": "Team Alpha",
    "event": "Hackathon",
    "college": "MIT"
  }
}
```

**Response (Error 500):**
```json
{
  "error": "Error message"
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "team": "Team Alpha",
    "event": "Hackathon",
    "college": "MIT"
  }'
```

**Example (PowerShell):**
```powershell
$body = @{
    name = "John Doe"
    email = "john@example.com"
    team = "Team Alpha"
    event = "Hackathon"
    college = "MIT"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Example (JavaScript):**
```javascript
fetch('http://localhost:5000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        team: 'Team Alpha',
        event: 'Hackathon',
        college: 'MIT'
    })
})
.then(res => res.json())
.then(data => console.log(data))
```

---

### 4. Get Registration Statistics
```
GET /api/register/stats
```

**Description:** Fetches aggregated statistics:
- Total number of registrations
- Count breakdown by team

**Response (Success 200):**
```json
{
  "total": 45,
  "teamWise": [
    { "_id": "Team Alpha", "count": 12 },
    { "_id": "Team Beta", "count": 15 },
    { "_id": "Team Gamma", "count": 18 }
  ]
}
```

**Example (cURL):**
```bash
curl http://localhost:5000/api/register/stats
```

**Example (PowerShell):**
```powershell
$stats = Invoke-WebRequest -Uri "http://localhost:5000/api/register/stats" | ConvertFrom-Json
Write-Host "Total: $($stats.total)"
$stats.teamWise | ForEach-Object { Write-Host "$($_.`_id): $($_.count)" }
```

**Example (JavaScript):**
```javascript
fetch('http://localhost:5000/api/register/stats')
    .then(res => res.json())
    .then(data => {
        console.log('Total:', data.total);
        console.log('By Team:', data.teamWise);
    })
```

---

### 5. Get All Registration Data (Google Sheets)
```
GET /api/register/excel
```

**Description:** Retrieves complete registration data from:
1. Google Sheets (primary source)
2. Falls back to mock data if sheets unavailable

**Response (Success 200 - Real Data):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "team": "Team Alpha",
      "event": "Hackathon",
      "college": "MIT",
      "timestamp": "1/29/2026 2:30 PM",
      "raw": ["John Doe", "john@example.com", "Team Alpha", "Hackathon", "MIT", "1/29/2026 2:30 PM"]
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "team": "Team Beta",
      "event": "Code Sprint",
      "college": "Stanford",
      "timestamp": "1/29/2026 2:35 PM",
      "raw": ["Jane Smith", "jane@example.com", "Team Beta", "Code Sprint", "Stanford", "1/29/2026 2:35 PM"]
    }
  ],
  "total": 2,
  "source": "google-sheets"
}
```

**Response (Success 200 - Fallback Data):**
```json
{
  "success": true,
  "data": [{ ... }],
  "total": 50,
  "source": "mock-data"
}
```

**Example (cURL):**
```bash
curl http://localhost:5000/api/register/excel
```

**Example (PowerShell):**
```powershell
$data = Invoke-WebRequest -Uri "http://localhost:5000/api/register/excel" | ConvertFrom-Json
Write-Host "Total records: $($data.total)"
Write-Host "Data source: $($data.source)"
$data.data | ForEach-Object { Write-Host "$($_.name) - $($_.event)" }
```

**Example (JavaScript):**
```javascript
fetch('http://localhost:5000/api/register/excel')
    .then(res => res.json())
    .then(data => {
        console.log(`Total records: ${data.total}`);
        console.log(`Source: ${data.source}`);
        data.data.forEach(record => {
            console.log(`${record.name} - ${record.event}`);
        });
    })
```

---

## CORS Configuration

All endpoints have CORS enabled. Requests from any origin are allowed:

```javascript
// Browser requests are allowed from any origin
app.use(cors());
```

---

## Response Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful registration |
| 400 | Bad Request | Invalid JSON or missing required fields |
| 404 | Not Found | Non-existent endpoint |
| 500 | Server Error | Database error, API error, etc. |

---

## Error Handling

### MongoDB Unavailable
The backend continues working in DEMO mode:
- Returns mock data instead of database data
- Google Sheets integration still works
- Console logs: `⚠️ MongoDB unavailable, storing in memory`

### Google Sheets Unavailable
The backend continues working:
- Returns previously cached data or mock data
- Console logs: `⚠️ Google Sheets unavailable`
- Registration still saved to MongoDB (if available)

### Network Error
Frontend retries automatically:
- Retry interval: 10 seconds
- Shows "Disconnected" indicator while retrying
- Resumes normal operation when connection restored

---

## Data Flow Examples

### Example 1: Complete Registration Workflow

```
Frontend (register.html)
  ↓
User submits form with Name, Email, Team, Event, College
  ↓
POST /api/register (JSON)
  ↓
Backend routes/register.js
  ├─ Save to MongoDB ✓
  ├─ Save to Google Sheets ✓
  └─ Return 201 Created
  ↓
Frontend shows confirmation
  ↓
Frontend redirects to dashboard or clears form
  ↓
Dashboard auto-refresh fetches new data (10 sec)
  ↓
Live counter and charts update
```

### Example 2: Dashboard Live Update

```
Dashboard loads (public/index.html + dashboard.js)
  ↓
Auto-refresh timer starts (10 seconds)
  ↓
GET /api/register/excel (fetch Google Sheets data)
  ↓
Backend queries Google Sheets API
  ↓
Returns array of all registrations
  ↓
Frontend processes and displays:
  ├─ Update total counter
  ├─ Update event distribution chart
  ├─ Update recent registrations ticker
  └─ Calculate growth rates
  ↓
Repeat every 10 seconds
```

### Example 3: Stats Aggregation

```
GET /api/register/stats
  ↓
Backend aggregates MongoDB documents
  ↓
Group by team: Team Alpha, Team Beta, etc.
  ↓
Count registrations per team
  ↓
Return: total + breakdown by team
  ↓
Frontend displays in charts/cards
```

---

## Testing with Postman

### Import Collection

Create a new request in Postman:

**1. Dashboard**
```
GET http://localhost:5000
Type: HTML
```

**2. Statistics**
```
GET http://localhost:5000/api/register/stats
Type: JSON
```

**3. Register New User**
```
POST http://localhost:5000/api/register
Content-Type: application/json

Body (raw JSON):
{
  "name": "Test User",
  "email": "test@example.com",
  "team": "Postman Test",
  "event": "Testing",
  "college": "Postman University"
}
```

**4. Get All Data**
```
GET http://localhost:5000/api/register/excel
Type: JSON
```

---

## Rate Limiting

Currently: **No rate limiting** (suitable for testing/internal use)

For production, add rate limiting:
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Webhook Integrations

### Optional: Send data to external services

Add to `routes/register.js` after successful registration:

```javascript
// Send to external webhook
fetch('https://your-webhook-url.com/registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registrationData)
})
```

---

## Troubleshooting API

### Test Endpoint Availability

```bash
# PowerShell
$endpoints = @(
  'http://localhost:5000',
  'http://localhost:5000/api/register/stats',
  'http://localhost:5000/api/register/excel',
  'http://localhost:5000/register'
)

foreach ($endpoint in $endpoints) {
  try {
    $response = Invoke-WebRequest -Uri $endpoint -ErrorAction Stop
    Write-Host "✓ $endpoint - Status: $($response.StatusCode)"
  } catch {
    Write-Host "✗ $endpoint - Error: $($_.Exception.Message)"
  }
}
```

### Check CORS Headers

```bash
curl -I http://localhost:5000
```

Should include:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type
```

---

## Performance Metrics

| Operation | Time | Notes |
|-----------|------|-------|
| GET / (dashboard) | <100ms | Serves static HTML |
| POST /api/register | 500-2000ms | Includes Google Sheets write |
| GET /api/register/stats | 100-500ms | MongoDB query |
| GET /api/register/excel | 1000-3000ms | Google Sheets API call |

---

## Version

**API Version:** 1.0.0
**Last Updated:** January 29, 2026
**Backend:** Node.js + Express 5.2.1
**Database:** MongoDB 9.1.5
**Google Sheets:** googleapis 170.1.0

---

## Support

For issues:
1. Check logs in terminal running `npm start`
2. Check browser console: `F12` → Console
3. See STATUS_AND_TROUBLESHOOTING.md for solutions
4. Check GOOGLE_SHEETS_SETUP.md for credentials setup

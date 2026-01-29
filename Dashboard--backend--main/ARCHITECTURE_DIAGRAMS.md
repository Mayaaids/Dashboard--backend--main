# TALOS System Architecture & Data Flow Diagrams

## System Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                      USER'S WEB BROWSER                                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────┐          ┌──────────────────────┐           │
│  │  DASHBOARD PAGE      │          │  REGISTRATION FORM   │           │
│  │  (index.html)        │          │  (register.html)     │           │
│  │                      │          │                      │           │
│  │ • Live counter       │          │ • Name input         │           │
│  │ • Event charts       │          │ • Email input        │           │
│  │ • Recent ticker      │          │ • Team input         │           │
│  │ • Stats display      │          │ • Event input        │           │
│  └──────────────────────┘          │ • College input      │           │
│         ▲  │                       │ • Submit button      │           │
│         │  │                       └──────────────────────┘           │
│         │  │                              ▲  │                        │
│         │  └──────────────────────────────┘  │                        │
│         │  (HTTP GET /register)              │ (Form data)            │
│         │                                   │                         │
│  ┌──────┴───────────────────────────────────┴──────────────────────┐  │
│  │              dashboard.js (500 lines)                           │  │
│  │  • Auto-refresh every 10 seconds                               │  │
│  │  • Fetch /api/register/excel                                   │  │
│  │  • Parse & display data                                        │  │
│  │  • Calculate statistics & growth rates                         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│         ▲                                    │                        │
│         │ JSON Response                      │ JSON Request           │
│         │ (GET /api/register/*)              │ (POST /api/register)   │
└─────────┼────────────────────────────────────┼───────────────────────┘
          │                                    │
          │ HTTP                               │ HTTP
          │                                    │
┌─────────┴────────────────────────────────────┴───────────────────────┐
│                        PORT 5000                                      │
├─────────────────────────────────────────────────────────────────────┤
│                   NODE.JS EXPRESS SERVER                              │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ app.use(cors())  ← CORS enabled for cross-origin requests   │  │
│  │ app.use(express.json())  ← Parse JSON bodies               │  │
│  │ app.use(express.static('public'))  ← Serve frontend files   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ROUTING LAYER:                                                     │
│  ├─ GET /              → serve public/index.html (dashboard)       │
│  ├─ GET /register      → serve public/register.html (form)         │
│  │                                                                  │
│  └─ /api/register/ (routes/register.js)                            │
│     │                                                               │
│     ├─ POST /          → Create new registration                  │
│     │   ├─ Save to MongoDB                                         │
│     │   ├─ Save to Google Sheets                                   │
│     │   └─ Return 201 Created                                      │
│     │                                                               │
│     ├─ GET /stats      → Get aggregated statistics                │
│     │   ├─ Query MongoDB (team-wise count)                        │
│     │   └─ Return total + breakdown                               │
│     │                                                               │
│     └─ GET /excel      → Get all registration data                │
│         ├─ Try Google Sheets API (primary)                        │
│         ├─ Fallback to MongoDB if sheets unavailable              │
│         └─ Return array of registrations                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
          │                                    │
          │ Mongoose queries                   │ Google Sheets API
          │ (optional)                         │ (required)
          │                                    │
      ┌───┴─────────────┬──────────────────────┴─────────────┐
      │                 │                                    │
      ▼                 ▼                                    ▼
  ┌─────────┐      ┌──────────┐                  ┌──────────────────┐
  │ MongoDB │      │ Demo     │                  │  GOOGLE SHEETS   │
  │ (Local) │      │ Data     │                  │                  │
  │ (Opt)   │      │ (Fallback)                 │ Sheet ID:        │
  └─────────┘      └──────────┘                  │ 1iWSJua2nfds...  │
                                                 │                  │
                                                 │ Columns: A-F     │
                                                 │ A: Name          │
                                                 │ B: Email         │
                                                 │ C: Team          │
                                                 │ D: Event         │
                                                 │ E: College       │
                                                 │ F: Timestamp     │
                                                 └──────────────────┘
```

---

## Data Flow Diagram 1: Registration Submission

```
┌──────────────────────────────────────┐
│  User at /register                   │
│  (Registration Form Page)            │
└──────────────────┬───────────────────┘
                   │ User fills form:
                   │ - Name: "John Doe"
                   │ - Email: "john@example.com"
                   │ - Team: "Team Alpha"
                   │ - Event: "Hackathon"
                   │ - College: "MIT"
                   │
                   │ Click "Submit" button
                   ▼
        ┌─────────────────────────┐
        │ register.html submit    │
        │ event handler           │
        └────────┬────────────────┘
                 │ Prevent default
                 │ Get form data
                 │ Validate input
                 ▼
    ┌────────────────────────────────────┐
    │ POST /api/register                 │
    │ Content-Type: application/json     │
    │ Body: { name, email, team, ... }   │
    └────────┬─────────────────────────┬─┘
             │ HTTP                    │ HTTP
             ▼                        ▼
   ┌──────────────────┐    ┌──────────────────────┐
   │ routes/register │    │ Validation           │
   │ req.body        │    │ Check required fields│
   └────┬────────────┘    └──────────────────────┘
        │                      │ Valid?
        ├─ name: "John..."     ├─ YES
        ├─ email: "john@..."   │  │
        ├─ team: "Team..."     │  ▼
        ├─ event: "Hack..."    │
        └─ college: "MIT"      │ NO
                               ├─ Return 400 error
                               └─ Form shows error
        │
        ▼ (if valid)
   ┌──────────────────────────┐
   │ Try MongoDB.create()     │
   │ (if MONGO_URI configured)│
   └─┬────────────────────┬───┘
     │                    │
     │ Success            │ Fail or unavailable
     │ ✓ Saved to DB      │ ✓ Store in memory
     │                    │
     ▼                    ▼
   ┌────────────────────────────────────────┐
   │ Call addToExcel(data)                  │
   │ (googleSheet.js)                       │
   └────────┬─────────────────────┬─────────┘
            │                     │
            │ Google Sheets API   │ Fallback
            ▼                     ▼
   ┌──────────────────────────────────────┐
   │ Append row to Sheet1:                │
   │ [John Doe, john@..., Team A, ...]    │
   │                                      │
   │ Add timestamp automatically           │
   └────┬─────────────────────────────────┘
        │ Success or Fail
        ▼
   ┌────────────────────────────────┐
   │ Return 201 Created             │
   │ { success: true, data: {...} } │
   └────────┬──────────────────────┘
            │ JSON Response
            ▼
   ┌────────────────────────────────────┐
   │ register.html receives response    │
   │                                    │
   │ Success:                           │
   │ ✓ Show "Registration successful!" │
   │ ✓ Clear form                       │
   │ ✓ Redirect to dashboard (optional) │
   │                                    │
   │ Failure:                           │
   │ ✗ Show error message               │
   │ ✗ Keep form data                   │
   └────────────────────────────────────┘

Timeline:
Form submission → Validation → MongoDB → Google Sheets → Response → User feedback
     ~0ms         ~0ms       ~100ms      ~500-2000ms    ~50ms     ~0ms
```

---

## Data Flow Diagram 2: Dashboard Live Updates

```
┌──────────────────────────┐
│ Dashboard Page Loads     │
│ (index.html)             │
└──────────┬───────────────┘
           │
           ▼
    ┌─────────────────────┐
    │ dashboard.js init() │
    └──┬──────────────────┘
       │
       ├─ updateTimestamp()      → Display current time
       ├─ initChart()            → Create empty chart
       ├─ startAutoRefresh()     → Start 10-sec timer
       └─ updateConnectionStatus('connecting')
              │
              ▼
       ┌──────────────────────────┐
       │ fetchData()              │
       │ (First load)             │
       └────┬─────────────────────┘
            │
            ▼
    ┌─────────────────────────────────────┐
    │ GET /api/register/excel             │
    │ (Fetch Google Sheets data)          │
    └────┬─────────────────────┬──────────┘
         │                     │
    Success                Fallback
    │                     │
    ├─ Backend queries    ├─ Try /api/register/stats
    │  Google Sheets      │  (MongoDB aggregate)
    │  API                │
    │                     │
    ▼                     ▼
   ┌──────────────────────────────────────┐
   │ Response: Array of registrations     │
   │ [                                    │
   │   { name, email, team, event, ...},  │
   │   { name, email, team, event, ...},  │
   │   ...                                │
   │ ]                                    │
   └────┬───────────────────────────────┘
        │
        ▼
   ┌──────────────────────────────────┐
   │ processData()                    │
   │ • Store data in this.data        │
   │ • Group by event                 │
   │ • Count totals                   │
   │ • Calculate growth rates         │
   └────┬──────────────────────────────┘
        │
        ├─────────────────────────┬──────────────────┐
        │                         │                  │
        ▼                         ▼                  ▼
   ┌──────────────┐     ┌─────────────────┐  ┌────────────────────┐
   │ Update UI:   │     │ Update UI:      │  │ Update UI:         │
   │              │     │                 │  │                    │
   │ Total        │     │ Event Chart     │  │ Recent Ticker      │
   │ Counter      │     │                 │  │                    │
   │              │     │ • Pie chart     │  │ Scrolling list of  │
   │ 45 ├─────────│     │ • Bar chart     │  │ recent entries     │
   │    │         │     │ • Updated       │  │                    │
   │    └─────────┤     │   every update  │  │ Shows last 10      │
   │              │     └─────────────────┘  │ registrations      │
   │ Next update: │                         │                    │
   │ 10 seconds   │                         └────────────────────┘
   │              │
   └──────────────┘
        │
        ▼
   ┌──────────────────────────────────┐
   │ updateConnectionStatus('connected') │
   │ Show green indicator              │
   │ "CONNECTED"                       │
   └──────────────────────────────────┘
        │
        │ 10 seconds pass...
        │
        ▼
   ┌──────────────────────────────────┐
   │ setInterval triggers              │
   │ Auto-refresh → fetchData()        │
   │                                  │
   │ REPEAT: Go back to GET request  │
   └──────────────────────────────────┘

Continuous cycle:
Fetch → Process → Display → Wait 10sec → Fetch → Process → Display → ...
```

---

## Data Flow Diagram 3: Component Interactions

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Browser)                              │
│                                                                         │
│  ┌──────────────────┐              ┌──────────────────┐               │
│  │  public/         │              │  public/         │               │
│  │  index.html      │              │  register.html   │               │
│  │  (Dashboard)     │              │  (Form)          │               │
│  └────────┬─────────┘              └────────┬─────────┘               │
│           │                                 │                         │
│           │ loads                           │ loads                   │
│           ▼                                 ▼                         │
│  ┌──────────────────────────┐    ┌──────────────────────────┐        │
│  │ public/dashboard.js      │    │ register.html <script>   │        │
│  │ (500 lines, F1 UI logic) │    │ (inline form handler)    │        │
│  └──────────┬───────────────┘    └────────┬─────────────────┘        │
│             │                             │                          │
│  ┌──────────┴─────────────────────────────┴──────────────┐           │
│  │              public/config.js                          │           │
│  │  CONFIG = {                                            │           │
│  │      BACKEND_URL: 'http://localhost:5000'             │           │
│  │      SPREADSHEET_ID: '1iWSJua2nfds...'               │           │
│  │      REFRESH_INTERVAL: 10000                          │           │
│  │  }                                                     │           │
│  └─────────────────────────────────────────────────────────┘          │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
                             ▲ │
                    HTTP API │ │ HTTP API
                             │ ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Node.js)                              │
│                         Port 5000                                      │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ server.js                                                    │    │
│  │ • Express app setup                                         │    │
│  │ • CORS middleware                                           │    │
│  │ • Static file serving                                       │    │
│  │ • Route definitions                                         │    │
│  └──────────┬───────────────────────────────────────────────────┘    │
│             │                                                         │
│  ┌──────────┴───────────────────────────────────────────┐            │
│  │ routes/register.js                                  │            │
│  │ • POST /api/register       (Create registration)   │            │
│  │ • GET /api/register/stats  (Get statistics)        │            │
│  │ • GET /api/register/excel  (Get Google data)       │            │
│  └────────────┬───────────────┬───────────────┬───────┘            │
│               │               │               │                    │
│               ▼               ▼               ▼                    │
│         ┌─────────────┐ ┌─────────────┐ ┌──────────────┐          │
│         │ Save Data   │ │ Aggregate   │ │ Fetch Data  │          │
│         │             │ │             │ │             │          │
│         └──┬───┬──────┘ └──────┬──────┘ └──┬───┬──────┘          │
│            │   │               │           │   │                 │
│            │   └───────────┬───┴─────┬─────┴───┘                 │
│            │               │         │                           │
│       MongoDB          MongoDB   Google                          │
│     (optional)        Query     Sheets                           │
│            │               │         │                           │
│            ▼               ▼         ▼                           │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ googleSheet │  │ models/      │  │ googleSheet.js         │  │
│  │ .js         │  │ Registration │  │ • initSheets()         │  │
│  │             │  │ .js          │  │ • addToExcel()         │  │
│  │ • Append    │  │              │  │ • getAllExcelData()    │  │
│  │   to sheet  │  │ MongoDB      │  │                        │  │
│  │             │  │ Schema       │  │ Google Sheets API      │  │
│  │ • Headers   │  │              │  │ (googleapis package)    │  │
│  └─────────────┘  └──────────────┘  └────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ .env (Configuration)                                        ││
│  │ • SHEET_ID                                                 ││
│  │ • GS_CLIENT_EMAIL                                          ││
│  │ • GS_PRIVATE_KEY                                           ││
│  │ • MONGO_URI (optional)                                     ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
└──────┬───────────────────────────────────────────────────────┬──┘
       │                                                       │
       │ MongoDB API                                  Google Sheets API
       │ (mongoose)                                  (googleapis package)
       │                                                       │
       ▼                                                       ▼
┌─────────────────────┐                          ┌──────────────────────┐
│     MongoDB         │                          │   GOOGLE SHEETS      │
│   (Local)           │                          │                      │
│   (Optional)        │                          │  Sheet ID:           │
│                     │                          │  1iWSJua2nfds...     │
│   Collections:      │                          │                      │
│   • registrations   │                          │  Auto-synced rows:   │
│                     │                          │  • Row 1: Headers    │
│   Fields:           │                          │  • Row 2+: Data      │
│   • name            │                          │                      │
│   • email           │                          │  Columns: A-F        │
│   • team            │                          │  (Name, Email, Team, │
│   • event           │                          │   Event, College,    │
│   • college         │                          │   Timestamp)         │
│   • timestamp       │                          │                      │
│                     │                          │  Real-time updates   │
│   Fallback: Yes     │                          │  Service account auth│
│   (demo mode)       │                          │                      │
└─────────────────────┘                          └──────────────────────┘
```

---

## Connection Matrix

```
Component              Connects To              Via                Protocol
──────────────────────────────────────────────────────────────────────────
Frontend Dashboard  →  Backend Server          HTTP               GET requests
Frontend Form       →  Backend Server          HTTP               POST requests
Backend             →  Google Sheets           Google Sheets API  OAuth 2.0
Backend             →  MongoDB                 Mongoose           Native driver
Google Sheets       ←  Backend Server          Google Sheets API  OAuth 2.0
MongoDB             ←  Backend Server          Mongoose           Native driver
Browser             →  Frontend Files          HTTP               Static content
Browser             →  Browser Storage        LocalStorage       JS API
```

---

## Error Handling Flow

```
┌─────────────────────────────┐
│ API Request Sent            │
│ (Frontend → Backend)        │
└──────────┬──────────────────┘
           │
           ▼
    ┌──────────────────┐
    │ Backend processes│
    └──┬───────────────┘
       │
       ├─ Error in DB?  ─ YES → Fallback to demo data
       │                       │
       │                       └─ Log warning
       │                       └─ Continue with fallback
       │
       ├─ Error in Google Sheets? ─ YES → Fallback to DB
       │                                  │
       │                                  └─ Log warning
       │                                  └─ Continue with fallback
       │
       └─ Success → Return data
              │
              ▼
    ┌──────────────────────────────┐
    │ Frontend receives response   │
    └──┬───────────────────────────┘
       │
       ├─ JSON valid? ─ NO → Show error to user
       │                     Update UI: "Disconnected"
       │
       ├─ Data present? ─ NO → Show "No data available"
       │
       └─ YES → Process & Display
              └─ Update dashboard
              └─ Show "Connected" status
```

---

## Performance Timeline

```
User Action: Submit Registration

Time    Event                          Component
────────────────────────────────────────────────────
0ms     User clicks "Submit"           Frontend
10ms    Form validation                register.html
15ms    JSON serialized                dashboard.js
20ms    HTTP POST initiated            Browser
100ms   Request reaches backend        Network
105ms   Request parsed                 server.js
110ms   Data validated                 routes/register.js
115ms   MongoDB write begins           mongoose
200ms   MongoDB write complete         MongoDB
210ms   Google Sheets API called       googleSheet.js
500ms   Sheets API response received   Google Sheets
505ms   Response sent to frontend      server.js
600ms   Frontend receives response     Browser
605ms   Response parsed                register.html
610ms   "Success" message shown        register.html
615ms   Form cleared                   register.html
1000ms  Auto-refresh triggered         dashboard.js
1005ms  New data fetched               GET /api/register/excel
1500ms  Dashboard updated              dashboard.js

Total: ~1.5 seconds from submission to dashboard update
```

---

## File Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                   User's Browser                            │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    index.html      register.html    config.js
         │               │               │
         ├───────────────┼───────────────┤
         │               │               │
         ▼               ▼               ▼
    dashboard.js   register script   CONFIG object
         │               │
         └───────────────┴────────────────────────┐
                                                  │
                            ┌─────────────────────┴────┐
                            │                          │
                            ▼                          ▼
                         server.js                 googleSheet.js
                            │                          │
         ┌──────────────────┼──────────────────┐       │
         │                  │                  │       │
         ▼                  ▼                  ▼       │
    routes/             models/           .env        │
    register.js    Registration.js         │          │
         │              │                 │          │
         ├──────────────┴─────────────────┴──────────┤
         │                                           │
         ├──────────────────────────────────────────┤
         │                                           │
         ▼                                           ▼
    MongoDB                                  Google Sheets API
    (mongoose)                                (googleapis)
```

---

**Diagram created: January 29, 2026**
**System: TALOS Registration Dashboard v1.0**

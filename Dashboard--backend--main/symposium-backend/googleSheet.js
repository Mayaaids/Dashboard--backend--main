import { google } from "googleapis";

const HEADERS = ["Name", "Email", "Team", "Event", "College", "Timestamp"];
const RANGE = "Sheet1!A:F";
const RANGE_HEADER = "Sheet1!A1:F1";

let sheets = null;
let initialized = false;
let cachedData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 20000; // Cache for 20 seconds to avoid quota limits

export async function initSheets() {
    if (sheets !== null) return true;

    const privateKey = process.env.GS_PRIVATE_KEY;
    if (!privateKey) {
        console.log("⚠️  GS_PRIVATE_KEY not set - Google Sheets integration disabled");
        return false;
    }

    const sheetId = process.env.SHEET_ID;
    if (!sheetId) {
        console.log("⚠️  SHEET_ID not set - Google Sheets integration disabled");
        return false;
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GS_CLIENT_EMAIL,
                private_key: privateKey.includes("\\n") ? privateKey.replace(/\\n/g, "\n") : privateKey,
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        sheets = google.sheets({ version: "v4", auth });
        initialized = true;
        console.log("✅ Google Sheets initialized (Sheet ID:", sheetId, ")");
        return true;
    } catch (err) {
        console.log("⚠️  Failed to initialize Google Sheets:", err.message);
        sheets = null;
        return false;
    }
}

async function ensureHeader() {
    if (!sheets) return;
    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range: RANGE_HEADER,
        });
        const rows = res.data.values || [];
        if (rows.length === 0 || !rows[0] || rows[0].every(c => !String(c || "").trim())) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: process.env.SHEET_ID,
                range: RANGE_HEADER,
                valueInputOption: "USER_ENTERED",
                requestBody: { values: [HEADERS] },
            });
            console.log("✅ Header row written to Sheet1");
        }
    } catch (err) {
        console.log("⚠️  Could not ensure header:", err.message);
    }
}

export async function addToExcel(data) {
    const ready = await initSheets();
    if (!ready || !sheets) {
        console.log("⚠️  Skipping Google Sheets write - not initialized");
        return;
    }

    try {
        await ensureHeader();
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SHEET_ID,
            range: RANGE,
            valueInputOption: "USER_ENTERED",
            insertDataOption: "INSERT_ROWS",
            requestBody: {
                values: [[
                    data.name,
                    data.email,
                    data.team,
                    data.event,
                    data.college,
                    new Date().toLocaleString()
                ]]
            }
        });
        console.log("✅ Row appended to Google Sheets");
    } catch (err) {
        console.log("⚠️  Failed to write to Google Sheets:", err.message);
    }
}

export async function getAllExcelData() {
    try {
        const now = Date.now();
        
        // Return cached data if still fresh (< 20 seconds old)
        if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
            console.log("📦 Returning cached data (", Math.round((now - lastFetchTime) / 1000), "sec old)");
            return cachedData;
        }

        const ready = await initSheets();
        if (!ready || !sheets) {
            console.log("⚠️  Google Sheets not initialized");
            return cachedData || [];
        }

        console.log("📖 Reading from Spreadsheet ID:", process.env.SHEET_ID);
        
        // Get all sheets in the spreadsheet
        const spreadsheetInfo = await sheets.spreadsheets.get({
            spreadsheetId: process.env.SHEET_ID
        });
        
        const allSheets = spreadsheetInfo.data.sheets || [];
        console.log("📊 Found", allSheets.length, "sheets in spreadsheet");
        
        let allData = [];
        let recordCount = 0;
        
        // Read from each sheet (skip Sheet1 which is for new registrations)
        for (const sheet of allSheets) {
            const sheetName = sheet.properties.title;
            
            // Skip Sheet1 (empty registration sheet)
            if (sheetName === "Sheet1") {
                console.log("⏭️  Skipping", sheetName, "(registration sheet)");
                continue;
            }
            
            try {
                const response = await sheets.spreadsheets.values.get({
                    spreadsheetId: process.env.SHEET_ID,
                    range: `${sheetName}!A:F`,
                });
                
                const rows = response.data.values || [];
                console.log(`📄 Sheet "${sheetName}": ${rows.length} rows`);
                
                if (rows.length <= 1) {
                    console.log(`⏭️  Skipping "${sheetName}" (empty or header only)`);
                    continue;
                }
                
                // Build a header index map so we don't depend on column order.
                // Many Google Form sheets are: Timestamp, Name, Email, ...
                const header = (rows[0] || []).map(h => String(h || "").trim().toLowerCase());
                // Debugging: log headers to diagnose missing team leader mapping
                try {
                    console.log(`[GS] Sheet: ${sheetName} headers:`, header);
                } catch (err) {
                    // ignore logging errors in production
                }
                const idxOf = (re) => header.findIndex(h => re.test(h));

                const timestampIdx = idxOf(/timestamp|submitted/);
                const nameIdx = idxOf(/\bname\b|^your\s+name|^name|full\s*name/);
                const emailIdx = idxOf(/email|mail/);
                const teamIdx = idxOf(/team|group/);
                const collegeIdx = idxOf(/college|institution|school|university/);
                const eventIdx = idxOf(/event/);
                // Team leader detection: prefer explicit "name" columns first, then leader-like headers
                let teamLeaderIdx = -1;
                const leaderNameCandidates = [
                    'team leader name',
                    'leader name',
                    'captain name',
                    'participant name',
                    'full name',
                    'name'
                ];
                for (const cand of leaderNameCandidates) {
                    const idx = header.findIndex(h => h.includes(cand) && !h.includes('email'));
                    if (idx !== -1) { teamLeaderIdx = idx; break; }
                }
                if (teamLeaderIdx === -1) {
                    teamLeaderIdx = header.findIndex(h => /(leader|captain|head|coordinator|contact)/.test(h) && !/email/.test(h));
                }
                const teamLeaderEmailIdx = header.findIndex(h => h.includes('team leader email') || /leader.*email|\bemail\b|mail/.test(h));
                // Debugging: log detected indices
                try {
                    console.log(`[GS] ${sheetName} -> teamLeaderIdx=${teamLeaderIdx}, teamLeaderEmailIdx=${teamLeaderEmailIdx}`);
                } catch (err) {}

                // Process data from this sheet (skip header).
                // Event display name comes from the sheet/tab name:
                // e.g. "Event - PIXORA"  -> event = "PIXORA"
                //      "Workshop - MindTrace - AI in Cybersecurity" -> event = "MindTrace - AI in Cybersecurity"
                const eventType = sheetName.includes(" - ") ? sheetName.split(" - ")[0] : "";
                const displayEventName = sheetName.includes(" - ")
                    ? sheetName.split(" - ").slice(1).join(" - ")
                    : sheetName;

                const sheetData = rows.slice(1).map((row, idx) => {
                    const pick = (i) => (i >= 0 && row[i] !== undefined ? String(row[i] ?? "").trim() : "");

                    const timestamp = pick(timestampIdx);
                    const name = pick(nameIdx);
                    const email = pick(emailIdx);
                    const team = pick(teamIdx);
                    const college = pick(collegeIdx);
                    const eventMeta = pick(eventIdx);
                    const teamLeader = pick(teamLeaderIdx);
                    const teamLeaderEmail = pick(teamLeaderEmailIdx);

                    // Frontend expects a fixed 6-column raw array: Name, Email, Team, Event, College, Timestamp
                    const raw = [
                        name || "N/A",
                        email || "N/A",
                        team || "N/A",
                        displayEventName,
                        college || "N/A",
                        timestamp || ""
                    ];

                    return {
                        id: `${sheetName}-${idx + 1}`,
                        name: raw[0],
                        email: raw[1],
                        team: raw[2],
                        event: raw[3], // IMPORTANT: event name = cleaned tab name (e.g. "PIXORA")
                        college: raw[4],
                        timestamp: raw[5],
                        teamLeader: teamLeader || "Not Assigned",
                        teamLeaderEmail: teamLeaderEmail || "",
                        sheet: sheetName,
                        eventType,
                        eventMeta,
                        raw
                    };
                });
                
                allData = allData.concat(sheetData);
                recordCount += sheetData.length;
                console.log(`✅ Added ${sheetData.length} records from "${sheetName}"`);
            } catch (sheetErr) {
                console.log(`⚠️  Could not read from "${sheetName}":`, sheetErr.message);
            }
        }
        
        console.log(`✅ Total: ${recordCount} records from ${allData.length > 0 ? 'multiple sheets' : 'no sheets'}`);
        
        // Cache the results for next 20 seconds
        cachedData = allData;
        lastFetchTime = Date.now();
        
        return allData;
    } catch (err) {
        console.log("❌ Google Sheets error:", err.message);
        return cachedData || [];
    }
}

// Delete a record by its generated id (format: "<SheetName>-<rowIndex>")
export async function deleteRecordById(id) {
    if (!id || typeof id !== 'string') return false;

    const parts = id.split('-');
    if (parts.length < 2) return false;

    const rowIndexStr = parts.pop();
    const sheetName = parts.join('-');
    const rowNum = parseInt(rowIndexStr, 10);
    if (isNaN(rowNum)) return false;

    try {
        const ready = await initSheets();
        if (!ready || !sheets) {
            console.log('⚠️  Google Sheets not initialized for delete');
            return false;
        }

        // Get spreadsheet info to find sheetId
        const spreadsheetInfo = await sheets.spreadsheets.get({ spreadsheetId: process.env.SHEET_ID });
        const sheetMeta = (spreadsheetInfo.data.sheets || []).find(s => s.properties && s.properties.title === sheetName);
        if (!sheetMeta) {
            console.log('⚠️  Could not find sheet for', sheetName);
            return false;
        }

        const sheetId = sheetMeta.properties.sheetId;

        // Calculate actual row index in sheet (header row at 1)
        const actualRow = rowNum + 1; // since rowNum was created as idx+1 from slice(1)
        const startIndex = actualRow - 1; // zero-based
        const endIndex = startIndex + 1;

        const requests = [
            {
                deleteDimension: {
                    range: {
                        sheetId: sheetId,
                        dimension: 'ROWS',
                        startIndex: startIndex,
                        endIndex: endIndex
                    }
                }
            }
        ];

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: process.env.SHEET_ID,
            requestBody: { requests }
        });

        // invalidate cache
        cachedData = null;
        lastFetchTime = 0;

        console.log('✅ Deleted row', id, 'from sheet', sheetName);
        return true;
    } catch (err) {
        console.log('❌ Failed to delete record:', err.message);
        return false;
    }
}

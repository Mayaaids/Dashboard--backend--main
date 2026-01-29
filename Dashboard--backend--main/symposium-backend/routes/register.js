import express from "express";
import Registration from "../models/Registration.js";
import { addToExcel, getAllExcelData } from "../googleSheet.js";

const router = express.Router();

// In-memory mock data for demo
let mockRegistrations = [
    { team: "Team A", count: 12 },
    { team: "Team B", count: 8 },
    { team: "Team C", count: 15 },
    { team: "Team D", count: 10 }
];

// Register user
router.post("/", async (req, res) => {
    try {
        const registrationData = {
            name: req.body.name || "Unknown",
            email: req.body.email || "unknown@example.com",
            team: req.body.team || "Unknown",
            event: req.body.event || "Unknown",
            college: req.body.college || "Unknown"
        };

        // Try to save to MongoDB
        try {
            await Registration.create(registrationData);
            console.log("✅ Registration saved to MongoDB");
        } catch (dbErr) {
            console.log("⚠️  MongoDB unavailable, storing in memory");
            const existing = mockRegistrations.find(t => t.team === registrationData.team);
            if (existing) {
                existing.count++;
            } else {
                mockRegistrations.push({ team: registrationData.team, count: 1 });
            }
        }

        // Try to save to Google Sheets (only when WRITE_TO_SHEETS env var is 'true')
        try {
            if (process.env.WRITE_TO_SHEETS === 'true') {
                await addToExcel(registrationData);
                console.log("✅ Data added to Google Sheets");
            } else {
                console.log("ℹ️  Skipping Google Sheets write (WRITE_TO_SHEETS != 'true')");
            }
        } catch (sheetErr) {
            console.log("⚠️  Google Sheets unavailable:", sheetErr.message);
        }

        res.status(201).json({
            success: true,
            message: "Registration successful",
            data: registrationData
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Dashboard stats
router.get("/stats", async (req, res) => {
    try {
        // Use timeout to prevent hanging connections
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Database timeout')), 5000)
        );

        const promise = (async () => {
            const total = await Registration.countDocuments().limit(1);
            const teamWise = await Registration.aggregate([
                { $group: { _id: "$team", count: { $sum: 1 } } },
                { $limit: 50 }  // Limit results
            ]);
            return { total, teamWise };
        })();

        const { total, teamWise } = await Promise.race([promise, timeout]);
        res.json({ total, teamWise });
    } catch (dbErr) {
        // Return mock data if MongoDB is unavailable or timeout
        const total = mockRegistrations.reduce((sum, team) => sum + team.count, 0);
        const teamWise = mockRegistrations.map(team => ({ _id: team.team, count: team.count }));

        console.log("⚠️  Using mock data for stats");
        res.json({ total, teamWise });
    }
});

// Get all Excel/Google Sheets data
router.get("/excel", async (req, res) => {
    try {
        // Try to get data from Google Sheets first
        const excelData = await getAllExcelData();
        console.log("📊 Received", excelData ? excelData.length : 0, "records from Google Sheets");

        if (excelData && excelData.length > 0) {
            console.log("✅ Sending real Google Sheets data");
            res.json({
                success: true,
                data: excelData,
                total: excelData.length,
                source: "google-sheets"
            });
        } else {
            // Fallback to mock data if Google Sheets is empty
            console.log("⚠️  Using mock data fallback");
            const total = mockRegistrations.reduce((sum, team) => sum + team.count, 0);
            const data = mockRegistrations.map((team, idx) => {
                const name = `${team.team} Member`, email = 'user@example.com', college = 'Unknown', ts = new Date().toLocaleString();
                return {
                    id: idx + 1,
                    name,
                    email,
                    team: team.team,
                    event: team.team,
                    college,
                    timestamp: ts,
                    count: team.count,
                    raw: [name, email, team.team, team.team, college, ts]
                };
            });

            res.json({
                success: true,
                data: data,
                total: total,
                source: "mock-data"
            });
        }
    } catch (err) {
        console.log("❌ Error in /excel endpoint:", err.message);
        const total = mockRegistrations.reduce((sum, team) => sum + team.count, 0);
        const data = mockRegistrations.map((team, idx) => {
            const name = `${team.team} Member`, email = 'user@example.com', college = 'Unknown', ts = new Date().toLocaleString();
            return {
                id: idx + 1,
                name,
                email,
                team: team.team,
                event: team.team,
                college,
                timestamp: ts,
                count: team.count,
                raw: [name, email, team.team, team.team, college, ts]
            };
        });
        res.json({
            success: true,
            data: data,
            total: total,
            source: "mock-data"
        });
    }
});

// Delete a registration by generated id
router.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { deleteRecordById } = await import('../googleSheet.js');
        const ok = await deleteRecordById(id);
        if (ok) {
            res.json({ success: true, id });
        } else {
            res.status(500).json({ success: false, message: 'Failed to delete record' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;

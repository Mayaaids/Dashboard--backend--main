import express from "express";
import Registration from "../models/Registration.js";
import { addToExcel, getAllExcelData } from "../googleSheet.js";

const router = express.Router();

// In-memory mock data for demo - with event names and scores
let mockRegistrations = [
    { name: "Alice Johnson", email: "alice@mit.edu", team: "Team A", event: "Blockchain", college: "MIT", score: 100, timestamp: new Date().toISOString() },
    { name: "Bob Smith", email: "bob@stanford.edu", team: "Team A", event: "Blockchain", college: "Stanford", score: 100, timestamp: new Date().toISOString() },
    { name: "Carol Davis", email: "carol@iit.ac.in", team: "Team B", event: "BYOG", college: "IIT Delhi", score: 100, timestamp: new Date().toISOString() },
    { name: "David Wilson", email: "david@mit.edu", team: "Team B", event: "Mind Trace", college: "MIT", score: 100, timestamp: new Date().toISOString() },
    { name: "Eve Martinez", email: "eve@stanford.edu", team: "Team C", event: "MCP&AI", college: "Stanford", score: 100, timestamp: new Date().toISOString() },
    { name: "Frank Brown", email: "frank@berkeley.edu", team: "Team C", event: "Spiking Neural Networks", college: "UC Berkeley", score: 100, timestamp: new Date().toISOString() },
    { name: "Grace Lee", email: "grace@mit.edu", team: "Team D", event: "Crime Trace", college: "MIT", score: 300, timestamp: new Date().toISOString() },
    { name: "Henry Chen", email: "henry@stanford.edu", team: "Team D", event: "Cyber Hunt", college: "Stanford", score: 300, timestamp: new Date().toISOString() },
    { name: "Ivy Patel", email: "ivy@iit.ac.in", team: "Team A", event: "Code Sprint", college: "IIT Bombay", score: 300, timestamp: new Date().toISOString() },
    { name: "Jack Wilson", email: "jack@mit.edu", team: "Team B", event: "Innovation Challenge", college: "MIT", score: 300, timestamp: new Date().toISOString() }
];

// Register user
router.post("/", async (req, res) => {
    try {
        // Define event scores
        const eventScores = {
            'Blockchain': 100,
            'BYOG': 100,
            'Mind Trace': 100,
            'MCP': 100,
            'MCP&AI': 100,
            'Spiking Neural Networks': 100,
            'spiking neural networks': 100
        };

        // Function to get score for event
        const getEventScore = (eventName) => {
            const lowerEventName = String(eventName).toLowerCase().trim();
            
            for (const [key] of Object.entries(eventScores)) {
                if (lowerEventName === key.toLowerCase()) {
                    return 100;
                }
            }
            
            if (lowerEventName.includes('blockchain')) return 100;
            if (lowerEventName.includes('byog')) return 100;
            if (lowerEventName.includes('mind trace')) return 100;
            if (lowerEventName.includes('mcp')) return 100;
            if (lowerEventName.includes('spiking neural')) return 100;
            
            return 300;
        };

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
            const data = mockRegistrations;
            const total = data.length;

            res.json({
                success: true,
                data: data,
                total: total,
                source: "mock-data"
            });
        }
    } catch (err) {
        console.log("❌ Error in /excel endpoint:", err.message);
        const data = mockRegistrations;
        const total = data.length;
        res.json({
            success: true,
            data: data,
            total: total,
            source: "mock-data"
        });
    }
});

// Analytics endpoint - total participants, events breakdown, participant details
router.get("/analytics", async (req, res) => {
    try {
        console.log("🔍 Analytics endpoint called");
        let excelData = await getAllExcelData();
        console.log("📊 Analytics: Received", excelData ? excelData.length : 0, "records");

        // Use mock data if Google Sheets returns nothing
        if (!excelData || excelData.length === 0) {
            console.log("⚠️  No Google Sheets data, using mock data for analytics");
            excelData = mockRegistrations;
        }

        // Define event scores
        const eventScores = {
            'Blockchain': 100,
            'BYOG': 100,
            'Mind Trace': 100,
            'MCP': 100,
            'MCP&AI': 100,
            'Spiking Neural Networks': 100,
            'spiking neural networks': 100
        };

        // Function to get score for event
        const getEventScore = (eventName) => {
            const lowerEventName = String(eventName).toLowerCase().trim();
            
            for (const [key, score] of Object.entries(eventScores)) {
                if (lowerEventName === key.toLowerCase()) {
                    return score;
                }
            }
            
            if (lowerEventName.includes('blockchain')) return 100;
            if (lowerEventName.includes('byog')) return 100;
            if (lowerEventName.includes('mind trace')) return 100;
            if (lowerEventName.includes('mcp')) return 100;
            if (lowerEventName.includes('spiking neural')) return 100;
            
            return 300;
        };

        // Build event statistics
        const eventStats = {};
        const eventDetails = {};

        console.log("🔄 Processing", excelData.length, "records");
        excelData.forEach((participant, idx) => {
            if (idx < 3) console.log(`   Sample ${idx}:`, participant.event, participant.name);
            
            const eventName = (participant.event && String(participant.event).trim().length > 0)
                ? String(participant.event).trim()
                : 'Unknown Event';

            if (!eventStats[eventName]) {
                eventStats[eventName] = 0;
                eventDetails[eventName] = [];
            }

            eventStats[eventName]++;
            
            eventDetails[eventName].push({
                name: participant.name || 'N/A',
                email: participant.email || 'N/A',
                college: participant.college || 'N/A',
                team: participant.team || 'N/A',
                timestamp: participant.timestamp || '',
                teamLeader: participant.teamLeader || participant.name || 'N/A',
                teamLeaderEmail: participant.teamLeaderEmail || participant.email || 'N/A'
            });
        });

        // Sort events by count (descending)
        const sortedEvents = Object.entries(eventStats)
            .map(([name, count]) => {
                // Get multiplier for event (100 for special, 300 for others)
                const multiplier = (
                    name.toLowerCase().includes('blockchain') ||
                    name.toLowerCase().includes('byog') ||
                    name.toLowerCase().includes('mind trace') ||
                    name.toLowerCase().includes('mcp') ||
                    name.toLowerCase().includes('spiking neural')
                ) ? 100 : 300;
                
                // Format score as "count/multiplier" (e.g., "43/100" or "198/300")
                const score = `${count}/${multiplier}`;
                
                return {
                    name,
                    count,
                    multiplier,
                    score,  // e.g., "43/100" or "198/300"
                    participants: eventDetails[name] || []
                };
            })
            .sort((a, b) => {
                // Parse scores for proper sorting
                const scoreA = a.count / a.multiplier;
                const scoreB = b.count / b.multiplier;
                return scoreB - scoreA;
            });

        console.log("✅ Built", sortedEvents.length, "events, total:", excelData.length);

        res.json({
            success: true,
            totalParticipants: excelData.length,
            events: sortedEvents,
            eventDetails: eventDetails
        });

    } catch (err) {
        console.log("❌ Error in /analytics endpoint:", err.message);
        res.status(500).json({
            success: false,
            error: err.message,
            totalParticipants: 0,
            events: [],
            eventDetails: {}
        });
    }
});

// Debug endpoint - list all sheets and row counts
router.get("/debug/sheets", async (req, res) => {
    try {
        const { getAllExcelData } = await import('../googleSheet.js');
        const allData = await getAllExcelData();
        res.json({
            totalRecords: allData.length,
            data: allData.slice(0, 5) // First 5 records as sample
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
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

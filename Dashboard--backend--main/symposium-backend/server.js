import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import registerRoute from "./routes/register.js";
import { initSheets } from "./googleSheet.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection with extended timeout
const mongoConnectWithTimeout = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { 
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            retryWrites: true,
            w: 'majority'
        });
        console.log("✅ MongoDB connected");
        return true;
    } catch (err) {
        console.log("⚠️  MongoDB connection failed. Running in DEMO mode with mock data.");
        console.log("   Error:", err.message);
        console.log("   You can still test the API - it will return sample data.");
        return false;
    }
};

// Initialize MongoDB with timeout
let dbConnected = false;
mongoConnectWithTimeout().then(connected => {
    dbConnected = connected;
});

// Initialize Google Sheets on startup
initSheets().catch(err => {
    console.log("⚠️  Google Sheets initialization deferred to first request");
});

app.use("/api/register", registerRoute);

// Registration form page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Serve index.html for root (dashboard)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(5000, () => {
    console.log("🚀 Server running on port 5000");
    console.log("📊 Dashboard:  http://localhost:5000");
    console.log("📝 Register:   http://localhost:5000/register");
    console.log("📈 API:        http://localhost:5000/api/register (GET /excel, /stats | POST /)");
});

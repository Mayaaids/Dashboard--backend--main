import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import registerRoute from "./routes/register.js";
import { initSheets } from "./googleSheet.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from symposium-backend directory
dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();

// Login credentials
const VALID_USERNAME = 'talos';
const VALID_PASSWORD = 'talos5';

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
function requireAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token && token === 'TALOS_SESSION_TOKEN_12345') {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
}

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

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        res.json({
            success: true,
            message: 'Login successful',
            token: 'TALOS_SESSION_TOKEN_12345'
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
    }
});

// Login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Dashboard:  http://localhost:${PORT}`);
    console.log(`📝 Register:   http://localhost:${PORT}/register`);
    console.log(`📈 API:        http://localhost:${PORT}/api/register (GET /excel, /stats | POST /)`);
});

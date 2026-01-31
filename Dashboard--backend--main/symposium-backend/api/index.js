import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import registerRoute from "../routes/register.js";
import { initSheets } from "../googleSheet.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from symposium-backend directory (parent of api/)
dotenv.config({ path: path.join(__dirname, '..', '.env') });
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoConnectWithTimeout = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { 
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        return true;
    } catch (err) {
        console.log("Running in DEMO mode");
        return false;
    }
};

let dbConnected = false;
mongoConnectWithTimeout().then(connected => {
    dbConnected = connected;
});

initSheets().catch(err => {
    console.log("Google Sheets deferred");
});

app.use("/api/register", registerRoute);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Register form
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'register.html'));
});

// Dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

export default app;

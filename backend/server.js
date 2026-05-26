import express from "express";
import cors from "cors";
import connectToDb from "./db/db.js";
import dotenv from "dotenv";
import busRouter from './routes/bus.Routes.js'
import reportRouter from './routes/report.routes.js'
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/bus', busRouter);
app.use('/api/report', reportRouter)

// Serve frontend static files in production if dist exists
const frontendDistPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    app.get("/{*path}", (req, res) => {
        res.sendFile(path.join(frontendDistPath, "index.html"));
    });
}

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    connectToDb();
    console.log(`✅ Server is running on port ${PORT}`)
})
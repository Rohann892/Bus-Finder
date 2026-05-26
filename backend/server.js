import express from "express";
import cors from "cors";
import connectToDb from "./db/db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());


app.listen(process.env.PORT || 8000, () => {
    connectToDb();
    console.log(`✅ Server is running on port ${process.env.PORT}`)
})
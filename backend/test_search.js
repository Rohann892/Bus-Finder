import mongoose from "mongoose";
import dotenv from "dotenv";
import Route from "./models/routeSchema.js";
import { findJourney } from "./algorithm/bfs.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to DB");

    const routes = await Route.find({});
    console.log(`Loaded ${routes.length} routes.`);

    const from = "Chunavati";
    const to = "Howrah Station";

    const journeys = findJourney(from, to, routes);
    console.log("Direct routes count:", journeys.direct.length);
    console.log("One-change routes count:", journeys.oneChange.length);
    console.log("Two-change routes count:", journeys.twoChange.length);

    if (journeys.direct.length > 0) {
        console.log("First Direct Route:", journeys.direct[0].map(s => `${s.stop} (Bus ${s.bus})`).join(" -> "));
    }

    await mongoose.disconnect();
}

run().catch(console.error);

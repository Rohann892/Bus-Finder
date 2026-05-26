import mongoose from "mongoose";
import dotenv from "dotenv";
import Route from "../models/routeSchema.js";
import Stop from "../models/StopSchema.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined in your environment variables.");
    process.exit(1);
}

const seedDatabase = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Clear existing data (optional but recommended for a clean seed)
        console.log("Clearing existing Routes and Stops...");
        await Route.deleteMany({});
        await Stop.deleteMany({});
        console.log("✅ Collections cleared");

        console.log("Fetching bus data from GitHub repository...");
        const response = await fetch("https://raw.githubusercontent.com/Akash190104/kolkata-bus-route/master/busdata.json");
        if (!response.ok) {
            throw new Error(`Failed to fetch bus data: ${response.statusText}`);
        }
        const data = await response.json();
        const routesData = data.routes;

        console.log(`Found ${routesData.length} routes. Processing...`);

        const uniqueStopNames = new Set();
        const routesToInsert = [];

        for (const route of routesData) {
            // Map the JSON structure to our Route model
            routesToInsert.push({
                routeNumber: route.code,
                routeName: `${route.stops[0]} to ${route.stops[route.stops.length - 1]} (${route.kind})`,
                stops: route.stops,
                schedule: {
                    firstBus: "05:00",
                    lastBus: "21:00",
                    frequency: 15 // minutes
                },
                avgTimePerStop: 3 // default 3 minutes per stop
            });

            // Gather all unique stops
            for (const stopName of route.stops) {
                uniqueStopNames.add(stopName.trim());
            }
        }

        console.log("Inserting Routes into database...");
        await Route.insertMany(routesToInsert);
        console.log(`✅ Successfully seeded ${routesToInsert.length} Routes`);

        console.log(`Generating coordinates for ${uniqueStopNames.size} unique Stops...`);
        
        // Kolkata center coordinates
        const KOLKATA_LON = 88.3639;
        const KOLKATA_LAT = 22.5726;

        const stopsToInsert = Array.from(uniqueStopNames).map((stopName) => {
            // Jitter coordinates slightly around Kolkata center to distribute stops
            const jitterLon = (Math.random() - 0.5) * 0.15;
            const jitterLat = (Math.random() - 0.5) * 0.15;

            return {
                name: stopName,
                location: {
                    type: "Point",
                    coordinates: [KOLKATA_LON + jitterLon, KOLKATA_LAT + jitterLat]
                }
            };
        });

        console.log("Inserting Stops into database...");
        await Stop.insertMany(stopsToInsert);
        console.log(`✅ Successfully seeded ${stopsToInsert.length} Stops`);

        console.log("🎉 Database seeding completed successfully!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
};

seedDatabase();

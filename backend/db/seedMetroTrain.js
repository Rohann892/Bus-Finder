/**
 * seedMetroTrain.js
 *
 * Seeds Kolkata Metro and Suburban Train routes + stops into MongoDB.
 * Run ONCE with:  node --experimental-vm-modules db/seedMetroTrain.js
 * (or just:       node db/seedMetroTrain.js  if using Node 20+)
 *
 * ⚠️  Does NOT delete existing bus routes — only APPENDS metro/train data.
 *      If you re-run it, duplicate route documents will appear; delete first
 *      with:  db.routes.deleteMany({ mode: { $in: ['metro','train'] } })
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Route from "../models/routeSchema.js";
import Stop  from "../models/StopSchema.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined in .env");
    process.exit(1);
}

// ─── Kolkata Metro Lines ──────────────────────────────────────────────────────
// Coordinates: [longitude, latitude]  (GeoJSON order)

const METRO_ROUTES = [
    {
        routeNumber: "KM-BLUE",
        routeName: "Kolkata Metro Blue Line – Dakshineswar to Kavi Subhas",
        mode: "metro",
        schedule: { firstBus: "06:50", lastBus: "21:45", frequency: 10 },
        avgTimePerStop: 3,
        stops: [
            "Dakshineswar",
            "Baranagar Metro",
            "Noapara",
            "Dunlop",
            "Belgachhia",
            "Shyambazar Metro",
            "Shobhabazar Sutanuti",
            "Girish Park",
            "MG Road Metro",
            "Central Metro",
            "Chandni Chowk Metro",
            "Esplanade Metro",
            "Park Street Metro",
            "Maidan Metro",
            "Rabindra Sadan",
            "Netaji Bhavan",
            "Jatin Das Park",
            "Kalighat Metro",
            "Tollygunge Metro",
            "Mahanayak Uttam Kumar",
            "Netaji Metro",
            "Master Da Surya Sen",
            "Shahid Khudiram",
            "Kavi Nazrul",
            "Shitala Mandir",
            "Kavi Subhas",
        ],
    },
    {
        routeNumber: "KM-GREEN",
        routeName: "Kolkata Metro Green Line – Howrah Maidan to Sector V",
        mode: "metro",
        schedule: { firstBus: "07:00", lastBus: "21:00", frequency: 12 },
        avgTimePerStop: 4,
        stops: [
            "Howrah Maidan",
            "Howrah Metro",
            "Mahakaran",
            "Central Metro",  // interchange with Blue Line
            "Sealdah Metro",
            "Phoolbagan",
            "Shyambazar Metro", // interchange
            "Salt Lake Sector V",
        ],
    },
];

// ─── Kolkata Suburban Train Routes ───────────────────────────────────────────

const TRAIN_ROUTES = [
    {
        routeNumber: "ER-SEALDAH-SSTPL",
        routeName: "Sealdah – Sonarpur Local (Eastern Railway)",
        mode: "train",
        schedule: { firstBus: "05:00", lastBus: "23:00", frequency: 20 },
        avgTimePerStop: 5,
        stops: [
            "Sealdah",
            "Ballygunge",
            "Dhakuria",
            "Jadavpur",
            "Santoshpur",
            "Sonarpur",
        ],
    },
    {
        routeNumber: "ER-SEALDAH-BPPL",
        routeName: "Sealdah – Baruipur Local (Eastern Railway)",
        mode: "train",
        schedule: { firstBus: "05:10", lastBus: "22:40", frequency: 25 },
        avgTimePerStop: 5,
        stops: [
            "Sealdah",
            "Ballygunge",
            "Dhakuria",
            "Jadavpur",
            "Santoshpur",
            "Sonarpur",
            "Subhasgram",
            "Baruipur",
        ],
    },
    {
        routeNumber: "SER-HOWRAH-SDAH",
        routeName: "Howrah – Sealdah via Circular (South Eastern Railway)",
        mode: "train",
        schedule: { firstBus: "05:20", lastBus: "22:00", frequency: 30 },
        avgTimePerStop: 6,
        stops: [
            "Howrah",
            "Shalimar",
            "Santragachi",
            "Ramrajatala",
            "Bagnan",
            "Uluberia",
            "Shyampur",
            "Sealdah",
        ],
    },
    {
        routeNumber: "ER-HOWRAH-BRDM",
        routeName: "Howrah – Burdwan Main Line (Eastern Railway)",
        mode: "train",
        schedule: { firstBus: "05:00", lastBus: "21:30", frequency: 30 },
        avgTimePerStop: 7,
        stops: [
            "Howrah",
            "Liluah",
            "Bally",
            "Uttarpara",
            "Kotrung",
            "Bhadreswar",
            "Chandannagar",
            "Chinsurah",
            "Bandel",
            "Burdwan",
        ],
    },
    {
        routeNumber: "ER-SEALDAH-BNGL",
        routeName: "Sealdah – Barasat – Bangaon Local",
        mode: "train",
        schedule: { firstBus: "05:15", lastBus: "22:00", frequency: 20 },
        avgTimePerStop: 5,
        stops: [
            "Sealdah",
            "Dum Dum",
            "Dum Dum Cantonment",
            "Barasat",
            "Habra",
            "Bangaon",
        ],
    },
];

// ─── Stop coordinate overrides (approximate real coordinates) ─────────────────
// Format: "Stop Name": [longitude, latitude]

const KNOWN_COORDS = {
    // Metro Blue Line
    "Dakshineswar":            [88.3568, 22.6359],
    "Baranagar Metro":         [88.3746, 22.6371],
    "Noapara":                 [88.3820, 22.6297],
    "Dunlop":                  [88.3726, 22.6256],
    "Belgachhia":              [88.3680, 22.6088],
    "Shyambazar Metro":        [88.3724, 22.5990],
    "Shobhabazar Sutanuti":    [88.3700, 22.5929],
    "Girish Park":             [88.3671, 22.5876],
    "MG Road Metro":           [88.3636, 22.5831],
    "Central Metro":           [88.3545, 22.5745],
    "Chandni Chowk Metro":     [88.3508, 22.5714],
    "Esplanade Metro":         [88.3486, 22.5690],
    "Park Street Metro":       [88.3519, 22.5534],
    "Maidan Metro":            [88.3453, 22.5526],
    "Rabindra Sadan":          [88.3472, 22.5448],
    "Netaji Bhavan":           [88.3474, 22.5378],
    "Jatin Das Park":          [88.3499, 22.5265],
    "Kalighat Metro":          [88.3437, 22.5182],
    "Tollygunge Metro":        [88.3428, 22.5058],
    "Mahanayak Uttam Kumar":   [88.3415, 22.4967],
    "Netaji Metro":            [88.3408, 22.4881],
    "Master Da Surya Sen":     [88.3403, 22.4784],
    "Shahid Khudiram":         [88.3371, 22.4684],
    "Kavi Nazrul":             [88.3312, 22.4609],
    "Shitala Mandir":          [88.3243, 22.4572],
    "Kavi Subhas":             [88.3185, 22.4539],

    // Metro Green Line extras
    "Howrah Maidan":           [88.3278, 22.5831],
    "Howrah Metro":            [88.3300, 22.5849],
    "Mahakaran":               [88.3395, 22.5670],
    "Sealdah Metro":           [88.3701, 22.5659],
    "Phoolbagan":              [88.3895, 22.5629],
    "Salt Lake Sector V":      [88.4400, 22.5767],

    // Train stops
    "Sealdah":                 [88.3701, 22.5657],
    "Ballygunge":              [88.3665, 22.5257],
    "Dhakuria":                [88.3682, 22.5124],
    "Jadavpur":                [88.3718, 22.4983],
    "Santoshpur":              [88.3888, 22.4893],
    "Sonarpur":                [88.4262, 22.4513],
    "Subhasgram":              [88.4417, 22.4339],
    "Baruipur":                [88.4515, 22.4218],
    "Howrah":                  [88.3119, 22.5855],
    "Shalimar":                [88.2947, 22.5591],
    "Santragachi":             [88.2823, 22.5790],
    "Ramrajatala":             [88.2639, 22.5876],
    "Bagnan":                  [87.9619, 22.4665],
    "Uluberia":                [87.9727, 22.4718],
    "Shyampur":                [88.0195, 22.4921],
    "Liluah":                  [88.3283, 22.6023],
    "Bally":                   [88.3252, 22.6198],
    "Uttarpara":               [88.3207, 22.6630],
    "Kotrung":                 [88.3170, 22.6888],
    "Bhadreswar":              [88.3016, 22.7105],
    "Chandannagar":            [88.3679, 22.8672],
    "Chinsurah":               [88.3897, 22.8985],
    "Bandel":                  [88.3794, 23.0027],
    "Burdwan":                 [87.8570, 23.2337],
    "Dum Dum":                 [88.3988, 22.6414],
    "Dum Dum Cantonment":      [88.4087, 22.6528],
    "Barasat":                 [88.4820, 22.7241],
    "Habra":                   [88.6574, 22.8416],
    "Bangaon":                 [88.8313, 23.0436],
};

// ─── Seed ────────────────────────────────────────────────────────────────────

const KOLKATA_LON = 88.3639;
const KOLKATA_LAT = 22.5726;

const seedMetroTrain = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected");

        const allRoutes = [...METRO_ROUTES, ...TRAIN_ROUTES];

        // Collect all stop names needed
        const allStopNames = new Set();
        for (const r of allRoutes) r.stops.forEach(s => allStopNames.add(s));

        // ── Insert Routes ────────────────────────────────────────────────────
        console.log(`\nInserting ${allRoutes.length} metro/train routes...`);
        await Route.insertMany(allRoutes);
        console.log(`✅ Routes inserted`);

        // ── Insert Stops (skip duplicates by name) ───────────────────────────
        // Find which stop names already exist
        const existing = await Stop.find(
            { name: { $in: Array.from(allStopNames) } },
            "name"
        );
        const existingNames = new Set(existing.map(s => s.name));
        const newStopNames  = [...allStopNames].filter(n => !existingNames.has(n));

        console.log(
            `\n${existingNames.size} stops already exist — inserting ${newStopNames.length} new stops...`
        );

        if (newStopNames.length > 0) {
            const stopsToInsert = newStopNames.map(name => {
                const coords = KNOWN_COORDS[name];
                return {
                    name,
                    location: {
                        type: "Point",
                        coordinates: coords
                            ? coords
                            : [
                                KOLKATA_LON + (Math.random() - 0.5) * 0.15,
                                KOLKATA_LAT + (Math.random() - 0.5) * 0.15,
                              ],
                    },
                    // Determine mode from which route this stop belongs to
                    mode: METRO_ROUTES.some(r => r.stops.includes(name))
                        ? "metro"
                        : "train",
                };
            });

            await Stop.insertMany(stopsToInsert);
            console.log(`✅ ${stopsToInsert.length} stops inserted`);
        }

        // ── Update mode on stops that already existed but need updating ───────
        // (Only if the stop was previously inserted without a mode.)
        const metroStopNames = new Set(METRO_ROUTES.flatMap(r => r.stops));
        const trainStopNames = new Set(TRAIN_ROUTES.flatMap(r => r.stops));

        for (const name of existingNames) {
            const newMode = metroStopNames.has(name)
                ? "metro"
                : trainStopNames.has(name)
                ? "train"
                : null;
            if (newMode) {
                await Stop.updateOne({ name }, { $set: { mode: newMode } });
            }
        }
        if (existingNames.size > 0) {
            console.log(`✅ Updated mode on ${existingNames.size} pre-existing stops`);
        }

        console.log("\n🎉 Metro & Train seeding complete!");
        console.log("\nRoutes added:");
        allRoutes.forEach(r => console.log(`  [${r.mode.toUpperCase()}] ${r.routeNumber} — ${r.routeName}`));

    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\nDisconnected from MongoDB");
    }
};

seedMetroTrain();

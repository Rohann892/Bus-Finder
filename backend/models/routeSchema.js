import mongoose from "mongoose";


const ScheduleSchema = new mongoose.Schema({
    firstBus: String,
    lastBus: String,
    frequency: Number
})

const routeSchema = new mongoose.Schema({
    routeNumber: {
        type: String
    },
    routeName: {
        type: String
    },
    stops: [String],
    schedule: ScheduleSchema,
    avgTimePerStop: Number,
})

const Route = mongoose.model("Route", routeSchema);
export default Route;
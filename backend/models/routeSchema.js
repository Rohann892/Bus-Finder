import mongoose from "mongoose";

const routeSchema = new mongoose.Schema({
    routeNumber: {
        type: String
    },
    routeName: {
        type: String
    },
    stops: [String],
})

const Route = mongoose.model("Route", routeSchema);
export default Route;
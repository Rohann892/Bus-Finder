import mongoose from "mongoose";

const stopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
})

stopSchema.index({ location: "2dsphere" });

const Stop = mongoose.model("Stop", stopSchema);
export default Stop;
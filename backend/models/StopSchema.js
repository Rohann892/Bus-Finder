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
    },
    mode: {
        type: String,
        enum: ['bus', 'metro', 'train'],
        default: 'bus'
    }
})

stopSchema.index({ location: "2dsphere" });

const Stop = mongoose.model("Stop", stopSchema);
export default Stop;
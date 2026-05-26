import mongoose, { mongo } from "mongoose";

const reportSchema = new mongoose.Schema({
    routeNumber: {
        type: String,
        required: true,
    },
    issueType: {
        type: String,
        required: true,
    },
    description: {
        type: String
    },
    reportedAt: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'fixed'],
        default: 'pending'
    }
})

const report = mongoose.model('Report', reportSchema);
export default report;
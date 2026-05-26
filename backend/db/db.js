import mongoose from "mongoose";

const connectToDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("✅ MONGODB Connected")
    } catch (error) {
        console.log("❌ MONGODB Connection Error:", error)
    }
}

export default connectToDb;
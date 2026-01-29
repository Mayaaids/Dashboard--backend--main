import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
    name: String,
    email: String,
    team: String,
    event: String,
    college: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Registration", registrationSchema);

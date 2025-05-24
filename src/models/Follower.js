import mongoose from "mongoose";

const followerSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // el usuario
    seguido: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }  // a quién sigue
}, { timestamps: true });

export default mongoose.model("Follower", followerSchema);
import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    id_post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("LikePost", likeSchema);
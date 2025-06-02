import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    id_post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    texto: { type: String, required: true }
  }, { timestamps: true });

  export default mongoose.model("CommentPost", commentSchema);
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  id_usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  id_chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  tipo: {
    type: String,
    enum: ['text', 'image', 'audio', 'post', 'reel', "paint"],
    required: true
  },
  msg: {
    type: mongoose.Schema.Types.Mixed, // texto, URL de imagen/audio, ID de post/reel
    required: true
  },
  duracion: {
    type: Number, // solo si es audio (en segundos)
    default: 0
  },
  visto: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
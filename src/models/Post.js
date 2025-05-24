import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    descripcion: { type: String, required: false, default: "" },
    url: { type: String, required: false, default: "" },
    portada: { type: String, required: false, default: "" },
    tipo: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
  });

  postSchema.pre("save", function (next) {
    if (this.tipo === "reel" && this.url && !this.portada) {  
      const baseUrl = this.url.split("/upload/")[0];
      const filePath = this.url.split("/upload/")[1].replace(/\.(mp4|mov|webm)$/i, ""); // sin extensión
      this.portada = `${baseUrl}/upload/so_1/${filePath}.jpg`;
    }
  
    next();
  });

export default mongoose.model('Post', postSchema);

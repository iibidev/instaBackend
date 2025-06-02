import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("❌ MONGO_URI no está definida en process.env");
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("🔵 MongoDB conectado correctamente");
}).catch((err) => {
  console.error("🔴 Error al conectar MongoDB:", err);
});

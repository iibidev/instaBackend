import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import "./database/db.js";

import authRoutes from "./routes/auth.route.js";
import followRoutes from "./routes/follow.route.js";
import postRoutes from "./routes/post.route.js";
import chatRoutes from "./routes/chat.route.js";
import Message from "./models/Message.js";
import User from "./models/User.js";
const app = express();

const urlFrontend = "https://5mnqgtb0-4200.uks1.devtunnels.ms"; //https://insta-front-olive.vercel.app

app.use(cors({
  origin: urlFrontend,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/follow", followRoutes);
app.use("/post", postRoutes);
app.use("/chat", chatRoutes);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: urlFrontend,
    credentials: true
  }
});

async function enviarNotificacion(idMiembro, mensaje, idAutor){
    const usuario = await User.findById(idAutor).select("-passwd -email").lean();
    io.to(idMiembro).emit("notificacionMensaje", { mensaje, usuario });
}

io.on("connection", (socket) => {
  socket.on('unirse-sala', (userId) => {
    socket.join(userId);
    socket.data.userId = userId;
  });

  socket.on("newText", async({ text, idChat, idMiembro }) => {
    try {
      const nuevoMensaje = await Message.create({ id_chat: idChat, id_usuario: socket.data.userId, msg: text, tipo: "text" });
      io.to(idMiembro).to(socket.data.userId).emit("getMessage", nuevoMensaje);
      enviarNotificacion(idMiembro, nuevoMensaje, socket.data.userId);
    } catch (error) {
      console.log(error);
      socket.emit("errorMessage");
    }
  });

  socket.on("newAudio", async({ audioUrl, duracion, idChat, idMiembro }) => {
    try{
      const nuevoMensaje = await Message.create({ id_chat: idChat, id_usuario: socket.data.userId, msg: audioUrl, tipo: "audio", duracion });
      io.to(idMiembro).to(socket.data.userId).emit("getMessage", nuevoMensaje);
      enviarNotificacion(idMiembro, nuevoMensaje, socket.data.userId);
    }catch(error){
      console.log(error);
      socket.emit("errorMessage");
    }
  });

  socket.on("newPhoto", async({ fotoUrl, idChat, idMiembro }) => {
    try{
      const nuevoMensaje = await Message.create({ id_chat: idChat, id_usuario: socket.data.userId, msg: fotoUrl, tipo: "image" });
      io.to(idMiembro).to(socket.data.userId).emit("getMessage", nuevoMensaje);
      enviarNotificacion(idMiembro, nuevoMensaje, socket.data.userId);
    }catch(error){
      console.log(error);
      socket.emit("errorMessage");
    }
  });

  socket.on("newPost", async({ post, idChat, idMiembro }) => {
    try{
      const nuevoMensaje = await Message.create({ id_chat: idChat, id_usuario: socket.data.userId, msg: post, tipo: "post" });
      io.to(idMiembro).to(socket.data.userId).emit("getMessage", nuevoMensaje);
      enviarNotificacion(idMiembro, nuevoMensaje, socket.data.userId);
    }catch(error){
      console.log(error);
      socket.emit("errorMessage");
    }
  });

  socket.on("newReel", async({ reel, idChat, idMiembro }) => {
    try{
      const nuevoMensaje = await Message.create({ id_chat: idChat, id_usuario: socket.data.userId, msg: reel, tipo: "reel" });
      io.to(idMiembro).to(socket.data.userId).emit("getMessage", nuevoMensaje);
      enviarNotificacion(idMiembro, nuevoMensaje, socket.data.userId);
    }catch(error){
      console.log(error);
      socket.emit("errorMessage");
    }
  });

  socket.on("newPaint", async({ paint, idChat, idMiembro }) => {
    try{
      const nuevoMensaje = await Message.create({ id_chat: idChat, id_usuario: socket.data.userId, msg: paint, tipo: "paint" });
      io.to(idMiembro).to(socket.data.userId).emit("getMessage", nuevoMensaje);
      enviarNotificacion(idMiembro, nuevoMensaje, socket.data.userId);
    }catch(error){
      console.log(error);
      socket.emit("errorMessage");
    }
  });

  socket.on("escribiendo", ({ idChat, idMiembro }) => {
    io.to(idMiembro).emit("escribiendo", idChat);
  });

  socket.on("dejoDeEscribir", ({ idChat, idMiembro }) => {
    io.to(idMiembro).emit("dejoDeEscribir", idChat);
  });

  socket.on("crearChat", ({ chat, miembro }) => {
    io.to(miembro).emit("chatCreado", chat);
  });


  socket.on('salir-sala', () => {
    const userId = socket.data.userId;
    if (userId) socket.leave(userId);
    console.log("El usuario " + userId + " ha cerrado sesion");
  });

});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Backend escuchando el puerto ${PORT}`);
});

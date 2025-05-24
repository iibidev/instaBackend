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
const app = express();

const urlFrontend = "https://7tgv369m-4200.uks1.devtunnels.ms";

app.use(cors({
  origin: urlFrontend,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/follow", followRoutes);
app.use("/post", postRoutes);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: urlFrontend,
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("se ha conectado alguien");

  socket.on("newMessage", (msg) => {
    io.emit("sendMessage", msg);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Backend escuchando el puerto ${PORT}`);
});
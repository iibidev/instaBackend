const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs"); // Para descargar lista de seguidores y seguidos

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("se ha conectado alguien");

  socket.on("newMessage", (msg) => {
    io.emit("sendMessage", msg);
  });
});

app.get("/api/hola", (req, res) => {
  res.json({ hola: "hola desde Render" });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Backend escuchando el puerto ${PORT}`);
});
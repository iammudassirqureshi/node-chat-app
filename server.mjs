import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { initMongoose } from "./src/config/mongoose.mjs";
import morgan from "morgan";

import authRoutes from "./src/routes/authRoutes.mjs";
import chatRoutes from "./src/routes/chatRoutes.mjs";
import { initSocket } from "./src/services/socketHandler.mjs";

initMongoose();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);

initSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// src/socketHandler.mjs
import jwt from "jsonwebtoken";
import User from "../schemas/User.mjs";
import Message from "../schemas/Message.mjs";

export const initSocket = async (io) => {
  const onlineUsers = new Map();

  io.use(async (socket, next) => {
    try {
      const { headers, query } = socket.handshake;
      let token = headers.authorization || headers.Authorization;

      if (!token && (query.authorization || query.Authorization)) {
        token = query.authorization || query.Authorization;
      }

      if (!token) return next(new Error("Token missing"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.sub);
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      console.error("[SOCKET.IO] auth failed:", err.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket) => {
    const socketId = socket.id;
    const socketUser = socket.user;
    const uid = socketUser.id;
    onlineUsers.set(uid, socketId);

    console.log(
      `Client connected: ${socketUser.name} (${socketUser.role}) → ${socketId}`
    );

    io.emit("userOnline", {
      userId: uid,
      name: socketUser.name,
      role: socketUser.role,
    });

    const pending = await Message.find({
      receiverId: uid,
      delivered: false,
    }).sort({ createdAt: 1 });

    pending.forEach((m) => socket.emit("message", m));
    await Message.updateMany(
      { receiverId: uid, delivered: false },
      { $set: { delivered: true } }
    );

    socket.on("privateMessage", async ({ to, message }) => {
      const recipient = await User.findById(to);
      if (!recipient || recipient.role === socketUser.role) {
        return socket.emit(
          "chatError",
          `Your role (${
            socketUser.role
          }) is only allowed to chat with users of the opposite role. You tried to message a user with role (${
            recipient ? recipient.role : "unknown"
          }).`
        );
      }

      const isOnline = onlineUsers.has(to);
      if (!isOnline) {
        socket.emit(
          "chatError",
          "Recipient is offline, message will be sent when they come online."
        );
      }

      const msg = await Message.create({
        senderId: uid,
        receiverId: to,
        message,
        delivered: isOnline,
      });

      socket.emit("message", msg);

      const targetSocketId = onlineUsers.get(to);
      if (isOnline && targetSocketId)
        io.to(targetSocketId).emit("message", msg);
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(uid);
      io.emit("userOffline", { userId: uid });
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

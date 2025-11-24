const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the client HTML file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Handle socket connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // Join a room with username
  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);
    socket.username = username;
    socket.room = room;

    // Welcome message
    socket.emit("chat message", `Welcome ${username} to room ${room}!`);

    // Notify others
    socket.to(room).emit("chat message", `${username} has joined the room.`);
  });

  // Handle chat messages
  socket.on("chat message", (msg) => {
    io.to(socket.room).emit("chat message", `${socket.username}: ${msg}`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    if (socket.room && socket.username) {
      io.to(socket.room).emit("chat message", `${socket.username} left the room.`);
    }
    console.log("User disconnected");
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

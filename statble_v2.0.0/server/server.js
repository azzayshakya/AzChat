const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, "db.json");

// read DB
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ rooms: [], messages: [] }));
  }
  return JSON.parse(fs.readFileSync(DB_PATH));
}

// write DB
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

//// REST API

// create room
app.post("/rooms", (req, res) => {
  const { name } = req.body;
  const db = readDB();

  const room = { id: Date.now().toString(), name };
  db.rooms.push(room);

  writeDB(db);
  res.json(room);
});

// get rooms
app.get("/rooms", (req, res) => {
  const db = readDB();
  res.json(db.rooms);
});

// get messages
app.get("/messages/:roomId", (req, res) => {
  const db = readDB();
  const msgs = db.messages.filter((m) => m.roomId === req.params.roomId);
  res.json(msgs);
});

//// SOCKET

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("send_message", ({ roomId, text }) => {
    const db = readDB();

    const msg = {
      id: Date.now().toString(),
      roomId,
      text,
      createdAt: new Date().toISOString(),
    };

    db.messages.push(msg);
    writeDB(db);

    // send to everyone in room
    io.to(roomId).emit("new_message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});

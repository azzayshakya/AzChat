const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN || "*" },
  path: "/socket.io",
  transports: ["websocket", "polling"],
});

app.use(cors());
app.use(express.json());

// ── Data Layer ──────────────────────────────────────────────
const DB_PATH = path.join(__dirname, process.env.DB_FILE || "db.json");

// function readDB() {
//   if (!fs.existsSync(DB_PATH))
//     fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], messages: [] }));
//   return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
// }
function readDB() {
  const defaultData = { users: [], messages: [] };

  // 1. If file doesn't exist, create it with default data and return it
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }

  try {
    const fileContent = fs.readFileSync(DB_PATH, "utf8").trim();

    // 2. If the file is empty string, return default data
    if (!fileContent) {
      return defaultData;
    }

    return JSON.parse(fileContent);
  } catch (error) {
    // 3. If JSON is corrupted/invalid, log error and return default data to prevent crash
    console.error(
      "Error reading DB, file might be corrupted. Resetting to default.",
      error,
    );
    return defaultData;
  }
}
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ── Auth Routes ──────────────────────────────────────────────
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  const db = readDB();

  if (db.users.find((u) => u.username === username))
    return res.status(400).json({ error: "Username already taken" });
  if (db.users.find((u) => u.email === email))
    return res.status(400).json({ error: "Email already registered" });

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const hash = await bcrypt.hash(password, saltRounds);
  const user = {
    id: Date.now().toString(),
    username,
    email,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  writeDB(db);

  res.json({
    user: { id: user.id, username: user.username, email: user.email },
  });
});

app.post("/api/login", async (req, res) => {
  const { identity, password } = req.body;
  const db = readDB();
  const user = db.users.find(
    (u) => u.username === identity || u.email === identity,
  );

  if (!user) return res.status(401).json({ error: "User not found" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Wrong password" });

  res.json({
    user: { id: user.id, username: user.username, email: user.email },
  });
});

app.get("/api/check-username/:username", (req, res) => {
  const db = readDB();
  res.json({
    available: !db.users.find((u) => u.username === req.params.username),
  });
});

app.get("/api/check-email/:email", (req, res) => {
  const db = readDB();
  res.json({ available: !db.users.find((u) => u.email === req.params.email) });
});

// ── User / Message Routes ────────────────────────────────────
app.get("/api/users/search", (req, res) => {
  const { q, exclude } = req.query;
  const db = readDB();
  const results = db.users
    .filter(
      (u) =>
        u.id !== exclude &&
        u.username.toLowerCase().includes((q || "").toLowerCase()),
    )
    .map((u) => ({ id: u.id, username: u.username, email: u.email }));
  res.json(results);
});

app.get("/api/messages/:userId/:otherId", (req, res) => {
  const { userId, otherId } = req.params;
  const db = readDB();
  const msgs = db.messages.filter(
    (m) =>
      (m.from === userId && m.to === otherId) ||
      (m.from === otherId && m.to === userId),
  );
  res.json(msgs);
});

// Chat partners (users this person has chatted with)
app.get("/api/contacts/:userId", (req, res) => {
  const { userId } = req.params;
  const db = readDB();
  const partnerIds = [
    ...new Set(
      db.messages
        .filter((m) => m.from === userId || m.to === userId)
        .map((m) => (m.from === userId ? m.to : m.from)),
    ),
  ];
  const contacts = partnerIds
    .map((id) => {
      const u = db.users.find((u) => u.id === id);
      if (!u) return null;
      const lastMsg = db.messages
        .filter(
          (m) =>
            (m.from === userId && m.to === id) ||
            (m.from === id && m.to === userId),
        )
        .at(-1);
      return {
        id: u.id,
        username: u.username,
        lastMessage: lastMsg?.text || "",
        lastAt: lastMsg?.createdAt || "",
      };
    })
    .filter(Boolean);
  res.json(contacts);
});

// ── Socket.IO ────────────────────────────────────────────────
// ── Socket.IO ────────────────────────────────────────────────
const onlineUsers = {}; // userId → socketId

io.on("connection", (socket) => {
  console.log("🟢 New connection:", socket.id);

  // 🔐 Register user
  socket.on("register", (userId) => {
    console.log("📌 Register:", userId, "→", socket.id);

    onlineUsers[userId] = socket.id;

    console.log("👥 Online Users:", onlineUsers);

    io.emit("online_users", Object.keys(onlineUsers));
  });

  // 💬 Send message
  socket.on("send_message", ({ from, to, text }) => {
    console.log("📩 Message received:", { from, to, text });

    const db = readDB();

    const msg = {
      id: Date.now().toString(),
      from,
      to,
      text,
      createdAt: new Date().toISOString(),
    };

    db.messages.push(msg);
    writeDB(db);

    // ✅ Send back to sender
    io.to(socket.id).emit("new_message", msg);

    // ✅ Send to receiver (if online)
    if (onlineUsers[to]) {
      console.log("📤 Delivering to:", to);
      io.to(onlineUsers[to]).emit("new_message", msg);
    } else {
      console.log("⚠️ User offline:", to);
    }
  });

  // ❌ Disconnect
  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);

    for (const [uid, sid] of Object.entries(onlineUsers)) {
      if (sid === socket.id) {
        delete onlineUsers[uid];
        console.log("❌ Removed user:", uid);
        break;
      }
    }

    io.emit("online_users", Object.keys(onlineUsers));
  });
});

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || "0.0.0.0";
server.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
});

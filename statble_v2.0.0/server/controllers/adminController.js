const { readDB, writeDB } = require("../models/db");

function getDateFilter(range) {
  const now = new Date();
  if (range === "1d") return new Date(now - 1 * 24 * 60 * 60 * 1000);
  if (range === "7d") return new Date(now - 7 * 24 * 60 * 60 * 1000);
  return null;
}

function stripPassword(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

function getAllUsers(req, res) {
  const db = readDB();
  res.json(db.users.map(stripPassword));
}

function makeGetOnlineUsers(getOnlineUsers) {
  return function (req, res) {
    const db = readDB();
    const onlineIds = Object.keys(getOnlineUsers());

    const users = onlineIds
      .map((id) => {
        const u = db.users.find((u) => u.id === id);
        return u ? stripPassword(u) : null;
      })
      .filter(Boolean);

    res.json({ count: users.length, users });
  };
}
function checkAdmin(req, res) {
  res.json({
    ok: true,

    isAdmin: req.user.role === "admin",

    user: {
      id: req.user.id,
      role: req.user.role,
    },
  });
}
function getChatStats(req, res) {
  const { range } = req.query;
  const since = getDateFilter(range);
  const db = readDB();

  const filtered = since
    ? db.messages.filter((m) => new Date(m.createdAt) >= since)
    : db.messages;

  res.json({
    range: range || "all",
    totalMessages: filtered.length,
    messages: filtered ? [] : [],
  });
}

function getConnections(req, res) {
  const { range } = req.query;
  const since = getDateFilter(range);
  const db = readDB();

  const messages = since
    ? db.messages.filter((m) => new Date(m.createdAt) >= since)
    : db.messages;

  const pairMap = {};

  for (const msg of messages) {
    const pairKey = [msg.from, msg.to].sort().join("_");

    if (!pairMap[pairKey]) {
      pairMap[pairKey] = {
        userA: msg.from < msg.to ? msg.from : msg.to,
        userB: msg.from < msg.to ? msg.to : msg.from,
        totalMessages: 0,
        breakdown: {},
      };
    }

    pairMap[pairKey].totalMessages += 1;
    pairMap[pairKey].breakdown[msg.from] =
      (pairMap[pairKey].breakdown[msg.from] || 0) + 1;
  }

  const connections = Object.values(pairMap).map((pair) => {
    const uA = db.users.find((u) => u.id === pair.userA);
    const uB = db.users.find((u) => u.id === pair.userB);

    const sentByA = pair.breakdown[pair.userA] || 0;
    const sentByB = pair.breakdown[pair.userB] || 0;

    return {
      // userA: { id: pair.userA, username: uA?.username || "deleted" },
      // userB: { id: pair.userB, username: uB?.username || "deleted" },
      // totalMessages: pair.totalMessages,
      // sentByA,
      // sentByB,
      userA: { id: "NA", username: "deleted" },
      userB: { id: "NA", username: "deleted" },
      totalMessages: pair.totalMessages,
      sentByA,
      sentByB,
    };
  });

  res.json({
    range: range || "all",
    totalPairs: connections.length,
    connections,
  });
}

function deleteUser(req, res) {
  const { userId } = req.params;
  const db = readDB();

  const userIndex = db.users.findIndex((u) => u.id === userId);
  if (userIndex === -1)
    return res.status(404).json({ error: "User not found" });

  const username = db.users[userIndex].username;
  db.users.splice(userIndex, 1);
  db.messages = db.messages.filter((m) => m.from !== userId && m.to !== userId);
  writeDB(db);

  res.json({ ok: true, deleted: { id: userId, username } });
}
function postUserQuery(req, res) {
  try {
    const { name, message, location, phone, email } = req.body;

    if (!name || !message) {
      return res.status(400).json({
        error: "Name and message are required",
      });
    }

    const db = readDB();

    if (!db.userQueries) {
      db.userQueries = [];
    }

    const query = {
      id: Date.now().toString(),

      name,

      message,

      location: location || "",

      phone: phone || "",

      email: email || "",

      createdAt: new Date().toISOString(),
    };

    db.userQueries.push(query);

    writeDB(db);

    res.status(201).json({
      ok: true,

      message: "User query submitted successfully",

      data: query,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Failed to submit user query",
    });
  }
}

function getUserQuery(req, res) {
  try {
    const db = readDB();

    const queries = db.userQueries || [];

    res.json({
      ok: true,

      total: queries.length,

      data: queries,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Failed to fetch user queries",
    });
  }
}
module.exports = {
  getAllUsers,
  makeGetOnlineUsers,
  getChatStats,
  getConnections,
  deleteUser,
  checkAdmin,
  postUserQuery,
  getUserQuery,
};

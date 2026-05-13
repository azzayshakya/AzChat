const bcrypt = require("bcryptjs");

const { readDB, writeDB } = require("../models/db");

const { generateToken } = require("../utils/jwt");

const { validateRegisterData } = require("../utils/validateAuth");

// Store invalidated tokens in memory
const blacklistedTokens = [];

// Register controller
async function register(req, res, next) {
  try {
    let { username, email, password } = req.body;

    // Validate input
    const validationError = validateRegisterData({
      username,
      email,
      password,
    });

    if (validationError) {
      return res.status(400).json({
        error: validationError,
      });
    }

    // Normalize values
    username = username.trim().toLowerCase();

    email = email.trim().toLowerCase();

    const db = readDB();

    // Check username exists
    if (db.users.find((u) => u.username === username)) {
      return res.status(400).json({
        error: "Username already taken",
      });
    }

    // Check email exists
    if (db.users.find((u) => u.email === email)) {
      return res.status(400).json({
        error: "Email already registered",
      });
    }

    // Hash password
    const hash = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
    );

    // Create user object
    const user = {
      id: crypto.randomUUID(), // Better unique ID

      username,

      // Auto copied from username
      name: username,

      email,

      passwordHash: hash,

      role: process.env.DEFAULT_USER_ROLE || "user",

      isOnline: false,

      lastSeen: null,

      createdAt: new Date().toISOString(),
    };

    db.users.push(user);

    writeDB(db);

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      data: {
        token,

        user: {
          id: user.id,

          username: user.username,

          name: user.name,

          email: user.email,

          role: user.role,

          isOnline: true,

          lastSeen: user.lastSeen,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// Login controller
async function login(req, res, next) {
  try {
    let { identity, password } = req.body;

    // Required fields
    if (!identity || !password) {
      return res.status(400).json({
        error: "Identity and password are required",
      });
    }

    // Normalize identity
    identity = identity.trim().toLowerCase();

    const db = readDB();

    // Find user
    const user = db.users.find(
      (u) => u.username === identity || u.email === identity,
    );

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    // Compare password
    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      return res.status(401).json({
        error: "Wrong password",
      });
    }

    // Update online state
    user.isOnline = true;

    writeDB(db);

    // Generate token
    const token = generateToken(user);

    res.json({
      data: {
        token,

        user: {
          id: user.id,

          username: user.username,

          name: user.name,

          email: user.email,

          role: user.role,

          isOnline: true,

          lastSeen: user.lastSeen,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// Logout controller
function logout(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    const token = authHeader.split(" ")[1];

    // Invalidate token
    blacklistedTokens.push(token);

    const db = readDB();

    // Find current user
    const user = db.users.find((u) => u.id === req.user.userId);

    if (user) {
      user.isOnline = false;

      // Update last seen
      user.lastSeen = new Date().toISOString();

      writeDB(db);
    }

    res.json({
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
}

function checkUsername(req, res) {
  const db = readDB();

  const username = req.params.username.trim().toLowerCase();

  res.json({
    available: !db.users.find((u) => u.username === username),
  });
}

function checkEmail(req, res) {
  const db = readDB();

  const email = req.params.email.trim().toLowerCase();

  res.json({
    available: !db.users.find((u) => u.email === email),
  });
}

module.exports = {
  register,
  login,
  logout,
  checkUsername,
  checkEmail,
  blacklistedTokens,
};
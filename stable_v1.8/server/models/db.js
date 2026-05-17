const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", process.env.DB_FILE || "db.json");
console.log("azx", DB_PATH);
const DEFAULT_DATA = { users: [], messages: [], userQueries: [] };

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
    return DEFAULT_DATA;
  }
  try {
    const content = fs.readFileSync(DB_PATH, "utf8").trim();
    return content ? JSON.parse(content) : DEFAULT_DATA;
  } catch (err) {
    console.error("DB read error, resetting:", err.message);
    return DEFAULT_DATA;
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };

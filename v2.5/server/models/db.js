const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', process.env.DB_FILE || 'db.json');

const DEFAULT_DATA = {
  users: [],
  messages: [],
  groups: [],
  groupMembers: [],
  userQueries: [],
};

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
    return { ...DEFAULT_DATA };
  }
  try {
    const content = fs.readFileSync(DB_PATH, 'utf8').trim();
    const db = content ? JSON.parse(content) : {};

    // Backward compat — ensure every collection exists
    return {
      users: db.users || [],
      messages: db.messages || [],
      groups: db.groups || [],
      groupMembers: db.groupMembers || [],
      userQueries: db.userQueries || [],
    };
  } catch (err) {
    console.error('DB read error, resetting:', err.message);
    return { ...DEFAULT_DATA };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };

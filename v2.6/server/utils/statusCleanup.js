// statusCleanup.js — drop-in cron to purge expired statuses automatically
// Usage: require('./jobs/statusCleanup') in server.js (after app setup)

const { readDB, writeDB } = require('../models/db');
const { deleteFileFromDisk } = require('../utils/fileUtils');

const STATUS_EXPIRY_HOURS = parseInt(process.env.STATUS_EXPIRY_HOURS) || 24;
// How often to run the cleanup (default: every 30 minutes)
const CLEANUP_INTERVAL_MS =
  parseInt(process.env.STATUS_CLEANUP_INTERVAL_MINUTES) * 60 * 1000 || 30 * 60 * 1000;

function isExpired(createdAt) {
  return Date.now() - new Date(createdAt).getTime() > STATUS_EXPIRY_HOURS * 60 * 60 * 1000;
}

function runCleanup() {
  try {
    const db = readDB();
    if (!db.statuses || db.statuses.length === 0) return;

    const expired = db.statuses.filter((s) => isExpired(s.createdAt));
    if (expired.length === 0) return;

    expired.forEach((s) => {
      if (s.file?.url) deleteFileFromDisk(s.file.url);
    });

    db.statuses = db.statuses.filter((s) => !isExpired(s.createdAt));
    writeDB(db);

    console.log(`[StatusCleanup] Removed ${expired.length} expired status(es)`);
  } catch (err) {
    console.error('[StatusCleanup] Error during cleanup:', err.message);
  }
}

// Run once immediately on startup, then on interval
runCleanup();
setInterval(runCleanup, CLEANUP_INTERVAL_MS);

module.exports = { runCleanup };

// jobs/dataCleanup.js

const { readDB, writeDB } = require("../models/db");
const { deleteFileFromDisk } = require("../utils/fileUtils");

const MESSAGE_RETENTION_DAYS = 10;
const STATUS_RETENTION_DAYS = 1;

// Run every 6 hours
const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000;

function isOlderThan(date, days) {
  if (!date) return false;

  const ageMs = Date.now() - new Date(date).getTime();
  return ageMs > days * 24 * 60 * 60 * 1000;
}

function runCleanup() {
  try {
    const db = readDB();

    // =====================
    // Messages Cleanup
    // =====================
    const oldMessages = db.messages.filter((msg) =>
      isOlderThan(msg.createdAt, MESSAGE_RETENTION_DAYS),
    );

    oldMessages.forEach((msg) => {
      if (msg.file?.url) {
        deleteFileFromDisk(msg.file.url);
      }
    });

    db.messages = db.messages.filter(
      (msg) => !isOlderThan(msg.createdAt, MESSAGE_RETENTION_DAYS),
    );

    // =====================
    // Status Cleanup
    // =====================
    const oldStatuses = db.statuses.filter((status) =>
      isOlderThan(status.createdAt, STATUS_RETENTION_DAYS),
    );

    oldStatuses.forEach((status) => {
      if (status.file?.url) {
        deleteFileFromDisk(status.file.url);
      }
    });

    db.statuses = db.statuses.filter(
      (status) => !isOlderThan(status.createdAt, STATUS_RETENTION_DAYS),
    );

    writeDB(db);

    console.log(
      `[Cleanup] Removed ${oldMessages.length} messages and ${oldStatuses.length} statuses`,
    );
  } catch (err) {
    console.error("[Cleanup] Error:", err.message);
  }
}

runCleanup();
setInterval(runCleanup, CLEANUP_INTERVAL_MS);

module.exports = { runCleanup };

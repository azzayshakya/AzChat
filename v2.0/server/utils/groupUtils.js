const { readDB } = require('../models/db');

/**
 * Get a group with its members populated
 */
function getGroupWithMembers(groupId) {
  const db = readDB();
  const group = db.groups.find((g) => g.id === groupId);
  if (!group) return null;

  const memberRecords = db.groupMembers.filter((gm) => gm.groupId === groupId);
  const memberIds = memberRecords.map((gm) => gm.userId);
  const members = db.users
    .filter((u) => memberIds.includes(u.id))
    .map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      isOnline: u.isOnline,
      lastSeen: u.lastSeen,
      role: memberRecords.find((gm) => gm.userId === u.id)?.role || 'member',
    }));

  return { ...group, members };
}

/**
 * Check if user is in a group
 */
function isGroupMember(groupId, userId) {
  const db = readDB();
  return db.groupMembers.some((gm) => gm.groupId === groupId && gm.userId === userId);
}

/**
 * Check if user is admin/owner of a group
 */
function isGroupAdmin(groupId, userId) {
  const db = readDB();
  const member = db.groupMembers.find((gm) => gm.groupId === groupId && gm.userId === userId);
  return member && (member.role === 'admin' || member.role === 'owner');
}

module.exports = { getGroupWithMembers, isGroupMember, isGroupAdmin };

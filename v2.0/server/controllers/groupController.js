const crypto = require('crypto');
const { readDB, writeDB } = require('../models/db');
const { getGroupWithMembers, isGroupMember, isGroupAdmin } = require('../utils/groupUtils');

// ─── Create group ─────────────────────────────────────────────────────────────
function createGroup(req, res) {
  const currentUserId = req.user.userId;
  const { name, description } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Group name must be at least 2 characters' });
  }
  if (name.trim().length > 50) {
    return res.status(400).json({ error: 'Group name must be at most 50 characters' });
  }

  const db = readDB();

  const group = {
    id: crypto.randomUUID(),
    name: name.trim(),
    description: description?.trim() || '',
    ownerId: currentUserId,
    createdAt: new Date().toISOString(),
  };

  // Creator is automatically owner (admin-level)
  const ownerMember = {
    id: crypto.randomUUID(),
    groupId: group.id,
    userId: currentUserId,
    role: 'owner',
    joinedAt: new Date().toISOString(),
  };

  db.groups.push(group);
  db.groupMembers.push(ownerMember);
  writeDB(db);

  return res.status(201).json({ data: getGroupWithMembers(group.id) });
}

// ─── Get all groups for current user ─────────────────────────────────────────
function getMyGroups(req, res) {
  const currentUserId = req.user.userId;
  const db = readDB();

  const memberGroupIds = db.groupMembers
    .filter((gm) => gm.userId === currentUserId)
    .map((gm) => gm.groupId);

  const groups = memberGroupIds.map((groupId) => getGroupWithMembers(groupId)).filter(Boolean);

  return res.json({ data: groups });
}

// ─── Get single group ─────────────────────────────────────────────────────────
function getGroup(req, res) {
  const currentUserId = req.user.userId;
  const { groupId } = req.params;

  if (!isGroupMember(groupId, currentUserId)) {
    return res.status(403).json({ error: 'You are not a member of this group' });
  }

  const group = getGroupWithMembers(groupId);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  return res.json({ data: group });
}

// ─── Update group info (admin/owner only) ────────────────────────────────────
function updateGroup(req, res) {
  const currentUserId = req.user.userId;
  const { groupId } = req.params;
  const { name, description } = req.body;

  if (!isGroupAdmin(groupId, currentUserId)) {
    return res.status(403).json({ error: 'Only group admins can update group info' });
  }

  const db = readDB();
  const groupIndex = db.groups.findIndex((g) => g.id === groupId);
  if (groupIndex === -1) return res.status(404).json({ error: 'Group not found' });

  if (name) {
    if (name.trim().length < 2) return res.status(400).json({ error: 'Group name too short' });
    db.groups[groupIndex].name = name.trim();
  }
  if (description !== undefined) {
    db.groups[groupIndex].description = description.trim();
  }

  writeDB(db);
  return res.json({ data: getGroupWithMembers(groupId) });
}

// ─── Add member ───────────────────────────────────────────────────────────────
function addMember(req, res) {
  const currentUserId = req.user.userId;
  const { groupId } = req.params;
  const { userId } = req.body;

  if (!isGroupAdmin(groupId, currentUserId)) {
    return res.status(403).json({ error: 'Only group admins can add members' });
  }

  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const db = readDB();

  const userExists = db.users.find((u) => u.id === userId);
  if (!userExists) return res.status(404).json({ error: 'User not found' });

  if (isGroupMember(groupId, userId)) {
    return res.status(409).json({ error: 'User is already a member' });
  }

  const member = {
    id: crypto.randomUUID(),
    groupId,
    userId,
    role: 'member',
    joinedAt: new Date().toISOString(),
  };

  db.groupMembers.push(member);
  writeDB(db);

  return res.status(201).json({ data: getGroupWithMembers(groupId) });
}

// ─── Remove member ────────────────────────────────────────────────────────────
function removeMember(req, res) {
  const currentUserId = req.user.userId;
  const { groupId, userId } = req.params;

  const db = readDB();
  const group = db.groups.find((g) => g.id === groupId);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  // Can remove self (leave group) OR admin can remove others
  const isSelf = currentUserId === userId;
  if (!isSelf && !isGroupAdmin(groupId, currentUserId)) {
    return res.status(403).json({ error: 'Only group admins can remove members' });
  }

  // Owner cannot be removed (must transfer ownership first)
  const targetMember = db.groupMembers.find((gm) => gm.groupId === groupId && gm.userId === userId);
  if (!targetMember) return res.status(404).json({ error: 'Member not found in group' });
  if (targetMember.role === 'owner' && !isSelf) {
    return res.status(403).json({ error: 'Cannot remove the group owner' });
  }

  db.groupMembers = db.groupMembers.filter(
    (gm) => !(gm.groupId === groupId && gm.userId === userId)
  );

  // If owner leaves, delete the group or promote next admin
  if (isSelf && targetMember.role === 'owner') {
    const remaining = db.groupMembers.filter((gm) => gm.groupId === groupId);
    if (remaining.length === 0) {
      // No members left - delete group
      db.groups = db.groups.filter((g) => g.id !== groupId);
      db.messages = db.messages.filter((m) => m.chatId !== groupId);
    } else {
      // Promote oldest member to owner
      const newOwner = remaining.sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt))[0];
      const idx = db.groupMembers.findIndex((gm) => gm.id === newOwner.id);
      db.groupMembers[idx].role = 'owner';
      db.groups.find((g) => g.id === groupId).ownerId = newOwner.userId;
    }
  }

  writeDB(db);
  return res.json({ message: 'Member removed', data: getGroupWithMembers(groupId) });
}

// ─── Promote member to admin ──────────────────────────────────────────────────
function promoteMember(req, res) {
  const currentUserId = req.user.userId;
  const { groupId, userId } = req.params;

  const db = readDB();
  const group = db.groups.find((g) => g.id === groupId);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  // Only owner can promote
  const currentMember = db.groupMembers.find(
    (gm) => gm.groupId === groupId && gm.userId === currentUserId
  );
  if (!currentMember || currentMember.role !== 'owner') {
    return res.status(403).json({ error: 'Only the group owner can promote members' });
  }

  const targetIdx = db.groupMembers.findIndex(
    (gm) => gm.groupId === groupId && gm.userId === userId
  );
  if (targetIdx === -1) return res.status(404).json({ error: 'Member not found in group' });

  db.groupMembers[targetIdx].role = 'admin';
  writeDB(db);

  return res.json({ data: getGroupWithMembers(groupId) });
}

// ─── Demote admin to member ───────────────────────────────────────────────────
function demoteMember(req, res) {
  const currentUserId = req.user.userId;
  const { groupId, userId } = req.params;

  const db = readDB();

  const currentMember = db.groupMembers.find(
    (gm) => gm.groupId === groupId && gm.userId === currentUserId
  );
  if (!currentMember || currentMember.role !== 'owner') {
    return res.status(403).json({ error: 'Only the group owner can demote admins' });
  }

  const targetIdx = db.groupMembers.findIndex(
    (gm) => gm.groupId === groupId && gm.userId === userId
  );
  if (targetIdx === -1) return res.status(404).json({ error: 'Member not found' });
  if (db.groupMembers[targetIdx].role === 'owner') {
    return res.status(400).json({ error: 'Cannot demote the owner' });
  }

  db.groupMembers[targetIdx].role = 'member';
  writeDB(db);

  return res.json({ data: getGroupWithMembers(groupId) });
}

// ─── Delete group (owner only) ────────────────────────────────────────────────
function deleteGroup(req, res) {
  const currentUserId = req.user.userId;
  const { groupId } = req.params;

  const db = readDB();
  const group = db.groups.find((g) => g.id === groupId);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  if (group.ownerId !== currentUserId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only the group owner can delete the group' });
  }

  db.groups = db.groups.filter((g) => g.id !== groupId);
  db.groupMembers = db.groupMembers.filter((gm) => gm.groupId !== groupId);
  db.messages = db.messages.filter((m) => m.chatId !== groupId);

  writeDB(db);
  return res.json({ message: 'Group deleted' });
}

module.exports = {
  createGroup,
  getMyGroups,
  getGroup,
  updateGroup,
  addMember,
  removeMember,
  promoteMember,
  demoteMember,
  deleteGroup,
};

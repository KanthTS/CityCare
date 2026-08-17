const Notification = require('../models/Notification');

async function notifyUser(userId, { title, message, type = 'info', relatedComplaint = null }) {
  return Notification.create({ user: userId, title, message, type, relatedComplaint });
}

/**
 * Create the same notification for a list of user ids.
 */
async function notifyMany(userIds, payload) {
  const unique = [...new Set(userIds.map(String))];
  return Promise.all(unique.map((id) => notifyUser(id, payload)));
}

module.exports = { notifyUser, notifyMany };

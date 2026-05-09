const { admin } = require('../middleware/auth');
const { DeviceToken } = require('../models');

/**
 * Send a push notification to specific users
 * @param {Array<string>} userIds - Array of user IDs to send to
 * @param {Object} payload - Notification payload
 * @param {string} payload.title - Notification title
 * @param {string} payload.body - Notification body
 * @param {Object} [payload.data] - Additional data to send
 */
async function sendPushNotification(userIds, { title, body, data = {} }) {
  if (!admin.apps.length) {
    console.error('Firebase Admin not initialized, cannot send push notification.');
    return { success: false, error: 'Firebase Admin not initialized' };
  }

  try {
    // Find all active device tokens for the given users
    const tokens = await DeviceToken.find({
      user_id: { $in: userIds },
      enabled: true,
    }).select('token -_id');

    const deviceTokens = tokens.map((t) => t.token);

    if (deviceTokens.length === 0) {
      console.log(`No active device tokens found for users: ${userIds.join(', ')}`);
      return { success: true, sentCount: 0 };
    }

    const message = {
      notification: {
        title,
        body,
      },
      data,
      tokens: deviceTokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    
    // Log failures
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(deviceTokens[idx]);
          console.error(`Failed to send to token ${deviceTokens[idx]}:`, resp.error);
        }
      });
      
      // Optionally clean up invalid tokens
      if (failedTokens.length > 0) {
        await DeviceToken.updateMany(
          { token: { $in: failedTokens } },
          { $set: { enabled: false } }
        );
      }
    }

    return { 
      success: true, 
      sentCount: response.successCount,
      failureCount: response.failureCount
    };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a push notification to a specific topic
 */
async function sendPushNotificationToTopic(topic, { title, body, data = {} }) {
  if (!admin.apps.length) {
    console.error('Firebase Admin not initialized');
    return { success: false };
  }

  try {
    const message = {
      notification: { title, body },
      data,
      topic,
    };

    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error(`Error sending to topic ${topic}:`, error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendPushNotification,
  sendPushNotificationToTopic,
};

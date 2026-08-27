// Wrapper for sending notifications when an order status changes.
// Currently just logs — swap in a real provider (email/SMS/push) when ready.

const sendNotification = async ({ to, title, message }) => {
  try {
    // TODO: integrate real provider, e.g. Nodemailer for email or Firebase for push
    console.log(`[Notification] To: ${to} | ${title} - ${message}`);
    return true;
  } catch (error) {
    console.error('Notification failed:', error.message);
    return false;
  }
};

module.exports = sendNotification;

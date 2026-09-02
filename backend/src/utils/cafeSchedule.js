/**
 * Backend Cafe Operating & Pre-order Schedule Validator
 */

const DEFAULT_SCHEDULE = {
  openTime: process.env.CAFE_OPEN_TIME || '09:00',
  closeTime: process.env.CAFE_CLOSE_TIME || '21:00',
  preorderLeadMinutes: parseInt(process.env.CAFE_PREORDER_MINS || '30', 10),
  // Allow disabling via environment variable for 24/7 test environments
  enabled: process.env.DISABLE_SCHEDULE_CHECK !== 'true',
};

const isOrderingAllowed = (schedule = DEFAULT_SCHEDULE) => {
  if (!schedule.enabled) {
    return { allowed: true };
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = schedule.openTime.split(':').map(Number);
  const [closeH, closeM] = schedule.closeTime.split(':').map(Number);

  const cafeOpenMinutes = openH * 60 + openM;
  const cafeCloseMinutes = closeH * 60 + closeM;
  const preorderStartMinutes = Math.max(0, cafeOpenMinutes - schedule.preorderLeadMinutes);

  const formatTimeStr = (totalMins) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m < 10 ? `0${m}` : m;
    return `${displayH}:${displayM} ${ampm}`;
  };

  const formattedPreorder = formatTimeStr(preorderStartMinutes);
  const formattedClose = formatTimeStr(cafeCloseMinutes);

  // Ordering window: preorderStartMinutes <= currentMinutes < cafeCloseMinutes
  if (currentMinutes >= preorderStartMinutes && currentMinutes < cafeCloseMinutes) {
    return { allowed: true };
  }

  if (currentMinutes < preorderStartMinutes) {
    return {
      allowed: false,
      message: `Pre-orders are not open yet. Pre-orders open 30 minutes before cafe opening at ${formattedPreorder}.`,
    };
  }

  return {
    allowed: false,
    message: `Cafe kitchen is closed for today (Closed at ${formattedClose}). Pre-orders reopen tomorrow at ${formattedPreorder}.`,
  };
};

module.exports = { isOrderingAllowed, DEFAULT_SCHEDULE };

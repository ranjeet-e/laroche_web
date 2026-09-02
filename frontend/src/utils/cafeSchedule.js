/**
 * Cafe Operating & Pre-order Schedule Helper
 *
 * Default configuration:
 * - Cafe pickup / kitchen opening: 09:00 AM
 * - Pre-order window: 30 minutes before opening (08:30 AM)
 * - Cafe closing time: 09:00 PM (21:00)
 */

export const DEFAULT_SCHEDULE = {
  openTime: '09:00', // HH:mm 24-hr format
  closeTime: '21:00', // HH:mm 24-hr format
  preorderLeadMinutes: 30, // Orders open 30 mins before cafe open
  enabled: true, // Master switch (set to false to disable schedule restriction)
};

export const getCafeScheduleStatus = (schedule = DEFAULT_SCHEDULE) => {
  if (!schedule.enabled) {
    return {
      isOpenForOrdering: true,
      isCafeOpen: true,
      isPreorderWindow: false,
      status: 'open',
      message: 'Accepting orders now',
      countdownText: '',
      formattedOpenTime: '09:00 AM',
      formattedCloseTime: '09:00 PM',
      formattedPreorderTime: '08:30 AM',
    };
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

  const formattedOpenTime = formatTimeStr(cafeOpenMinutes);
  const formattedCloseTime = formatTimeStr(cafeCloseMinutes);
  const formattedPreorderTime = formatTimeStr(preorderStartMinutes);

  // 1. In 30-min Early Preorder window (e.g. 08:30 AM - 09:00 AM)
  if (currentMinutes >= preorderStartMinutes && currentMinutes < cafeOpenMinutes) {
    const minsUntilPickup = cafeOpenMinutes - currentMinutes;
    return {
      isOpenForOrdering: true,
      isCafeOpen: false,
      isPreorderWindow: true,
      status: 'preorder',
      message: `Pre-orders Open! Pickup starts at ${formattedOpenTime} (in ${minsUntilPickup}m)`,
      countdownText: `${minsUntilPickup}m until counter opens`,
      formattedOpenTime,
      formattedCloseTime,
      formattedPreorderTime,
    };
  }

  // 2. Regular Cafe Open Hours (09:00 AM - 09:00 PM)
  if (currentMinutes >= cafeOpenMinutes && currentMinutes < cafeCloseMinutes) {
    const minsUntilClose = cafeCloseMinutes - currentMinutes;
    return {
      isOpenForOrdering: true,
      isCafeOpen: true,
      isPreorderWindow: false,
      status: 'open',
      message: `Kitchen is Open • Closes at ${formattedCloseTime}`,
      countdownText: `Closes in ${Math.floor(minsUntilClose / 60)}h ${minsUntilClose % 60}m`,
      formattedOpenTime,
      formattedCloseTime,
      formattedPreorderTime,
    };
  }

  // 3. Before Preorder Window (e.g. Early Morning before 08:30 AM)
  if (currentMinutes < preorderStartMinutes) {
    const minsUntilPreorder = preorderStartMinutes - currentMinutes;
    const hours = Math.floor(minsUntilPreorder / 60);
    const mins = minsUntilPreorder % 60;
    const timeRemaining = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    return {
      isOpenForOrdering: false,
      isCafeOpen: false,
      isPreorderWindow: false,
      status: 'closed_morning',
      message: `Pre-orders open at ${formattedPreorderTime} (${timeRemaining} left)`,
      countdownText: `Opens in ${timeRemaining}`,
      formattedOpenTime,
      formattedCloseTime,
      formattedPreorderTime,
    };
  }

  // 4. After Cafe Closing Time (Night)
  return {
    isOpenForOrdering: false,
    isCafeOpen: false,
    isPreorderWindow: false,
    status: 'closed_night',
    message: `Kitchen closed for today. Pre-orders reopen tomorrow at ${formattedPreorderTime}`,
    countdownText: `Reopens at ${formattedPreorderTime}`,
    formattedOpenTime,
    formattedCloseTime,
    formattedPreorderTime,
  };
};

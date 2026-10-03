/**
 * Cafe Operating & Pre-order Schedule Helper (Disabled - 24/7 Ordering Enabled)
 */

export const DEFAULT_SCHEDULE = {
  openTime: '00:00',
  closeTime: '23:59',
  preorderLeadMinutes: 0,
  enabled: false,
};

export const getCafeScheduleStatus = () => {
  return {
    isOpenForOrdering: true,
    isCafeOpen: true,
    isPreorderWindow: false,
    status: 'open',
    message: 'Accepting orders now',
    countdownText: '',
    formattedOpenTime: '12:00 AM',
    formattedCloseTime: '11:59 PM',
    formattedPreorderTime: '12:00 AM',
  };
};

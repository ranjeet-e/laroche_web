/**
 * Backend Cafe Operating & Pre-order Schedule Validator (Disabled - 24/7 Ordering Enabled)
 */

const DEFAULT_SCHEDULE = {
  openTime: '00:00',
  closeTime: '23:59',
  preorderLeadMinutes: 0,
  enabled: false,
};

const isOrderingAllowed = () => {
  return { allowed: true };
};

module.exports = { isOrderingAllowed, DEFAULT_SCHEDULE };

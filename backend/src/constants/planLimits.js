// What each subscription plan unlocks. Centralized here so every place that
// needs to check "can this store do X" (team routes, notification settings,
// theme selection) reads the same source of truth.
//
// Legacy plans (free/starter/pro) predate this feature — stores already on
// them (seed/demo data, stores created before plans existed) are left
// unrestricted rather than suddenly losing access to something they already
// had.
const THEMES_CATALOG = require('./themes');

const ALL_THEME_KEYS = THEMES_CATALOG.map((t) => t.key);

const PLAN_LIMITS = {
  basic: {
    maxTeamMembers: 2,
    smsNotifications: false,
    // Only the first theme in the catalog for now — there are just 2 themes
    // today, so this is "1 of 2". As more themes ship, slice this list (or
    // make it config-driven) to match whatever the Basic tier is sold as.
    themeKeys: ALL_THEME_KEYS.slice(0, 1),
  },
  super: {
    maxTeamMembers: Infinity,
    smsNotifications: true,
    themeKeys: ALL_THEME_KEYS,
  },
};

const UNRESTRICTED = {
  maxTeamMembers: Infinity,
  smsNotifications: true,
  themeKeys: ALL_THEME_KEYS,
};

function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || UNRESTRICTED;
}

module.exports = { PLAN_LIMITS, getPlanLimits };

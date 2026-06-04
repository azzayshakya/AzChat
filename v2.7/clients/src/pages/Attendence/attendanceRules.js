/**
 * =============================================================
 *  ATTENDANCE RULES — SINGLE SOURCE OF TRUTH
 *
 *  All thresholds, timings, and business rules live here.
 *  Change any value → the entire app updates automatically.
 *  Every rule is also displayed live in the UI Rules Panel.
 * =============================================================
 */

export const RULES = {
  // ── Season definitions (months are 1-indexed: Jan=1 … Dec=12) ────────────
  SEASON: {
    JAN_MAR: [1, 2, 3],
    APR_DEC: [4, 5, 6, 7, 8, 9, 10, 11, 12],
  },

  // ── Rule 1 : Full Day — target shift duration (minutes) ──────────────────
  FULL_DAY_TARGET_MIN: {
    JAN_MAR: 8 * 60 + 18, // 8 h 18 m
    APR_DEC: 8 * 60 + 40, // 8 h 40 m
  },

  // ── Rule 2 : Half Day — target shift duration (minutes) ──────────────────
  HALF_DAY_TARGET_MIN: {
    JAN_MAR: 4 * 60 + 9, // 4 h 09 m
    APR_DEC: 4 * 60 + 20, // 4 h 20 m
  },

  // ── Rule 3 : Minimum effective hours required for FULL DAY ───────────────
  MIN_FOR_FULL_DAY_MIN: {
    JAN_MAR: 6 * 60 + 18, // 6 h 18 m
    APR_DEC: 6 * 60 + 40, // 6 h 40 m
  },

  // ── Rule 4 : Minimum effective hours required for HALF DAY ───────────────
  //   Must be completed inside 09:00–13:00 OR 13:30–17:00
  MIN_FOR_HALF_DAY_MIN: {
    JAN_MAR: 2 * 60, // 2 h 00 m
    APR_DEC: 2 * 60, // 2 h 00 m
  },

  // ── Rule 5 : Late-join cutoff → auto Half Day ─────────────────────────────
  //   If first punch is strictly AFTER this time → Half Day
  LATE_JOIN_CUTOFF: "11:00",

  // ── Rule 6 : Early-leave cutoff → auto Half Day ───────────────────────────
  //   If last punch is strictly BEFORE this time → Half Day
  EARLY_LEAVE_CUTOFF: {
    JAN_MAR: "15:18", // 3:18 PM
    APR_DEC: "15:40", // 3:40 PM
  },

  // ── Rule 7 : Full-day work window ────────────────────────────────────────
  WORK_WINDOW_START: "09:00",
  WORK_WINDOW_END: {
    JAN_MAR: "17:18", // 5:18 PM
    APR_DEC: "17:40", // 5:40 PM
  },

  // ── Rule 8 : Lunch relaxation — no deduction if absence is within window ──
  //   e.g. out 12:50 → in 13:40 : free = 13:00–13:30 (30 min)
  //   deducted = (13:00−12:50)=10 + (13:40−13:30)=10 = 20 min
  LUNCH_RELAX_START: "13:00",
  LUNCH_RELAX_END: "13:30",

  // ── Week-off days (0=Sunday, 6=Saturday) ─────────────────────────────────
  WEEK_OFF_DAYS: [0, 6],

  // ── Status labels ─────────────────────────────────────────────────────────
  STATUS: {
    FULL_DAY: "Full Day",
    HALF_DAY: "Half Day",
    ABSENT: "Absent",
    WEEK_OFF: "Week Off",
    MISSING_PUNCH: "Missing Punch",
  },

  // ── Status badge colors ───────────────────────────────────────────────────
  STATUS_COLOR: {
    FULL_DAY: "#04ff58",
    HALF_DAY: "#faad14",
    ABSENT: "#ff4d4f",
    WEEK_OFF: "#667eea",
    MISSING_PUNCH: "#ff9c00",
  },
};

/** Returns "JAN_MAR" or "APR_DEC" for a given month number (1–12) */
export function getSeason(month) {
  return RULES.SEASON.JAN_MAR.includes(month) ? "JAN_MAR" : "APR_DEC";
}

/** Human-readable rule cards rendered in the UI Rules Panel */
export const RULE_DESCRIPTIONS = [
  {
    no: 1,
    label: "Full Day Timing",
    seasons: { "Jan – Mar": "8 h 18 m", "Apr – Dec": "8 h 40 m" },
    detail: "Target shift duration to qualify as a Full Day.",
  },
  {
    no: 2,
    label: "Half Day Timing",
    seasons: { "Jan – Mar": "4 h 09 m", "Apr – Dec": "4 h 20 m" },
    detail: "Target shift duration to qualify as a Half Day.",
  },
  {
    no: 3,
    label: "Min Hours — Full Day",
    seasons: { "Jan – Mar": "6 h 18 m", "Apr – Dec": "6 h 40 m" },
    detail: "Minimum effective working hours needed for a Full Day.",
  },
  {
    no: 4,
    label: "Min Hours — Half Day",
    seasons: { "Jan – Mar": "2 h 00 m", "Apr – Dec": "2 h 00 m" },
    detail:
      "Minimum hours for Half Day, completed in 09:00–13:00 or 13:30–17:00.",
  },
  {
    no: 5,
    label: "Late Join → Half Day",
    seasons: { "All Year": "After 11:00 AM" },
    detail: "If first punch is after 11:00 AM the day is capped at Half Day.",
  },
  {
    no: 6,
    label: "Early Leave → Half Day",
    seasons: { "Jan – Mar": "Before 3:18 PM", "Apr – Dec": "Before 3:40 PM" },
    detail:
      "If last punch is before the cutoff time the day is capped at Half Day.",
  },
  {
    no: 7,
    label: "Full-Day Work Window",
    seasons: { "Jan – Mar": "09:00 – 17:18", "Apr – Dec": "09:00 – 17:40" },
    detail:
      "Min working hours must be completed inside this window, otherwise Half Day.",
  },
  {
    no: 8,
    label: "Lunch Relaxation",
    seasons: { "All Year": "13:00 – 13:30 (free)" },
    detail:
      "No deduction for absence within 13:00–13:30. " +
      "E.g. out 12:50 → in 13:40: only 20 min deducted (10 min before + 10 min after the free window).",
  },
];

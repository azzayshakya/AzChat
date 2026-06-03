/**
 * ============================================================
 *  ATTENDANCE RULES CONFIGURATION
 *  Change any value here to update calculations site-wide.
 * ============================================================
 */

export const ATTENDANCE_RULES = {
  // ── Working Hours ─────────────────────────────────────────
  TOTAL_REQUIRED_WORKING_HOURS: 9, // Expected hours per day
  MINIMUM_WORKING_HOURS: 4.5, // Below this = Half Day
  GRACE_PERIOD_MINUTES: 15, // Late arrival grace in minutes

  // ── Shift Timings ─────────────────────────────────────────
  SHIFT_START_TIME: "09:30", // Official shift start (HH:MM)
  SHIFT_END_TIME: "18:30", // Official shift end   (HH:MM)

  // ── Out-of-Office (OOO) Rules ─────────────────────────────
  MAX_OOO_ALLOWED_MINUTES: 30, // Max mid-day out time without deduction
  OOO_DEDUCTION_PER_MINUTE: 1, // Extra OOO deducted minute-for-minute

  // ── Day Classification Thresholds ─────────────────────────
  FULL_DAY_THRESHOLD_HOURS: 8, // >= this = Full Day
  HALF_DAY_THRESHOLD_HOURS: 4, // >= this (but < full) = Half Day
  // < half day threshold = Absent

  // ── Overtime ──────────────────────────────────────────────
  OVERTIME_AFTER_HOURS: 9, // Hours after which OT is counted

  // ── Weekend / Week Off ────────────────────────────────────
  WEEK_OFF_DAYS: [0, 6], // 0 = Sunday, 6 = Saturday

  // ── Display Labels ────────────────────────────────────────
  STATUS_LABELS: {
    FULL_DAY: "Full Day",
    HALF_DAY: "Half Day",
    ABSENT: "Absent",
    WEEK_OFF: "Week Off",
    HOLIDAY: "Holiday",
    OVERTIME: "Overtime",
  },

  // ── Status Colors (CSS variables or hex) ──────────────────
  STATUS_COLORS: {
    FULL_DAY: "#04ff58", // green
    HALF_DAY: "#faad14", // amber
    ABSENT: "#ff4d4f", // red
    WEEK_OFF: "#667eea", // brand purple
    HOLIDAY: "#a78bfa", // accent purple
    OVERTIME: "#00e5ff", // cyan
  },
};

/**
 * Human-readable rule descriptions shown in the Rules Panel UI.
 * Keep these in sync with the values above.
 */
export const RULE_DESCRIPTIONS = [
  {
    id: "req_hours",
    label: "Required Working Hours",
    value: `${ATTENDANCE_RULES.TOTAL_REQUIRED_WORKING_HOURS} hrs / day`,
    description: "Total hours an employee must work each working day.",
  },
  {
    id: "grace",
    label: "Grace Period",
    value: `${ATTENDANCE_RULES.GRACE_PERIOD_MINUTES} min`,
    description: "Late arrivals within this window are not marked late.",
  },
  {
    id: "shift",
    label: "Shift Timings",
    value: `${ATTENDANCE_RULES.SHIFT_START_TIME} – ${ATTENDANCE_RULES.SHIFT_END_TIME}`,
    description: "Standard office shift window for attendance reference.",
  },
  {
    id: "full_day",
    label: "Full Day Threshold",
    value: `≥ ${ATTENDANCE_RULES.FULL_DAY_THRESHOLD_HOURS} hrs`,
    description: "Minimum hours to qualify as a Full Day.",
  },
  {
    id: "half_day",
    label: "Half Day Threshold",
    value: `≥ ${ATTENDANCE_RULES.HALF_DAY_THRESHOLD_HOURS} hrs`,
    description: "Minimum hours to qualify as a Half Day (below = Absent).",
  },
  {
    id: "ooo",
    label: "Max OOO (Mid-day Out)",
    value: `${ATTENDANCE_RULES.MAX_OOO_ALLOWED_MINUTES} min free`,
    description:
      "Mid-day out time up to this limit is free. Beyond this, every extra minute is deducted from effective hours.",
  },
  {
    id: "overtime",
    label: "Overtime Counted After",
    value: `> ${ATTENDANCE_RULES.OVERTIME_AFTER_HOURS} hrs`,
    description: "Extra hours beyond this threshold are flagged as Overtime.",
  },
  {
    id: "weekoff",
    label: "Week-Off Days",
    value: "Saturday & Sunday",
    description: "These days are automatically marked as Week Off.",
  },
];

/**
 * attendanceCalculator.js
 *
 * Takes the raw punch map from excelParser and applies all business rules
 * from attendanceRules.js to produce a per-day result with full breakdown.
 *
 * PUNCH INTERPRETATION:
 *   Given N sorted punches in a day:
 *   • punch[0]          = IN  time
 *   • punch[N-1]        = OUT time
 *   • punch[1..N-2]     = mid-day exits, grouped as OOO pairs: (out, in), (out, in) …
 *     If middle count is odd → unpaired last middle punch = "missing pair"
 */

import { getSeason, RULES } from "../attendanceRules";

// ─────────────────────────────────────────────────────────────────────────────
// Public helpers — time arithmetic
// ─────────────────────────────────────────────────────────────────────────────

/** "HH:MM" → total minutes from midnight */
export function toMins(hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** total minutes → "HH:MM" */
export function toHHMM(mins) {
  if (mins == null || isNaN(mins)) return "--";
  const sign = mins < 0 ? "-" : "";
  const abs = Math.abs(mins);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

/** total minutes → "Xh Ym" human label */
export function toHuman(mins) {
  if (mins == null || isNaN(mins) || mins === 0) return "0 m";
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${m} m`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} m`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main per-day calculator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates attendance for a single day given sorted punches.
 *
 * @param {string}   dateStr   YYYY-MM-DD
 * @param {{ time: string, clockId: string, clockName: string }[]} punches  sorted ASC
 * @returns {DayResult}
 */
export function calculateDay(dateStr, punches) {
  const date = new Date(dateStr + "T00:00:00");
  const dow = date.getDay(); // 0=Sun … 6=Sat
  const month = date.getMonth() + 1; // 1-indexed
  const season = getSeason(month);

  // ── Week off ──────────────────────────────────────────────────────────────
  if (RULES.WEEK_OFF_DAYS.includes(dow)) {
    return makeResult(dateStr, punches, season, {
      status: RULES.STATUS.WEEK_OFF,
      breakdown: [
        {
          label: "Week Off",
          detail: "Day falls on a configured week-off (Sat/Sun).",
          type: "info",
        },
      ],
    });
  }

  // ── No punches at all → Absent ────────────────────────────────────────────
  if (!punches || punches.length === 0) {
    return makeResult(dateStr, [], season, {
      status: RULES.STATUS.ABSENT,
      breakdown: [
        {
          label: "Absent",
          detail: "No punch records found for this day.",
          type: "bad",
        },
      ],
    });
  }

  // ── Only 1 punch → Missing Punch ─────────────────────────────────────────
  if (punches.length === 1) {
    return makeResult(dateStr, punches, season, {
      inTime: punches[0].time,
      status: RULES.STATUS.MISSING_PUNCH,
      breakdown: [
        {
          label: "Only 1 Punch",
          detail: `Recorded: ${punches[0].time}. Need both IN and OUT to calculate hours.`,
          type: "warn",
        },
      ],
    });
  }

  const inTime = punches[0].time;
  const outTime = punches[punches.length - 1].time;
  const inMins = toMins(inTime);
  const outMins = toMins(outTime);

  const breakdown = [];

  // ── Step 1 : Gross time ───────────────────────────────────────────────────
  const grossMins = outMins - inMins;
  breakdown.push({
    label: "Gross Time",
    detail: `OUT (${outTime}) − IN (${inTime}) = ${toHuman(grossMins)}`,
    value: toHHMM(grossMins),
    type: "neutral",
  });

  // ── Step 2 : Extract OOO (mid-day exits) ─────────────────────────────────
  //   Middle punches (index 1 … N-2) are paired as (out, in) tuples.
  const midPunches = punches.slice(1, punches.length - 1);
  const oooPairs = [];

  for (let i = 0; i < midPunches.length - 1; i += 2) {
    oooPairs.push({ out: midPunches[i].time, in: midPunches[i + 1].time });
  }
  // Unpaired last middle punch
  const unpairedPunch =
    midPunches.length % 2 !== 0 ? midPunches[midPunches.length - 1].time : null;

  // ── Step 3 : Calculate OOO deduction applying lunch relaxation ───────────
  const lunchStart = toMins(RULES.LUNCH_RELAX_START);
  const lunchEnd = toMins(RULES.LUNCH_RELAX_END);
  let totalOOODeductedMins = 0;

  oooPairs.forEach((pair, i) => {
    const oooOut = toMins(pair.out);
    const oooIn = toMins(pair.in);
    const rawMins = oooIn - oooOut;

    // Overlap of this absence with the free lunch window
    const freeStart = Math.max(oooOut, lunchStart);
    const freeEnd = Math.min(oooIn, lunchEnd);
    const freeMins = Math.max(0, freeEnd - freeStart);
    const deductMins = rawMins - freeMins;

    totalOOODeductedMins += deductMins;

    const detail =
      freeMins > 0
        ? `Out ${pair.out} → In ${pair.in} = ${toHuman(rawMins)} total. ` +
          `Lunch free window covers ${toHuman(freeMins)} → deducted: ${toHuman(deductMins)}`
        : `Out ${pair.out} → In ${pair.in} = ${toHuman(rawMins)} → fully deducted`;

    breakdown.push({
      label: `OOO #${i + 1}`,
      detail,
      value: `−${toHHMM(deductMins)}`,
      type: deductMins > 0 ? "warn" : "good",
    });
  });

  if (unpairedPunch) {
    breakdown.push({
      label: "Unpaired Punch",
      detail: `Punch at ${unpairedPunch} has no pair — ignored in calculation.`,
      type: "warn",
    });
  }

  // ── Step 4 : Effective minutes ────────────────────────────────────────────
  const effectiveMins = grossMins - totalOOODeductedMins;
  breakdown.push({
    label: "Effective Time",
    detail: `Gross (${toHuman(grossMins)}) − OOO deductions (${toHuman(totalOOODeductedMins)}) = ${toHuman(effectiveMins)}`,
    value: toHHMM(effectiveMins),
    type: "highlight",
  });

  // ── Step 5 : Apply Rule 5 — Late join ────────────────────────────────────
  const lateJoinMins = toMins(RULES.LATE_JOIN_CUTOFF);
  let forcedHalfDay = false;
  let forcedReason = "";

  if (inMins > lateJoinMins) {
    forcedHalfDay = true;
    forcedReason = `Rule 5: Joined at ${inTime} (after ${RULES.LATE_JOIN_CUTOFF}) → capped at Half Day`;
    breakdown.push({
      label: "Late Join",
      detail: forcedReason,
      value: "Half Day cap",
      type: "bad",
    });
  }

  // ── Step 6 : Apply Rule 6 — Early leave ──────────────────────────────────
  const earlyLeaveCutoff = RULES.EARLY_LEAVE_CUTOFF[season];
  if (!forcedHalfDay && outMins < toMins(earlyLeaveCutoff)) {
    forcedHalfDay = true;
    forcedReason = `Rule 6: Left at ${outTime} (before ${earlyLeaveCutoff} for ${season === "JAN_MAR" ? "Jan–Mar" : "Apr–Dec"}) → capped at Half Day`;
    breakdown.push({
      label: "Early Leave",
      detail: forcedReason,
      value: "Half Day cap",
      type: "bad",
    });
  }

  // ── Step 7 : Classify status ──────────────────────────────────────────────
  const minFull = RULES.MIN_FOR_FULL_DAY_MIN[season];
  const minHalf = RULES.MIN_FOR_HALF_DAY_MIN[season];

  let status;

  if (forcedHalfDay) {
    status = RULES.STATUS.HALF_DAY;
  } else if (effectiveMins >= minFull) {
    status = RULES.STATUS.FULL_DAY;
    breakdown.push({
      label: "Full Day ✓",
      detail: `Effective ${toHuman(effectiveMins)} ≥ min ${toHuman(minFull)} for ${season === "JAN_MAR" ? "Jan–Mar" : "Apr–Dec"}`,
      value: "Full Day",
      type: "good",
    });
  } else if (effectiveMins >= minHalf) {
    status = RULES.STATUS.HALF_DAY;
    breakdown.push({
      label: "Half Day",
      detail: `Effective ${toHuman(effectiveMins)} < full-day min (${toHuman(minFull)}) but ≥ half-day min (${toHuman(minHalf)})`,
      value: "Half Day",
      type: "warn",
    });
  } else {
    status = RULES.STATUS.ABSENT;
    breakdown.push({
      label: "Absent",
      detail: `Effective ${toHuman(effectiveMins)} < half-day min (${toHuman(minHalf)}) → Absent`,
      value: "Absent",
      type: "bad",
    });
  }

  return makeResult(dateStr, punches, season, {
    inTime,
    outTime,
    grossMins,
    oooPairs,
    unpairedPunch,
    totalOOODeductedMins,
    effectiveMins,
    status,
    breakdown,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary aggregator
// ─────────────────────────────────────────────────────────────────────────────

export function calculateSummary(dayResults) {
  const working = dayResults.filter((d) => d.status !== RULES.STATUS.WEEK_OFF);

  const full = working.filter((d) => d.status === RULES.STATUS.FULL_DAY).length;
  const half = working.filter((d) => d.status === RULES.STATUS.HALF_DAY).length;
  const absent = working.filter((d) => d.status === RULES.STATUS.ABSENT).length;
  const missing = working.filter(
    (d) => d.status === RULES.STATUS.MISSING_PUNCH
  ).length;
  const weekOff = dayResults.filter(
    (d) => d.status === RULES.STATUS.WEEK_OFF
  ).length;

  const totalEffective = working.reduce(
    (s, d) => s + (d.effectiveMins || 0),
    0
  );
  const totalOOO = working.reduce(
    (s, d) => s + (d.totalOOODeductedMins || 0),
    0
  );

  // Attendance % = (full + half*0.5) / total working days
  const pct =
    working.length > 0
      ? Math.round(((full + half * 0.5) / working.length) * 100)
      : 0;

  return {
    full,
    half,
    absent,
    missing,
    weekOff,
    totalEffective,
    totalOOO,
    pct,
    totalWorkingDays: working.length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal factory
// ─────────────────────────────────────────────────────────────────────────────

function makeResult(dateStr, punches, season, overrides) {
  return {
    dateStr,
    season,
    punches,
    inTime: null,
    outTime: null,
    grossMins: null,
    oooPairs: [],
    unpairedPunch: null,
    totalOOODeductedMins: 0,
    effectiveMins: null,
    status: RULES.STATUS.ABSENT,
    statusColor:
      RULES.STATUS_COLOR[
        Object.keys(RULES.STATUS).find(
          (k) => RULES.STATUS[k] === (overrides.status || RULES.STATUS.ABSENT)
        )
      ] || "#666",
    breakdown: [],
    ...overrides,
    // Resolve statusColor from final status
    statusColor:
      RULES.STATUS_COLOR[
        Object.keys(RULES.STATUS).find(
          (k) => RULES.STATUS[k] === (overrides.status || RULES.STATUS.ABSENT)
        )
      ] || "#666",
  };
}

/**
 * attendanceCalculator.js
 *
 * Applies all business rules from attendanceRules.js to produce:
 *  - Per-day result with full breakdown + diffMins (how much over/under target)
 *  - Summary with quarterly balance (positive/negative/net hours)
 *
 * PUNCH INTERPRETATION:
 *   Given N sorted punches in a day:
 *   • punch[0]       = IN  time
 *   • punch[N-1]     = OUT time
 *   • punch[1..N-2]  = mid-day OOO pairs: (out,in), (out,in) …
 *     If middle count is odd → last middle punch is unpaired
 */

import { RULES, getSeason } from "../attendanceRules.js";

// ─────────────────────────────────────────────────────────────────────────────
// Time helpers (exported so components can use them)
// ─────────────────────────────────────────────────────────────────────────────

/** "HH:MM" → total minutes from midnight */
export function toMins(hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** minutes → "HH:MM" (handles negative) */
export function toHHMM(mins) {
  if (mins == null || isNaN(mins)) return "--";
  const sign = mins < 0 ? "-" : "";
  const abs = Math.abs(mins);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

/** minutes → "+Xh Ym" / "-Xh Ym" human label */
export function toHuman(mins) {
  if (mins == null || isNaN(mins)) return "--";
  if (mins === 0) return "0 m";
  const sign = mins < 0 ? "-" : "+";
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const str = h === 0 ? `${m} m` : m === 0 ? `${h} h` : `${h} h ${m} m`;
  return `${sign}${str}`;
}

/** Same as toHuman but no sign prefix (for gross/effective display) */
export function toHumanAbs(mins) {
  if (mins == null || isNaN(mins)) return "--";
  if (mins === 0) return "0 m";
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return h === 0 ? `${m} m` : m === 0 ? `${h} h` : `${h} h ${m} m`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-day calculator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {string} dateStr  YYYY-MM-DD
 * @param {{ time, clockId, clockName }[]} punches  sorted ASC
 * @returns DayResult
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
      diffMins: 0,
      breakdown: [
        {
          label: "Week Off",
          detail: "Falls on a configured week-off (Sat/Sun).",
          type: "info",
        },
      ],
    });
  }

  const targetMins = RULES.FULL_DAY_TARGET_MIN[season]; // what a full day expects

  // ── No punches → Absent ───────────────────────────────────────────────────
  if (!punches || punches.length === 0) {
    return makeResult(dateStr, [], season, {
      status: RULES.STATUS.ABSENT,
      diffMins: -targetMins, // full day missed = full negative
      breakdown: [
        { label: "Absent", detail: "No punch records found.", type: "bad" },
      ],
    });
  }

  // ── Only 1 punch → Missing Punch ─────────────────────────────────────────
  if (punches.length === 1) {
    return makeResult(dateStr, punches, season, {
      inTime: punches[0].time,
      status: RULES.STATUS.MISSING_PUNCH,
      diffMins: null, // can't calculate without both punches
      breakdown: [
        {
          label: "Only 1 Punch",
          detail: `Recorded: ${punches[0].time}. Need both IN and OUT.`,
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
    detail: `OUT (${outTime}) − IN (${inTime}) = ${toHumanAbs(grossMins)}`,
    value: toHHMM(grossMins),
    type: "neutral",
  });

  // ── Step 2 : OOO pairs from middle punches ────────────────────────────────
  const midPunches = punches.slice(1, punches.length - 1);
  const oooPairs = [];
  for (let i = 0; i < midPunches.length - 1; i += 2) {
    oooPairs.push({ out: midPunches[i].time, in: midPunches[i + 1].time });
  }
  const unpairedPunch =
    midPunches.length % 2 !== 0 ? midPunches[midPunches.length - 1].time : null;

  // ── Step 3 : OOO deduction with lunch relaxation ──────────────────────────
  const lunchStart = toMins(RULES.LUNCH_RELAX_START);
  const lunchEnd = toMins(RULES.LUNCH_RELAX_END);
  let totalOOODeductedMins = 0;

  oooPairs.forEach((pair, i) => {
    const oooOut = toMins(pair.out);
    const oooIn = toMins(pair.in);
    const rawMins = oooIn - oooOut;
    const freeStart = Math.max(oooOut, lunchStart);
    const freeEnd = Math.min(oooIn, lunchEnd);
    const freeMins = Math.max(0, freeEnd - freeStart);
    const deductMins = rawMins - freeMins;

    totalOOODeductedMins += deductMins;

    breakdown.push({
      label: `OOO #${i + 1}`,
      detail:
        freeMins > 0
          ? `Out ${pair.out} → In ${pair.in} = ${toHumanAbs(rawMins)}. Lunch free: ${toHumanAbs(freeMins)} → Deducted: ${toHumanAbs(deductMins)}`
          : `Out ${pair.out} → In ${pair.in} = ${toHumanAbs(rawMins)} → fully deducted`,
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
    detail: `Gross (${toHumanAbs(grossMins)}) − OOO (${toHumanAbs(totalOOODeductedMins)}) = ${toHumanAbs(effectiveMins)}`,
    value: toHHMM(effectiveMins),
    type: "highlight",
  });

  // ── Step 5 : Late join check ──────────────────────────────────────────────
  let forcedHalfDay = false;
  if (inMins > toMins(RULES.LATE_JOIN_CUTOFF)) {
    forcedHalfDay = true;
    breakdown.push({
      label: "Late Join",
      detail: `Joined at ${inTime} (after ${RULES.LATE_JOIN_CUTOFF}) → capped at Half Day`,
      value: "Half Day cap",
      type: "bad",
    });
  }

  // ── Step 6 : Early leave check ────────────────────────────────────────────
  const earlyLeaveCutoff = RULES.EARLY_LEAVE_CUTOFF[season];
  if (!forcedHalfDay && outMins < toMins(earlyLeaveCutoff)) {
    forcedHalfDay = true;
    breakdown.push({
      label: "Early Leave",
      detail: `Left at ${outTime} (before ${earlyLeaveCutoff} for ${season === "JAN_MAR" ? "Jan–Mar" : "Apr–Dec"}) → capped at Half Day`,
      value: "Half Day cap",
      type: "bad",
    });
  }

  // ── Step 7 : Classify status ──────────────────────────────────────────────
  const minFull = RULES.MIN_FOR_FULL_DAY_MIN[season];
  const minHalf = RULES.MIN_FOR_HALF_DAY_MIN[season];
  const halfTarget = RULES.HALF_DAY_TARGET_MIN[season];

  let status;
  let diffMins; // positive = worked extra, negative = worked less than expected

  if (forcedHalfDay) {
    status = RULES.STATUS.HALF_DAY;
    // diff = effective vs half-day target
    diffMins = effectiveMins - halfTarget;
    breakdown.push({
      label: "vs Half Day Target",
      detail: `Effective ${toHumanAbs(effectiveMins)} vs half-day target ${toHumanAbs(halfTarget)}`,
      value: toHuman(diffMins),
      type: diffMins >= 0 ? "good" : "bad",
    });
  } else if (effectiveMins >= minFull) {
    status = RULES.STATUS.FULL_DAY;
    diffMins = effectiveMins - targetMins; // vs full day target
    breakdown.push({
      label: "Full Day ✓",
      detail: `Effective ${toHumanAbs(effectiveMins)} ≥ min ${toHumanAbs(minFull)} (${season === "JAN_MAR" ? "Jan–Mar" : "Apr–Dec"})`,
      value: "Full Day",
      type: "good",
    });
    breakdown.push({
      label: "vs Full Day Target",
      detail: `Effective ${toHumanAbs(effectiveMins)} vs full-day target ${toHumanAbs(targetMins)}`,
      value: toHuman(diffMins),
      type: diffMins >= 0 ? "good" : "bad",
    });
  } else if (effectiveMins >= minHalf) {
    status = RULES.STATUS.HALF_DAY;
    diffMins = effectiveMins - halfTarget;
    breakdown.push({
      label: "Half Day",
      detail: `Effective ${toHumanAbs(effectiveMins)} < full-day min (${toHumanAbs(minFull)}) but ≥ half-day min (${toHumanAbs(minHalf)})`,
      value: "Half Day",
      type: "warn",
    });
    breakdown.push({
      label: "vs Half Day Target",
      detail: `Effective ${toHumanAbs(effectiveMins)} vs half-day target ${toHumanAbs(halfTarget)}`,
      value: toHuman(diffMins),
      type: diffMins >= 0 ? "good" : "bad",
    });
  } else {
    status = RULES.STATUS.ABSENT;
    diffMins = -targetMins; // full day missed
    breakdown.push({
      label: "Absent",
      detail: `Effective ${toHumanAbs(effectiveMins)} < half-day min (${toHumanAbs(minHalf)}) → Absent`,
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
    diffMins,
    status,
    breakdown,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary + quarterly balance
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns overall summary AND quarterly breakdown with positive/negative/net.
 *
 * Quarter grouping per company policy:
 *   Q1 → Jan–Mar  (checked at end of March)
 *   Q2 → Apr–Jun  (checked at end of June)
 *   Q3 → Jul–Sep  (checked at end of September)
 *   Q4 → Oct–Dec  (checked at end of December)
 */
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

  // Total diff across all days (skip null — missing punch days)
  const totalDiff = working.reduce((s, d) => s + (d.diffMins ?? 0), 0);
  const positive = working.reduce(
    (s, d) => s + Math.max(0, d.diffMins ?? 0),
    0
  );
  const negative = working.reduce(
    (s, d) => s + Math.min(0, d.diffMins ?? 0),
    0
  );

  const pct =
    working.length > 0
      ? Math.round(((full + half * 0.5) / working.length) * 100)
      : 0;

  // ── Quarterly breakdown ───────────────────────────────────────────────────
  const quarterMap = {};

  dayResults.forEach((d) => {
    if (d.status === RULES.STATUS.WEEK_OFF) return;
    const month = new Date(d.dateStr + "T00:00:00").getMonth() + 1;
    const qKey = getQuarterKey(month);
    if (!quarterMap[qKey]) {
      quarterMap[qKey] = {
        label: getQuarterLabel(month),
        positive: 0,
        negative: 0,
        days: 0,
      };
    }
    const diff = d.diffMins ?? 0;
    quarterMap[qKey].positive += Math.max(0, diff);
    quarterMap[qKey].negative += Math.min(0, diff);
    quarterMap[qKey].days += 1;
  });

  const quarters = Object.entries(quarterMap).map(([key, q]) => ({
    key,
    label: q.label,
    positive: q.positive,
    negative: q.negative,
    net: q.positive + q.negative,
    days: q.days,
  }));

  return {
    full,
    half,
    absent,
    missing,
    weekOff,
    totalEffective,
    totalOOO,
    totalDiff,
    positive,
    negative,
    pct,
    totalWorkingDays: working.length,
    quarters,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

function getQuarterKey(month) {
  if (month <= 3) return "Q1";
  if (month <= 6) return "Q2";
  if (month <= 9) return "Q3";
  return "Q4";
}

function getQuarterLabel(month) {
  if (month <= 3) return "Q1 (Jan–Mar)";
  if (month <= 6) return "Q2 (Apr–Jun)";
  if (month <= 9) return "Q3 (Jul–Sep)";
  return "Q4 (Oct–Dec)";
}

function makeResult(dateStr, punches, season, overrides) {
  const finalStatus = overrides.status || RULES.STATUS.ABSENT;
  const statusKey = Object.keys(RULES.STATUS).find(
    (k) => RULES.STATUS[k] === finalStatus
  );
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
    diffMins: null,
    status: finalStatus,
    statusColor: RULES.STATUS_COLOR[statusKey] || "#666",
    breakdown: [],
    ...overrides,
    // Always resolve statusColor from the final (possibly overridden) status
    statusColor:
      RULES.STATUS_COLOR[
        Object.keys(RULES.STATUS).find(
          (k) => RULES.STATUS[k] === (overrides.status || RULES.STATUS.ABSENT)
        )
      ] || "#666",
  };
}

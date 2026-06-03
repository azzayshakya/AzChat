import { ATTENDANCE_RULES } from "../attendanceRules.js";

const R = ATTENDANCE_RULES;

// ── Time helpers ──────────────────────────────────────────────────────────────

/** "HH:MM" → total minutes from midnight */
export function timeToMinutes(time) {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Minutes → "HH:MM" */
export function minutesToTime(minutes) {
  if (minutes == null || isNaN(minutes)) return "--";
  const h = Math.floor(Math.abs(minutes) / 60);
  const m = Math.abs(minutes) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Minutes → "Xh Ym" display string */
export function minutesToHumanTime(minutes) {
  if (minutes == null || isNaN(minutes)) return "--";
  const h = Math.floor(Math.abs(minutes) / 60);
  const m = Math.abs(minutes) % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ── Core calculation per day ───────────────────────────────────────────────────

/**
 * Calculates full attendance details for a single attendance row.
 *
 * @param {Object} row  - Normalised attendance row from excelParser
 * @returns {DayResult}
 */
export function calculateDayAttendance(row) {
  const { date, inTime, outTime, oooEntries = [] } = row;

  const result = {
    date,
    inTime,
    outTime,
    oooEntries,

    // Computed fields
    totalMinutes: null, // outTime - inTime (gross)
    oooMinutes: 0, // total mid-day out minutes
    oooAllowedMinutes: R.MAX_OOO_ALLOWED_MINUTES,
    oooDeductedMinutes: 0, // actual deduction from OOO
    effectiveMinutes: null, // totalMinutes - oooDeductedMinutes
    lateMinutes: 0, // how late (after grace) arrival
    overtimeMinutes: 0,

    status: null,
    statusColor: null,

    // Breakdown object for UI transparency
    breakdown: [],
  };

  // ── Week-off check ──────────────────────────────────────────────────────────
  if (date) {
    const dow = new Date(date + "T00:00:00").getDay(); // 0=Sun…6=Sat
    if (R.WEEK_OFF_DAYS.includes(dow)) {
      result.status = R.STATUS_LABELS.WEEK_OFF;
      result.statusColor = R.STATUS_COLORS.WEEK_OFF;
      result.breakdown = [
        {
          label: "Week Off",
          detail: "Day falls on a configured week-off day.",
        },
      ];
      return result;
    }
  }

  // ── No punch data ───────────────────────────────────────────────────────────
  if (!inTime && !outTime) {
    result.status = R.STATUS_LABELS.ABSENT;
    result.statusColor = R.STATUS_COLORS.ABSENT;
    result.breakdown = [
      { label: "Absent", detail: "No punch-in or punch-out recorded." },
    ];
    return result;
  }

  // ── Gross time ──────────────────────────────────────────────────────────────
  const inMins = timeToMinutes(inTime);
  const outMins = timeToMinutes(outTime);

  if (inMins == null || outMins == null) {
    result.status = R.STATUS_LABELS.ABSENT;
    result.statusColor = R.STATUS_COLORS.ABSENT;
    result.breakdown = [
      {
        label: "Invalid Times",
        detail: "Could not parse punch-in or punch-out times.",
      },
    ];
    return result;
  }

  result.totalMinutes = outMins - inMins;
  result.breakdown.push({
    label: "Gross Hours",
    detail: `OutTime (${outTime}) − InTime (${inTime}) = ${minutesToHumanTime(result.totalMinutes)}`,
    value: minutesToHumanTime(result.totalMinutes),
  });

  // ── Late arrival ───────────────────────────────────────────────────────────
  const shiftStartMins = timeToMinutes(R.SHIFT_START_TIME);
  const graceEnd = shiftStartMins + R.GRACE_PERIOD_MINUTES;
  if (inMins > graceEnd) {
    result.lateMinutes = inMins - shiftStartMins;
    result.breakdown.push({
      label: "Late Arrival",
      detail: `Arrived at ${inTime}, shift starts ${R.SHIFT_START_TIME} (grace: ${R.GRACE_PERIOD_MINUTES} min) → late by ${minutesToHumanTime(result.lateMinutes)}`,
      value: minutesToHumanTime(result.lateMinutes),
      warn: true,
    });
  }

  // ── OOO (mid-day out) ──────────────────────────────────────────────────────
  let rawOOOMinutes = 0;
  oooEntries.forEach((entry, i) => {
    if (!entry.out || !entry.in) return;
    const ooOut = timeToMinutes(entry.out);
    const ooIn = timeToMinutes(entry.in);
    if (ooOut != null && ooIn != null && ooIn > ooOut) {
      const duration = ooIn - ooOut;
      rawOOOMinutes += duration;
      result.breakdown.push({
        label: `OOO #${i + 1}`,
        detail: `Left at ${entry.out}, returned at ${entry.in} = ${minutesToHumanTime(duration)}`,
        value: minutesToHumanTime(duration),
        warn: true,
      });
    }
  });

  result.oooMinutes = rawOOOMinutes;

  if (rawOOOMinutes > 0) {
    const excess = Math.max(0, rawOOOMinutes - R.MAX_OOO_ALLOWED_MINUTES);
    result.oooDeductedMinutes = excess * R.OOO_DEDUCTION_PER_MINUTE;
    result.breakdown.push({
      label: "OOO Deduction",
      detail: `Total OOO: ${minutesToHumanTime(rawOOOMinutes)}, Free: ${R.MAX_OOO_ALLOWED_MINUTES} min → Deducted: ${minutesToHumanTime(result.oooDeductedMinutes)}`,
      value: `−${minutesToHumanTime(result.oooDeductedMinutes)}`,
      deduct: true,
    });
  }

  // ── Effective hours ────────────────────────────────────────────────────────
  result.effectiveMinutes = result.totalMinutes - result.oooDeductedMinutes;
  result.breakdown.push({
    label: "Effective Hours",
    detail: `Gross (${minutesToHumanTime(result.totalMinutes)}) − OOO Deduction (${minutesToHumanTime(result.oooDeductedMinutes)}) = ${minutesToHumanTime(result.effectiveMinutes)}`,
    value: minutesToHumanTime(result.effectiveMinutes),
    highlight: true,
  });

  // ── Overtime ───────────────────────────────────────────────────────────────
  const requiredMins = R.OVERTIME_AFTER_HOURS * 60;
  if (result.effectiveMinutes > requiredMins) {
    result.overtimeMinutes = result.effectiveMinutes - requiredMins;
    result.breakdown.push({
      label: "Overtime",
      detail: `Worked ${minutesToHumanTime(result.effectiveMinutes)} > ${R.OVERTIME_AFTER_HOURS}h → OT: ${minutesToHumanTime(result.overtimeMinutes)}`,
      value: `+${minutesToHumanTime(result.overtimeMinutes)}`,
      good: true,
    });
  }

  // ── Status classification ──────────────────────────────────────────────────
  const effectiveHours = result.effectiveMinutes / 60;

  if (effectiveHours >= R.FULL_DAY_THRESHOLD_HOURS) {
    result.status =
      result.overtimeMinutes > 0
        ? R.STATUS_LABELS.OVERTIME
        : R.STATUS_LABELS.FULL_DAY;
    result.statusColor =
      result.overtimeMinutes > 0
        ? R.STATUS_COLORS.OVERTIME
        : R.STATUS_COLORS.FULL_DAY;
  } else if (effectiveHours >= R.HALF_DAY_THRESHOLD_HOURS) {
    result.status = R.STATUS_LABELS.HALF_DAY;
    result.statusColor = R.STATUS_COLORS.HALF_DAY;
  } else {
    result.status = R.STATUS_LABELS.ABSENT;
    result.statusColor = R.STATUS_COLORS.ABSENT;
  }

  result.breakdown.push({
    label: "Final Status",
    detail: `${minutesToHumanTime(result.effectiveMinutes)} effective → Rule: Full Day ≥${R.FULL_DAY_THRESHOLD_HOURS}h, Half Day ≥${R.HALF_DAY_THRESHOLD_HOURS}h`,
    value: result.status,
    status: true,
  });

  return result;
}

// ── Aggregate summary ─────────────────────────────────────────────────────────

/**
 * Given all calculated day results for one employee, returns a summary.
 */
export function calculateSummary(dayResults) {
  const workDays = dayResults.filter(
    (d) =>
      d.status !== R.STATUS_LABELS.WEEK_OFF &&
      d.status !== R.STATUS_LABELS.HOLIDAY
  );

  const fullDays = workDays.filter(
    (d) => d.status === R.STATUS_LABELS.FULL_DAY
  ).length;
  const halfDays = workDays.filter(
    (d) => d.status === R.STATUS_LABELS.HALF_DAY
  ).length;
  const overtimeDays = workDays.filter(
    (d) => d.status === R.STATUS_LABELS.OVERTIME
  ).length;
  const absentDays = workDays.filter(
    (d) => d.status === R.STATUS_LABELS.ABSENT
  ).length;
  const weekOffs = dayResults.filter(
    (d) => d.status === R.STATUS_LABELS.WEEK_OFF
  ).length;

  const totalEffectiveMins = workDays.reduce(
    (s, d) => s + (d.effectiveMinutes || 0),
    0
  );
  const totalOvertimeMins = workDays.reduce(
    (s, d) => s + (d.overtimeMinutes || 0),
    0
  );
  const totalOOOMins = workDays.reduce((s, d) => s + (d.oooMinutes || 0), 0);
  const requiredMins = workDays.length * R.TOTAL_REQUIRED_WORKING_HOURS * 60;
  const deficitMins = Math.max(0, requiredMins - totalEffectiveMins);

  return {
    totalWorkDays: workDays.length,
    fullDays,
    halfDays,
    overtimeDays,
    absentDays,
    weekOffs,
    totalEffectiveMins,
    totalOvertimeMins,
    totalOOOMins,
    requiredMins,
    deficitMins,
    attendancePercent:
      workDays.length > 0
        ? Math.round(
            ((fullDays + halfDays * 0.5 + overtimeDays) / workDays.length) * 100
          )
        : 0,
  };
}

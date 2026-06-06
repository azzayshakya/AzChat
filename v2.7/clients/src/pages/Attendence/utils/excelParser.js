/**
 * excelParser.js
 *
 * Parses the biometric system's attendance export.
 *
 * FILE FORMAT:
 *   The system saves an HTML <table> with a .xls extension.
 *   SheetJS reads this transparently.
 *
 * COLUMNS (exact headers from the system):
 *   Employee Code | Clock ID | Clock Name | Attendance Date | Attendance Time | Type
 *
 * KEY INSIGHT — each row is ONE punch swipe, NOT a day summary:
 *   • Sorted punches per day: first = IN, last = OUT, middle pairs = OOO exits
 *   • Must use raw:true so SheetJS returns original "DD.MM.YYYY" strings
 *     (raw:false or cellDates:true both mangle the date format)
 *   • Time format: HH:MM:SS
 */

import * as XLSX from "xlsx";

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export function parseAttendanceFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file."));

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);

        // IMPORTANT: raw:true is required for this file.
        // The file is an HTML table saved as .xls — SheetJS reads the original
        // cell strings directly. raw:false / cellDates:true both corrupt the
        // DD.MM.YYYY date strings into wrong formats.
        const workbook = XLSX.read(data, { type: "array", raw: true });

        if (!workbook.SheetNames.length)
          throw new Error("No sheets found in the file.");

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(sheet, {
          defval: "",
          raw: true,
        });

        if (!rawRows.length) throw new Error("The sheet is empty.");

        const rawHeaders = Object.keys(rawRows[0]);
        const colMap = detectColumns(rawHeaders);
        validateColumns(colMap, rawHeaders);

        const punches = rawRows
          .map((r) => normaliseRow(r, colMap))
          .filter(Boolean);

        if (!punches.length)
          throw new Error("No valid punch records found after parsing.");

        resolve({
          employees: buildEmployeeList(punches),
          punchMap: buildPunchMap(punches),
          dateRange: buildDateRange(punches),
          rawHeaders,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.readAsArrayBuffer(file);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Column detection — case-insensitive alias matching
// ─────────────────────────────────────────────────────────────────────────────

const ALIASES = {
  empCode: [
    "employee code",
    "empcode",
    "emp code",
    "emp_code",
    "employeecode",
    "employee_code",
    "empid",
    "emp id",
  ],
  clockId: ["clock id", "clockid", "clock_id"],
  clockName: ["clock name", "clockname", "clock_name"],
  date: ["attendance date", "attendancedate", "attendance_date", "date"],
  time: [
    "attendance time",
    "attendancetime",
    "attendance_time",
    "time",
    "punch time",
  ],
};

function detectColumns(headers) {
  const map = {};
  headers.forEach((h) => {
    const lower = h.toLowerCase().trim();
    Object.entries(ALIASES).forEach(([field, aliases]) => {
      if (!map[field] && aliases.includes(lower)) map[field] = h;
    });
  });
  return map;
}

function validateColumns(colMap, rawHeaders) {
  const required = ["empCode", "date", "time"];
  const missing = required.filter((f) => !colMap[f]);
  if (missing.length) {
    throw new Error(
      `Missing columns: ${missing.join(", ")}.\n` +
        `File headers: ${rawHeaders.join(", ")}.\n` +
        `Expected: "Employee Code", "Attendance Date", "Attendance Time".`
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Row normalisation
// ─────────────────────────────────────────────────────────────────────────────

function normaliseRow(row, colMap) {
  const empCode = String(row[colMap.empCode] || "").trim();
  const rawDate = String(row[colMap.date] || "").trim();
  const rawTime = String(row[colMap.time] || "").trim();
  const clockId = String(row[colMap.clockId] || "").trim();
  const clockName = String(row[colMap.clockName] || "").trim();

  if (!empCode || !rawDate || !rawTime) return null;

  const date = parseAnyDate(rawDate);
  const time = parseTime(rawTime);

  if (!date || !time) return null;

  return { empCode, date, time, clockId, clockName };
}

/**
 * Parses any date format that SheetJS might return.
 * All formats → YYYY-MM-DD
 *
 *  "01.04.2026"  DD.MM.YYYY  ← this file uses this (raw:true preserves it)
 *  "1/4/26"      D/M/YY      ← SheetJS raw:false output
 *  "4/1/26"      M/D/YY      ← SheetJS cellDates:true output (mangled)
 *  "2026-04-01"  YYYY-MM-DD  ← already correct
 *  46026         serial num  ← raw numeric fallback
 */
function parseAnyDate(raw) {
  if (!raw) return null;
  raw = String(raw).trim();

  // DD.MM.YYYY  ← primary format for this file
  const mDot = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (mDot) {
    return `${mDot[3]}-${mDot[2].padStart(2, "0")}-${mDot[1].padStart(2, "0")}`;
  }

  // YYYY-MM-DD  ← already correct
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  // D/M/YY or D/M/YYYY  ← SheetJS raw:false output
  const mSlash = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (mSlash) {
    let [, d, m, y] = mSlash;
    if (y.length === 2) y = "20" + y;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // Excel serial number (e.g. 46026)
  if (/^\d{5}$/.test(raw)) {
    const ms = (parseInt(raw, 10) - 25569) * 86400000;
    const utc = new Date(ms);
    return isNaN(utc) ? null : utc.toISOString().slice(0, 10);
  }

  return null;
}

/** HH:MM:SS or HH:MM → HH:MM */
export function parseTime(raw) {
  const m = String(raw)
    .trim()
    .match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  return m ? `${m[1].padStart(2, "0")}:${m[2]}` : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Build data structures
// ─────────────────────────────────────────────────────────────────────────────

/**
 * punchMap: Map<empCode → Map<date(YYYY-MM-DD) → punch[]>>
 * Punches within each day are sorted chronologically.
 */
function buildPunchMap(punches) {
  const map = new Map();

  punches.forEach(({ empCode, date, time, clockId, clockName }) => {
    if (!map.has(empCode)) map.set(empCode, new Map());
    const empMap = map.get(empCode);
    if (!empMap.has(date)) empMap.set(date, []);
    empMap.get(date).push({ time, clockId, clockName });
  });

  // Sort punches within each day chronologically
  map.forEach((empMap) =>
    empMap.forEach((dayPunches) =>
      dayPunches.sort((a, b) => a.time.localeCompare(b.time))
    )
  );

  return map;
}

function buildEmployeeList(punches) {
  const seen = new Map();
  punches.forEach(({ empCode, clockName }) => {
    if (!seen.has(empCode)) seen.set(empCode, { empCode, clockName });
  });
  return [...seen.values()].sort((a, b) => a.empCode.localeCompare(b.empCode));
}

function buildDateRange(punches) {
  const dates = [...new Set(punches.map((p) => p.date))].sort();
  return { from: dates[0] || null, to: dates[dates.length - 1] || null };
}

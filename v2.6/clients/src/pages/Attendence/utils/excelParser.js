/**
 * excelParser.js
 *
 * Parses the biometric system's attendance export.
 *
 * FILE FORMAT:
 *   The system saves an HTML <table> with a .xls extension.
 *   SheetJS reads this transparently — no special handling needed.
 *
 * COLUMNS (exact headers from the system):
 *   Employee Code | Clock ID | Clock Name | Attendance Date | Attendance Time | Type
 *
 * KEY INSIGHT — each row is ONE punch swipe, NOT a day summary:
 *   • Sorted punches per day: first = IN, last = OUT, middle pairs = OOO exits
 *   • Date format : DD.MM.YYYY
 *   • Time format : HH:MM:SS
 *   • Clock 3151  : REGULAR / PERSONAL gate (main entry/exit)
 *   • Clock 3252  : LUNCH gate (mid-day exit/entry)
 */

import * as XLSX from "xlsx";

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {File} file  — .xls / .xlsx / .csv uploaded by user
 * @returns {Promise<ParseResult>}
 *
 * ParseResult = {
 *   employees : { empCode: string, clockName: string }[],
 *   punchMap  : Map<empCode, Map<dateYYYYMMDD, { time: "HH:MM", clockId, clockName }[]>>,
 *   dateRange : { from: string, to: string }  (YYYY-MM-DD),
 *   rawHeaders: string[],
 * }
 */
export function parseAttendanceFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file."));

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array", raw: false });

        if (!workbook.SheetNames.length)
          throw new Error("No sheets found in the file.");

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

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

  const date = parseDotDate(rawDate); // DD.MM.YYYY → YYYY-MM-DD
  const time = toHHMM(rawTime); // HH:MM:SS  → HH:MM

  if (!date || !time) return null;

  return { empCode, date, time, clockId, clockName };
}

/** DD.MM.YYYY → YYYY-MM-DD */
function parseDotDate(raw) {
  const m = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  const d = new Date(raw);
  return isNaN(d) ? null : d.toISOString().slice(0, 10);
}

/** HH:MM:SS or HH:MM → HH:MM */
export function toHHMM(raw) {
  const m = raw.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  return m ? `${m[1].padStart(2, "0")}:${m[2]}` : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Build data structures
// ─────────────────────────────────────────────────────────────────────────────

/**
 * punchMap: Map<empCode → Map<date → punch[]>>
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

  // Sort punches within each day by time
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

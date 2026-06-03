import * as XLSX from "xlsx";

/**
 * Parses an uploaded Excel / CSV file and returns normalised attendance rows.
 *
 * Expected columns (case-insensitive, order-independent):
 *   EmpID / EmployeeID / Emp_ID
 *   EmpName / Name / EmployeeName
 *   Date
 *   InTime  / In  / CheckIn
 *   OutTime / Out / CheckOut
 *   FileType / Type / ShiftType  (optional)
 *
 * Returns:
 *   { rows: AttendanceRow[], employees: Employee[], dateRange: { from, to }, rawHeaders: string[] }
 */
export function parseAttendanceFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read file."));

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });

        if (!workbook.SheetNames.length) {
          reject(new Error("No sheets found in the file."));
          return;
        }

        // Use first sheet
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(sheet, {
          raw: false,
          dateNF: "yyyy-mm-dd",
          defval: "",
        });

        if (!rawRows.length) {
          reject(new Error("The sheet appears to be empty."));
          return;
        }

        const rawHeaders = Object.keys(rawRows[0]);
        const colMap = buildColumnMap(rawHeaders);

        validateRequiredColumns(colMap);

        const rows = rawRows
          .map((row, idx) => normaliseRow(row, colMap, idx))
          .filter((r) => r !== null);

        if (!rows.length) {
          reject(new Error("No valid attendance rows found after parsing."));
          return;
        }

        const employees = buildEmployeeList(rows);
        const dateRange = buildDateRange(rows);

        resolve({ rows, employees, dateRange, rawHeaders });
      } catch (err) {
        reject(err);
      }
    };

    reader.readAsArrayBuffer(file);
  });
}

// ── Internal helpers ─────────────────────────────────────────────────────────

const COLUMN_ALIASES = {
  empId: [
    "empid",
    "employeeid",
    "emp_id",
    "employee_id",
    "id",
    "empcode",
    "emp code",
    "employee code",
  ],
  empName: [
    "empname",
    "name",
    "employeename",
    "employee_name",
    "employee name",
    "full name",
    "fullname",
  ],
  date: ["date", "attendancedate", "attendance_date", "day", "workdate"],
  inTime: [
    "intime",
    "in",
    "checkin",
    "check_in",
    "in_time",
    "punch_in",
    "punchin",
    "entry time",
    "entrytime",
  ],
  outTime: [
    "outtime",
    "out",
    "checkout",
    "check_out",
    "out_time",
    "punch_out",
    "punchout",
    "exit time",
    "exittime",
  ],
  fileType: [
    "filetype",
    "type",
    "shifttype",
    "shift_type",
    "category",
    "emp type",
    "emptype",
  ],
};

function buildColumnMap(headers) {
  const map = {};
  headers.forEach((h) => {
    const key = h.toLowerCase().replace(/\s+/g, " ").trim();
    Object.entries(COLUMN_ALIASES).forEach(([field, aliases]) => {
      if (!map[field] && aliases.includes(key)) {
        map[field] = h; // original header name
      }
    });
  });
  return map;
}

function validateRequiredColumns(colMap) {
  const required = ["empId", "date", "inTime", "outTime"];
  const missing = required.filter((f) => !colMap[f]);
  if (missing.length) {
    throw new Error(
      `Missing required columns: ${missing.join(", ")}.\n` +
        `Expected column names like: EmpID, Date, InTime, OutTime.\n` +
        `Found headers but couldn't map them.`
    );
  }
}

function normaliseRow(row, colMap, idx) {
  const empId = String(row[colMap.empId] || "").trim();
  const date = String(row[colMap.date] || "").trim();
  const inTime = String(row[colMap.inTime] || "").trim();
  const outTime = String(row[colMap.outTime] || "").trim();

  // Skip rows with no empId or date
  if (!empId || !date) return null;

  const empName = colMap.empName
    ? String(row[colMap.empName] || "").trim()
    : empId;
  const fileType = colMap.fileType
    ? String(row[colMap.fileType] || "").trim()
    : "Regular";

  // Collect any extra OOO columns: "Out1", "In1", "Out2", "In2" ...
  const oooEntries = extractOOOEntries(row, colMap);

  return {
    _idx: idx,
    empId,
    empName: empName || empId,
    fileType,
    date: normaliseDate(date),
    inTime: normaliseTime(inTime),
    outTime: normaliseTime(outTime),
    oooEntries, // [{out, in}, ...]
    rawDate: date,
  };
}

/** Support patterns like Out1/In1, Out2/In2 for mid-day exits */
function extractOOOEntries(row, colMap) {
  const entries = [];
  const keys = Object.keys(row).map((k) => k.toLowerCase());
  let i = 1;
  while (true) {
    const outKey = keys.find((k) => k === `out${i}` || k === `ooo_out${i}`);
    const inKey = keys.find((k) => k === `in${i}` || k === `ooo_in${i}`);
    if (!outKey && !inKey) break;
    const outVal = outKey ? Object.values(row)[keys.indexOf(outKey)] : "";
    const inVal = inKey ? Object.values(row)[keys.indexOf(inKey)] : "";
    if (outVal || inVal) {
      entries.push({
        out: normaliseTime(String(outVal || "")),
        in: normaliseTime(String(inVal || "")),
      });
    }
    i++;
    if (i > 10) break;
  }
  return entries;
}

/** Normalise date to YYYY-MM-DD */
function normaliseDate(raw) {
  if (!raw) return null;
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  // DD/MM/YYYY or DD-MM-YYYY
  const m1 = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m1) return `${m1[3]}-${m1[2].padStart(2, "0")}-${m1[1].padStart(2, "0")}`;
  // MM/DD/YYYY
  const m2 = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m2) return `${m2[3]}-${m2[1].padStart(2, "0")}-${m2[2].padStart(2, "0")}`;
  // Try native Date parse
  const d = new Date(raw);
  if (!isNaN(d)) return d.toISOString().slice(0, 10);
  return raw;
}

/** Normalise time to HH:MM (24h) */
export function normaliseTime(raw) {
  if (!raw || raw === "--" || raw === "-") return null;
  raw = raw.trim();

  // Already HH:MM or HH:MM:SS
  const m24 = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (m24) return `${m24[1].padStart(2, "0")}:${m24[2]}`;

  // 12-hour  e.g. "9:30 AM"
  const m12 = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m12) {
    let h = parseInt(m12[1], 10);
    const min = m12[2];
    const ap = m12[3].toUpperCase();
    if (ap === "PM" && h !== 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${min}`;
  }

  return null;
}

/** Build unique employee list */
function buildEmployeeList(rows) {
  const map = new Map();
  rows.forEach((r) => {
    if (!map.has(r.empId)) {
      map.set(r.empId, {
        empId: r.empId,
        empName: r.empName,
        fileType: r.fileType,
      });
    }
  });
  return Array.from(map.values()).sort((a, b) =>
    a.empId.localeCompare(b.empId)
  );
}

function buildDateRange(rows) {
  const dates = rows
    .map((r) => r.date)
    .filter(Boolean)
    .sort();
  return { from: dates[0] || null, to: dates[dates.length - 1] || null };
}

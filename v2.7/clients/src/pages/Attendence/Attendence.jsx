/**
 * Attendance/index.jsx — Main Page
 *
 * Flow:
 *  1. User uploads .xls / .xlsx / .csv exported from biometric system
 *  2. File is parsed → raw punch rows grouped by employee → date
 *  3. User selects an employee from the sidebar
 *  4. Each day's punches are calculated via attendanceCalculator.js
 *     (rules come from attendanceRules.js)
 *  5. Summary cards + day-wise table with full breakdown are shown
 */

import React, { useState, useMemo } from "react";

import FileUpload from "./components/FileUpload.jsx";
import EmployeeSelector from "./components/EmployeeSelector.jsx";
import SummaryCard from "./components/SummaryCard.jsx";
import AttendanceTable from "./components/AttendanceTable.jsx";
import RulesPanel from "./components/RulesPanel.jsx";

import { parseAttendanceFile } from "./utils/excelParser.js";
import {
  calculateDay,
  calculateSummary,
} from "./utils/attendanceCalculator.js";

// ─────────────────────────────────────────────────────────────────────────────

export default function Attendance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsed, setParsed] = useState(null); // { employees, punchMap, dateRange }
  const [fileName, setFileName] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // ── Upload handler ──────────────────────────────────────────────────────────
  const handleFile = async (file) => {
    setLoading(true);
    setError(null);
    setParsed(null);
    setSelectedEmp(null);

    try {
      const data = await parseAttendanceFile(file);
      setParsed(data);
      setFileName(file.name);
      if (data.employees.length > 0) setSelectedEmp(data.employees[0].empCode);
    } catch (err) {
      setError(err.message || "Failed to parse file.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setParsed(null);
    setSelectedEmp(null);
    setFileName(null);
    setError(null);
  };

  // ── Derive day results for selected employee ────────────────────────────────
  const dayResults = useMemo(() => {
    if (!parsed || !selectedEmp) return [];
    const empMap = parsed.punchMap.get(selectedEmp);
    if (!empMap) return [];

    return [...empMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b)) // sort by date
      .map(([dateStr, punches]) => calculateDay(dateStr, punches));
  }, [parsed, selectedEmp]);

  const summary = useMemo(() => {
    if (!dayResults.length) return null;
    return calculateSummary(dayResults);
  }, [dayResults]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      {/* Page header */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.title}>🕐 Attendance Calculator</h1>
          <p style={s.subtitle}>
            Upload your biometric attendance export to get a full hours
            breakdown.
          </p>
        </div>
        {parsed && (
          <button style={s.resetBtn} onClick={reset}>
            ↩ Upload New File
          </button>
        )}
      </div>

      {/* Rules panel — always visible */}
      <RulesPanel />

      {/* Error */}
      {error && (
        <div style={s.error}>
          <span>⚠️</span>
          <div>
            <strong>Error parsing file</strong>
            <p style={s.errorMsg}>{error}</p>
          </div>
          <button style={s.errorClose} onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Upload area */}
      {!parsed && (
        <div style={s.uploadWrap}>
          <FileUpload onFile={handleFile} loading={loading} />
        </div>
      )}

      {/* Main layout */}
      {parsed && !loading && (
        <>
          {/* File info bar */}
          <div style={s.fileBar}>
            <span>📄</span>
            <span style={s.fileName}>{fileName}</span>
            <span style={s.fileMeta}>
              {parsed.employees.length} employee
              {parsed.employees.length !== 1 ? "s" : ""}
              &nbsp;·&nbsp;
              {[...parsed.punchMap.values()].reduce(
                (n, m) => n + m.size,
                0
              )}{" "}
              days with records
            </span>
          </div>

          <div style={s.layout}>
            {/* Sidebar */}
            <aside style={s.sidebar}>
              <EmployeeSelector
                employees={parsed.employees}
                selected={selectedEmp}
                onSelect={setSelectedEmp}
                dateRange={parsed.dateRange}
              />
            </aside>

            {/* Content */}
            <main style={s.main}>
              {selectedEmp ? (
                <>
                  <SummaryCard
                    summary={summary}
                    empCode={selectedEmp}
                    dateRange={parsed.dateRange}
                  />
                  <AttendanceTable dayResults={dayResults} />
                </>
              ) : (
                <div style={s.empty}>
                  <span style={{ fontSize: 44 }}>👈</span>
                  <p>Select an employee to view their attendance.</p>
                </div>
              )}
            </main>
          </div>
        </>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  page: {
    height: "100vh",
    padding: "32px 24px 0",
    overflow: "hidden",
    maxWidth: 1320,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 900,
    color: "var(--text-white)",
    margin: 0,
  },
  subtitle: { fontSize: 14, color: "var(--text-muted)", marginTop: 6 },

  resetBtn: {
    padding: "10px 20px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "var(--text-highlight)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },

  error: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "16px 20px",
    background: "rgba(255,77,79,0.1)",
    border: "1px solid rgba(255,77,79,0.3)",
    borderRadius: 12,
    color: "var(--text-white)",
  },
  errorMsg: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "var(--text-muted)",
    lineHeight: 1.6,
    whiteSpace: "pre-line",
  },
  errorClose: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    color: "var(--text-muted)",
    fontSize: 16,
    cursor: "pointer",
  },

  uploadWrap: { maxWidth: 620, margin: "0 auto", width: "100%" },

  fileBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    background: "rgba(4,255,88,0.06)",
    border: "1px solid rgba(4,255,88,0.18)",
    borderRadius: 10,
    fontSize: 13,
  },
  fileName: { fontWeight: 700, color: "var(--text-white)" },
  fileMeta: { color: "var(--text-muted)", marginLeft: "auto", fontSize: 12 },

  layout: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gap: 24,
    alignItems: "start",
    height: "calc(100vh - 260px)", // full viewport minus top content
    minHeight: 500,
  },
  sidebar: {
    position: "sticky",
    top: 24,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 14,
    maxHeight: "calc(100vh - 280px)",
    overflowY: "auto",
  },
  main: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    height: "100%",
    overflowY: "auto",
    paddingRight: 4,
    // custom scrollbar styling
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(102,126,234,0.4) transparent",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    padding: 60,
    color: "var(--text-muted)",
    fontSize: 15,
  },
};

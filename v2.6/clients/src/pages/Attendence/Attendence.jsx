/**
 * Attendance Calculator — Main Page
 *
 * Flow:
 *  1. User uploads Excel/CSV file
 *  2. File is parsed → employee list + attendance rows extracted
 *  3. User selects an employee from sidebar
 *  4. Attendance is calculated day-by-day using rules from attendanceRules.js
 *  5. Summary + detailed table are rendered with full calculation breakdown
 */

import React, { useState, useMemo } from "react";
import FileUpload from "./components/FileUpload.jsx";
import EmployeeSelector from "./components/EmployeeSelector.jsx";
import SummaryCard from "./components/SummaryCard.jsx";
import AttendanceTable from "./components/AttendanceTable.jsx";
import RulesPanel from "./components/RulesPanel.jsx";
import { parseAttendanceFile } from "./utils/excelParser.js";
import {
  calculateDayAttendance,
  calculateSummary,
} from "./utils/attendanceCalculator.js";

export default function Attendance() {
  // ── State ────────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState(null); // { rows, employees, dateRange }
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [fileName, setFileName] = useState(null);

  // ── File upload handler ──────────────────────────────────────────────────
  const handleFileLoaded = async (file) => {
    setIsLoading(true);
    setError(null);
    setParsedData(null);
    setSelectedEmpId(null);

    try {
      const data = await parseAttendanceFile(file);
      setParsedData(data);
      setFileName(file.name);
      // Auto-select first employee
      if (data.employees.length > 0) {
        setSelectedEmpId(data.employees[0].empId);
      }
    } catch (err) {
      setError(err.message || "Failed to parse file.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Derive selected employee data ────────────────────────────────────────
  const selectedEmployee = useMemo(() => {
    if (!parsedData || !selectedEmpId) return null;
    return parsedData.employees.find((e) => e.empId === selectedEmpId) || null;
  }, [parsedData, selectedEmpId]);

  const dayResults = useMemo(() => {
    if (!parsedData || !selectedEmpId) return [];
    return parsedData.rows
      .filter((r) => r.empId === selectedEmpId)
      .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
      .map(calculateDayAttendance);
  }, [parsedData, selectedEmpId]);

  const summary = useMemo(() => {
    if (!dayResults.length) return null;
    return calculateSummary(dayResults);
  }, [dayResults]);

  // ── Reset ────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setParsedData(null);
    setSelectedEmpId(null);
    setFileName(null);
    setError(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>
            <span style={styles.emoji}>🕐</span> Attendance Calculator
          </h1>
          <p style={styles.pageSubtitle}>
            Upload your attendance Excel sheet to get a full breakdown of
            working hours.
          </p>
        </div>
        {parsedData && (
          <button style={styles.resetBtn} onClick={handleReset}>
            ↩ Upload New File
          </button>
        )}
      </div>

      {/* ── Rules Panel (always visible) ────────────────────────────────── */}
      <RulesPanel />

      {/* ── Error Banner ────────────────────────────────────────────────── */}
      {error && (
        <div style={styles.errorBanner}>
          <span style={styles.errorIcon}>⚠️</span>
          <div>
            <strong>Parse Error</strong>
            <p style={styles.errorMsg}>{error}</p>
          </div>
          <button style={styles.errorClose} onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      )}

      {/* ── Upload screen (no data yet) ──────────────────────────────────── */}
      {!parsedData && !isLoading && (
        <div style={styles.uploadSection}>
          <FileUpload onFileLoaded={handleFileLoaded} isLoading={isLoading} />
        </div>
      )}

      {isLoading && (
        <div style={styles.uploadSection}>
          <FileUpload onFileLoaded={handleFileLoaded} isLoading={true} />
        </div>
      )}

      {/* ── Main layout (after parsing) ─────────────────────────────────── */}
      {parsedData && !isLoading && (
        <>
          {/* File info bar */}
          <div style={styles.fileBar}>
            <span style={styles.fileIcon}>📄</span>
            <span style={styles.fileName}>{fileName}</span>
            <span style={styles.fileMeta}>
              {parsedData.employees.length} employee
              {parsedData.employees.length !== 1 ? "s" : ""}
              &nbsp;·&nbsp;
              {parsedData.rows.length} records
            </span>
          </div>

          <div style={styles.layout}>
            {/* ── Sidebar: employee list ──────────────────────────────── */}
            <aside style={styles.sidebar}>
              <EmployeeSelector
                employees={parsedData.employees}
                selectedEmpId={selectedEmpId}
                onSelect={setSelectedEmpId}
                dateRange={parsedData.dateRange}
              />
            </aside>

            {/* ── Main content: summary + table ──────────────────────── */}
            <main style={styles.main}>
              {selectedEmployee ? (
                <>
                  <SummaryCard summary={summary} employee={selectedEmployee} />
                  <AttendanceTable dayResults={dayResults} />
                </>
              ) : (
                <div style={styles.emptyState}>
                  <span style={{ fontSize: 48 }}>👈</span>
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

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 24px",
    maxWidth: 1300,
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
  pageTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: "var(--text-white)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: 0,
  },
  emoji: { fontSize: 28 },
  pageSubtitle: {
    fontSize: 14,
    color: "var(--text-muted)",
    marginTop: 6,
    margin: "6px 0 0",
  },

  resetBtn: {
    padding: "10px 20px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    color: "var(--text-highlight)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    flexShrink: 0,
  },

  errorBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "16px 20px",
    background: "rgba(255,77,79,0.1)",
    border: "1px solid rgba(255,77,79,0.3)",
    borderRadius: 12,
    color: "var(--text-white)",
  },
  errorIcon: { fontSize: 20, flexShrink: 0 },
  errorMsg: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "var(--text-muted)",
    lineHeight: 1.5,
  },
  errorClose: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    color: "var(--text-muted)",
    fontSize: 16,
    cursor: "pointer",
    flexShrink: 0,
  },

  uploadSection: {
    maxWidth: 600,
    margin: "0 auto",
    width: "100%",
  },

  fileBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    background: "rgba(4,255,88,0.06)",
    border: "1px solid rgba(4,255,88,0.2)",
    borderRadius: 10,
    fontSize: 13,
  },
  fileIcon: { fontSize: 16 },
  fileName: { fontWeight: 600, color: "var(--text-white)" },
  fileMeta: { color: "var(--text-muted)", marginLeft: "auto" },

  layout: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: 24,
    alignItems: "start",
  },

  sidebar: {
    position: "sticky",
    top: 24,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 16,
  },

  main: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    padding: 64,
    color: "var(--text-muted)",
    fontSize: 16,
  },
};

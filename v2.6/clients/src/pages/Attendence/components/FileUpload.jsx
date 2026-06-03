import React, { useState, useRef } from "react";

export default function FileUpload({ onFileLoaded, isLoading }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext)) {
      alert("Please upload an Excel (.xlsx / .xls) or CSV file.");
      return;
    }
    onFileLoaded(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const onInputChange = (e) => handleFile(e.target.files[0]);

  return (
    <div style={styles.wrapper}>
      <div
        style={{
          ...styles.dropzone,
          ...(dragging ? styles.dropzoneDragging : {}),
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: "none" }}
          onChange={onInputChange}
        />

        {isLoading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Parsing file…</p>
          </div>
        ) : (
          <div style={styles.idleState}>
            <div style={styles.icon}>📊</div>
            <p style={styles.title}>Drop your attendance file here</p>
            <p style={styles.subtitle}>Supports .xlsx, .xls, .csv</p>
            <button
              style={styles.btn}
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              Browse File
            </button>
          </div>
        )}
      </div>

      <div style={styles.hint}>
        <span style={styles.hintIcon}>💡</span>
        <span>
          Required columns: <strong>EmpID, Date, InTime, OutTime</strong>.
          Optional: EmpName, FileType, Out1/In1 (for mid-day exits).
        </span>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { width: "100%" },

  dropzone: {
    border: "2px dashed rgba(102,126,234,0.4)",
    borderRadius: 16,
    padding: "48px 32px",
    textAlign: "center",
    cursor: "pointer",
    background: "rgba(102,126,234,0.04)",
    transition: "all 0.2s ease",
    outline: "none",
  },
  dropzoneDragging: {
    border: "2px dashed #667eea",
    background: "rgba(102,126,234,0.1)",
    transform: "scale(1.01)",
  },

  idleState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  icon: { fontSize: 48 },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: "var(--text-white)",
    margin: 0,
  },
  subtitle: { fontSize: 14, color: "var(--text-muted)", margin: 0 },

  btn: {
    marginTop: 8,
    padding: "10px 28px",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.5px",
  },

  loadingState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid rgba(102,126,234,0.2)",
    borderTop: "3px solid #667eea",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "var(--text-muted)", margin: 0 },

  hint: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 16,
    padding: "12px 16px",
    background: "rgba(167,139,250,0.08)",
    border: "1px solid rgba(167,139,250,0.2)",
    borderRadius: 10,
    fontSize: 13,
    color: "var(--text-muted)",
    lineHeight: 1.5,
  },
  hintIcon: { fontSize: 16, flexShrink: 0 },
};

import React, { useRef, useState } from "react";

export default function FileUpload({ onFile, loading }) {
  const inputRef = useRef();
  const [dragging, setDrag] = useState(false);

  const handle = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xls", "xlsx", "csv"].includes(ext)) {
      alert("Please upload an Excel (.xls / .xlsx) or CSV file.");
      return;
    }
    onFile(file);
  };

  return (
    <div style={s.wrap}>
      <div
        style={{ ...s.zone, ...(dragging ? s.zoneDrag : {}) }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xls,.xlsx,.csv"
          style={{ display: "none" }}
          onChange={(e) => handle(e.target.files[0])}
        />

        {loading ? (
          <div style={s.center}>
            <div style={s.spinner} />
            <p style={s.sub}>Parsing file…</p>
          </div>
        ) : (
          <div style={s.center}>
            <div style={s.icon}>📊</div>
            <p style={s.title}>Drop your attendance file here</p>
            <p style={s.sub}>
              Supports .xls · .xlsx · .csv exported from biometric system
            </p>
            <button
              style={s.btn}
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

      {/* format hint */}
      <div style={s.hint}>
        <span>💡</span>
        <span>
          Expected columns:{" "}
          <b>
            Employee Code, Clock ID, Clock Name, Attendance Date, Attendance
            Time
          </b>
          <br />
          Each row = one punch swipe. Multiple punches per day are supported.
        </span>
      </div>
    </div>
  );
}

const s = {
  wrap: { width: "100%" },
  zone: {
    border: "2px dashed rgba(102,126,234,0.35)",
    borderRadius: 16,
    padding: "52px 32px",
    textAlign: "center",
    cursor: "pointer",
    background: "rgba(102,126,234,0.04)",
    transition: "all .2s",
  },
  zoneDrag: {
    border: "2px dashed #667eea",
    background: "rgba(102,126,234,0.1)",
    transform: "scale(1.01)",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  icon: { fontSize: 52 },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--text-white)",
    margin: 0,
  },
  sub: { fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 },
  btn: {
    marginTop: 8,
    padding: "10px 28px",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  spinner: {
    width: 38,
    height: 38,
    border: "3px solid rgba(102,126,234,0.2)",
    borderTop: "3px solid #667eea",
    borderRadius: "50%",
    animation: "spin .8s linear infinite",
  },
  hint: {
    display: "flex",
    gap: 10,
    marginTop: 14,
    padding: "12px 16px",
    background: "rgba(167,139,250,0.07)",
    border: "1px solid rgba(167,139,250,0.18)",
    borderRadius: 10,
    fontSize: 12,
    color: "var(--text-muted)",
    lineHeight: 1.6,
  },
};

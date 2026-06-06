import React from "react";
import { Spin } from "antd";
import useGifs from "../hooks/useGifs";

export default function GifPicker({ onSelect, onClose }) {
  const { gifs, loading, error } = useGifs();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>🎞 GIFs</span>
        <button
          style={styles.closeBtn}
          onClick={onClose}
          aria-label="Close GIF picker"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div style={styles.body}>
        {loading && (
          <div style={styles.centered}>
            <Spin size="default" />
            <span style={styles.stateText}>Loading GIFs…</span>
          </div>
        )}

        {!loading && error && (
          <div style={styles.centered}>
            <span style={{ fontSize: 28 }}>⚠️</span>
            <span style={styles.stateText}>{error}</span>
          </div>
        )}

        {!loading && !error && gifs.length === 0 && (
          <div style={styles.centered}>
            <span style={{ fontSize: 32 }}>🌵</span>
            <span style={styles.stateText}>No GIFs found</span>
          </div>
        )}

        {!loading && !error && gifs.length > 0 && (
          <div style={styles.grid}>
            {gifs.map((gif) => (
              <GifTile key={gif.name} gif={gif} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GifTile({ gif, onSelect }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      onClick={() => onSelect(gif)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.tile,
        ...(hovered ? styles.tileHovered : {}),
      }}
      title={gif.name}
    >
      <img src={gif.url} alt={gif.name} style={styles.tileImg} loading="lazy" />
    </button>
  );
}

const styles = {
  container: {
    background: "#10101e",
    borderTop: "1px solid #1e1e3a",
    display: "flex",
    flexDirection: "column",
    maxHeight: 280,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 14px",
    borderBottom: "1px solid #1e1e3a",
    flexShrink: 0,
  },
  headerTitle: {
    color: "#a78bfa",
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#555",
    cursor: "pointer",
    fontSize: 14,
    padding: "2px 6px",
    borderRadius: 4,
    lineHeight: 1,
    transition: "color 0.15s",
  },
  body: {
    overflowY: "auto",
    flex: 1,
    padding: "10px 12px",
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 120,
    color: "#555",
  },
  stateText: {
    color: "#666",
    fontSize: 13,
  },
  stateHint: {
    color: "#444",
    fontSize: 11,
    textAlign: "center",
  },
  code: {
    background: "#1a1a2e",
    borderRadius: 3,
    padding: "1px 5px",
    fontFamily: "monospace",
    fontSize: 11,
    color: "#a78bfa",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
    gap: 8,
  },
  tile: {
    background: "#1a1a2e",
    border: "1px solid #2a2a4a",
    borderRadius: 8,
    overflow: "hidden",
    cursor: "pointer",
    padding: 0,
    aspectRatio: "1 / 1",
    transition: "border-color 0.15s, transform 0.12s",
  },
  tileHovered: {
    borderColor: "#667eea",
    transform: "scale(1.04)",
  },
  tileImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
};

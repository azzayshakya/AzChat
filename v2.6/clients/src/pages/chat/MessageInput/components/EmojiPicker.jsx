import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  EMOJI_CATEGORIES,
  ALL_EMOJIS,
  QUICK_EMOJIS,
} from "../../../../data/emojiData";

export default function EmojiPicker({ onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(EMOJI_CATEGORIES[0].id);
  const searchRef = useRef(null);
  const bodyRef = useRef(null);
  const categoryRefs = useRef({});
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return ALL_EMOJIS.filter((e) => e.label.includes(q) || e.emoji === q);
  }, [search]);

  const scrollToCategory = useCallback((catId) => {
    setActiveCategory(catId);
    categoryRefs.current[catId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const handleBodyScroll = useCallback(() => {
    if (search.trim()) return;
    const bodyEl = bodyRef.current;
    if (!bodyEl) return;
    const bodyTop = bodyEl.getBoundingClientRect().top;
    let closestId = EMOJI_CATEGORIES[0].id;
    let minDist = Infinity;
    for (const cat of EMOJI_CATEGORIES) {
      const el = categoryRefs.current[cat.id];
      if (!el) continue;
      const dist = Math.abs(el.getBoundingClientRect().top - bodyTop);
      if (dist < minDist) {
        minDist = dist;
        closestId = cat.id;
      }
    }
    setActiveCategory(closestId);
  }, [search]);

  const handleEmojiClick = useCallback(
    (emoji) => {
      onSelect(emoji);
    },
    [onSelect]
  );

  return (
    <div style={styles.container}>
      <div style={styles.searchRow}>
        <input
          ref={searchRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emoji…"
          style={styles.searchInput}
        />
        <button
          style={styles.closeBtn}
          onClick={onClose}
          aria-label="Close emoji picker"
        >
          ✕
        </button>
      </div>

      {!search.trim() && (
        <div style={styles.tabs}>
          {EMOJI_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              title={cat.label}
              style={{
                ...styles.tabBtn,
                ...(activeCategory === cat.id ? styles.tabBtnActive : {}),
              }}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}
      <div ref={bodyRef} style={styles.body} onScroll={handleBodyScroll}>
        {searchResults !== null ? (
          searchResults.length === 0 ? (
            <div style={styles.empty}>
              <span style={{ fontSize: 28 }}>🔍</span>
              <span style={styles.emptyText}>
                No emojis found for "{search}"
              </span>
            </div>
          ) : (
            <div>
              <div style={styles.catLabel}>
                Results ({searchResults.length})
              </div>
              <EmojiGrid emojis={searchResults} onSelect={handleEmojiClick} />
            </div>
          )
        ) : (
          EMOJI_CATEGORIES.map((cat) => (
            <div key={cat.id} ref={(el) => (categoryRefs.current[cat.id] = el)}>
              <div style={styles.catLabel}>{cat.label}</div>
              <EmojiGrid emojis={cat.emojis} onSelect={handleEmojiClick} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EmojiGrid({ emojis, onSelect }) {
  return (
    <div style={styles.grid}>
      {emojis.map(({ emoji, label }) => (
        <EmojiButton
          key={emoji + label}
          emoji={emoji}
          label={label}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function EmojiButton({ emoji, label, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => onSelect(emoji)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={label}
      style={{
        ...styles.emojiBtn,
        ...(hovered ? styles.emojiBtnHovered : {}),
      }}
    >
      {emoji}
    </button>
  );
}

const styles = {
  container: {
    background: "#10101e",
    borderTop: "1px solid #1e1e3a",
    display: "flex",
    flexDirection: "column",
    maxHeight: 320,
    minHeight: 200,
  },
  searchRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderBottom: "1px solid #1e1e3a",
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    background: "#1a1a2e",
    border: "1px solid #2a2a4a",
    borderRadius: 8,
    color: "#fff",
    fontSize: 12,
    padding: "6px 10px",
    outline: "none",
    fontFamily: "system-ui",
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
    flexShrink: 0,
  },
  tabs: {
    display: "flex",
    gap: 2,
    padding: "4px 10px",
    borderBottom: "1px solid #1e1e3a",
    flexShrink: 0,
    overflowX: "auto",
    scrollbarWidth: "none",
    border: "2px solid var(--primary-color)",
    borderRadius: "8px",
    width: "fit-content",
    margin: "4px 12px",
  },
  tabBtn: {
    background: "none",
    border: "1px solid transparent",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 16,
    padding: "6px 4px",
    lineHeight: 1,
    transition: "background 0.15s, border-color 0.15s",
    flexShrink: 0,
  },
  tabBtnActive: {
    background: "#1a1a2e",
    borderColor: "#667eea",
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 10px",
    scrollbarWidth: "thin",
    scrollbarColor: "#2a2a4a transparent",
  },
  catLabel: {
    color: "#555",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
    marginTop: 6,
    paddingLeft: 2,
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 2,
    marginBottom: 4,
  },
  emojiBtn: {
    background: "none",
    border: "1px solid transparent",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 20,
    lineHeight: 1,
    padding: "4px",
    transition: "background 0.12s, transform 0.1s",
  },
  emojiBtnHovered: {
    background: "#1a1a2e",
    borderColor: "#2a2a4a",
    transform: "scale(1.2)",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 100,
  },
  emptyText: {
    color: "#555",
    fontSize: 12,
  },
};

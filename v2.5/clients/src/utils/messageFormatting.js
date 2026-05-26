/**
 * messageFormatting.js
 * Pure utilities for text formatting inside the message input.
 * No React / side-effects — easy to unit-test.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types (JSDoc only – no TS dependency)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {{ key: string, wrap?: [string, string], prefix?: string }} Format
 * @typedef {{ newText: string, newStart: number, newEnd: number }} FormatResult
 */

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const FORMAT_DEFS = {
  bold: { key: "bold", wrap: ["**", "**"] },
  italic: { key: "italic", wrap: ["_", "_"] },
  code: { key: "code", wrap: ["`", "`"] },
};

// Matches http/https URLs.  We keep the full match (including trailing punctuation
// that isn't part of the URL) to preserve surrounding whitespace correctly.
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^[\]`]+/gi;

// ─────────────────────────────────────────────────────────────────────────────
// applyFormat
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Applies (or toggles off) a wrap / prefix format to the current selection.
 *
 * @param {string}   text       Full textarea value
 * @param {number}   start      selectionStart
 * @param {number}   end        selectionEnd
 * @param {Format}   fmt        Format definition
 * @returns {FormatResult}
 */
export function applyFormat(text, start, end, fmt) {
  const selected = text.slice(start, end);

  if (fmt.wrap) {
    const [open, close] = fmt.wrap;

    // Detect whether the selection is already wrapped
    const alreadyWrapped =
      text.slice(start - open.length, start) === open &&
      text.slice(end, end + close.length) === close;

    if (alreadyWrapped) {
      // ── Unwrap ──────────────────────────────────────────────────────────
      const newText =
        text.slice(0, start - open.length) +
        selected +
        text.slice(end + close.length);
      return {
        newText,
        newStart: start - open.length,
        newEnd: end - open.length,
        wasActive: true,
      };
    }

    // ── Wrap ──────────────────────────────────────────────────────────────
    const newText =
      text.slice(0, start) + open + selected + close + text.slice(end);
    return {
      newText,
      newStart: start + open.length,
      newEnd: end + open.length,
      wasActive: false,
    };
  }

  if (fmt.prefix) {
    // Apply prefix at the start of the current line
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    const newText =
      text.slice(0, lineStart) + fmt.prefix + text.slice(lineStart);
    return {
      newText,
      newStart: start + fmt.prefix.length,
      newEnd: end + fmt.prefix.length,
      wasActive: false,
    };
  }

  // No-op fallback
  return { newText: text, newStart: start, newEnd: end, wasActive: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// insertAtCursor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Inserts `insert` at `pos` within `text`, returns the new string and the
 * cursor position after the insertion.
 *
 * @param {string} text
 * @param {number} pos
 * @param {string} insert
 * @returns {{ newText: string, newPos: number }}
 */
export function insertAtCursor(text, pos, insert) {
  const newText = text.slice(0, pos) + insert + text.slice(pos);
  return { newText, newPos: pos + insert.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// sanitizePaste  ← the core fix for "pasted text loses whitespace"
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalises pasted text so that:
 *  • Surrounding whitespace / newlines are kept intact.
 *  • URLs embedded in the text are preserved exactly as-is (no trimming,
 *    no extra markdown wrapping) so links remain clickable.
 *  • Multiple consecutive spaces inside prose are collapsed to a single space
 *    EXCEPT inside URLs and except for leading/trailing space on each line
 *    (which is meaningful when pasting code snippets).
 *
 * @param {string} raw  Raw text from the clipboard
 * @returns {string}    Sanitised text ready to splice into the textarea value
 */
export function sanitizePaste(raw) {
  if (!raw) return "";

  // Split into segments: URL | non-URL
  // We rebuild the string keeping URLs verbatim.
  const segments = [];
  let lastIndex = 0;

  for (const match of raw.matchAll(URL_REGEX)) {
    const { index } = match;
    const url = match[0];

    if (index > lastIndex) {
      // Prose before this URL — normalise internal runs of spaces/tabs
      // but preserve newlines and line-leading whitespace.
      segments.push(normaliseProse(raw.slice(lastIndex, index)));
    }

    segments.push(url); // Keep URL exactly as-is
    lastIndex = index + url.length;
  }

  // Remaining prose after the last URL (or the entire string if no URLs found)
  if (lastIndex < raw.length) {
    segments.push(normaliseProse(raw.slice(lastIndex)));
  }

  return segments.join("");
}

/**
 * Collapses multiple consecutive spaces/tabs within a prose chunk into one,
 * while preserving newlines and the indentation at the start of each line.
 *
 * @param {string} prose
 * @returns {string}
 */
function normaliseProse(prose) {
  // Process line by line so we can keep leading whitespace per line.
  return prose
    .split("\n")
    .map((line) => {
      // Preserve leading whitespace (indentation) + collapse interior spaces
      const leading = line.match(/^(\s*)/)[1];
      const rest = line.slice(leading.length).replace(/[ \t]+/g, " ");
      return leading + rest;
    })
    .join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// detectActiveFormats
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Inspects the text around the current selection and returns which format keys
 * are currently active (i.e. the selection is wrapped by their markers).
 *
 * @param {string}   text
 * @param {number}   start
 * @param {number}   end
 * @returns {string[]}  Array of active format keys
 */
export function detectActiveFormats(text, start, end) {
  return Object.values(FORMAT_DEFS)
    .filter(({ wrap }) => {
      if (!wrap) return false;
      const [open, close] = wrap;
      return (
        text.slice(start - open.length, start) === open &&
        text.slice(end, end + close.length) === close
      );
    })
    .map(({ key }) => key);
}

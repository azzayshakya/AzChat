import { useState, useEffect } from "react";

/**
 * useGifs — loads GIF filenames from public/gifs/manifest.json
 *
 * To use: place a `manifest.json` in `public/gifs/` with this shape:
 *   ["party.gif", "wave.gif", "laugh.gif", ...]
 *
 * All GIFs should live at: public/gifs/<filename>
 */
export default function useGifs() {
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch("/gifs/manifest.json")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load GIF manifest");
        return res.json();
      })
      .then((names) => {
        if (cancelled) return;
        // Each entry: { name, url }
        setGifs(
          names.map((n) => ({
            name: n,
            url: `/gifs/${n}`,
          }))
        );
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load GIFs");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { gifs, loading, error };
}

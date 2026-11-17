/** Formats a duration in ms as `m:ss`. */
export function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** "1 hint", "2 hints"… */
export const formatHints = (hints: number) =>
  `${hints} hint${hints > 1 ? "s" : ""}`;

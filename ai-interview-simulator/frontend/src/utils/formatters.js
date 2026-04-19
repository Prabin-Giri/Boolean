export function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatPercent(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return "--";
  }
  return `${Math.round(Number(value))}%`;
}

export function formatScoreLabel(value) {
  const numericValue = Number(value);
  if (numericValue >= 85) {
    return "Excellent presence";
  }
  if (numericValue >= 70) {
    return "Strong baseline";
  }
  if (numericValue >= 55) {
    return "Needs more polish";
  }
  return "Needs practice";
}

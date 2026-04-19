import { formatPercent, formatScoreLabel } from "../utils/formatters";

export default function ScoreCard({ label, value }) {
  return (
    <article className="score-card">
      <div className="score-label">{label}</div>
      <div className="score-value">{formatPercent(value)}</div>
      <div className="score-note">{formatScoreLabel(value)}</div>
    </article>
  );
}

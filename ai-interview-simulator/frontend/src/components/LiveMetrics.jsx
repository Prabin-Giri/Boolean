import { formatPercent } from "../utils/formatters";

export default function LiveMetrics({ metrics }) {
  const cards = [
    { label: "Words / Minute", value: metrics.words_per_minute ? Math.round(metrics.words_per_minute) : "--" },
    { label: "Fillers", value: metrics.filler_count ?? "--" },
    { label: "Focus", value: metrics.focus_score != null ? formatPercent(metrics.focus_score) : "--" },
    {
      label: "Looking Away",
      value: metrics.looking_away_ratio != null ? formatPercent(metrics.looking_away_ratio) : "--",
    },
    { label: "Presence", value: metrics.presence_score != null ? formatPercent(metrics.presence_score) : "--" },
    { label: "Expression", value: metrics.emotion_summary ?? "Waiting..." },
  ];

  return (
    <section className="panel">
      <h3 className="section-heading">INTERVAI Snapshot</h3>
      <div className="metrics-grid">
        {cards.map((card) => (
          <article key={card.label} className="metric-card">
            <div className="metric-label">{card.label}</div>
            <div
              className={`metric-value ${
                typeof card.value === "string" && card.value.length > 15 ? "metric-value-long" : ""
              }`}
            >
              {card.value}
            </div>
          </article>
        ))}
      </div>
      {metrics.investigation_summary ? <p className="metric-support">{metrics.investigation_summary}</p> : null}
    </section>
  );
}

export default function SessionSnapshot({
  currentIndex,
  totalQuestions,
  category,
  difficulty,
  isRecording,
}) {
  const snapshotItems = [
    { label: "Question", value: `${Math.min(currentIndex + 1, totalQuestions)} / ${totalQuestions || 0}` },
    { label: "Camera Model", value: "MediaPipe Face Landmarker" },
    { label: "Recording", value: isRecording ? "Live" : "Ready" },
  ];

  return (
    <section className="panel snapshot-panel">
      <div className="snapshot-header">
        <h3 className="section-heading snapshot-title">Session Snapshot</h3>
        <span className="snapshot-tag">{category} · {difficulty}</span>
      </div>
      <div className="snapshot-grid">
        {snapshotItems.map((item) => (
          <article key={item.label} className="snapshot-card">
            <span className="snapshot-label">{item.label}</span>
            <strong className="snapshot-value">{item.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

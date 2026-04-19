export default function ProgressStepper({ current, total }) {
  const progress = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <section className="panel">
      <div className="controls-row" style={{ justifyContent: "space-between" }}>
        <strong>Interview Progress</strong>
        <span className="muted">{Math.min(current + 1, total)} / {total}</span>
      </div>
      <div className="progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}

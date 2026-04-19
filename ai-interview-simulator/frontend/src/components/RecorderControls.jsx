import { formatDuration } from "../utils/formatters";

export default function RecorderControls({
  isRecording,
  recordingTime,
  onStart,
  onStop,
  onSubmit,
  canSubmit,
  isSubmitting,
}) {
  return (
    <section className="panel">
      <div className="controls-row">
        <button className="button button-accent" onClick={isRecording ? onStop : onStart}>
          {isRecording ? "Stop Answer" : "Start Answer"}
        </button>
        <button className="button button-primary" onClick={onSubmit} disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? "Analyzing..." : "Submit Answer"}
        </button>
        <span className="chip">Timer: {formatDuration(recordingTime)}</span>
      </div>
    </section>
  );
}

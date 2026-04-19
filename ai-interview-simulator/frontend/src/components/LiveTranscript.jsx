export default function LiveTranscript({ liveText, finalText }) {
  return (
    <section className="panel transcript-panel">
      <h3 className="section-heading transcript-title">Transcript</h3>
      <div className="transcript-box transcript-box-soft">
        {liveText || finalText || "Your transcript will appear here after speech capture or answer analysis."}
      </div>
    </section>
  );
}

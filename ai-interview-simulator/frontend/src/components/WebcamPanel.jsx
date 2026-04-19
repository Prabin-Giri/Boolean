import { useEffect, useState } from "react";

export default function WebcamPanel({ videoRef, hasStream, isRecording, guidance = {} }) {
  const [visibleAlert, setVisibleAlert] = useState("");

  useEffect(() => {
    if (!guidance.alert) {
      setVisibleAlert("");
      return undefined;
    }

    let cancelled = false;
    let hideTimeoutId = 0;

    function showCycle() {
      setVisibleAlert(guidance.alert);
      hideTimeoutId = window.setTimeout(() => {
        if (!cancelled) {
          setVisibleAlert("");
        }
      }, 5000);
    }

    showCycle();

    const repeatIntervalId = window.setInterval(() => {
      if (!cancelled) {
        showCycle();
      }
    }, 5600);

    return () => {
      cancelled = true;
      window.clearTimeout(hideTimeoutId);
      window.clearInterval(repeatIntervalId);
    };
  }, [guidance.alert]);

  return (
    <section className="panel">
      <div className="webcam-shell">
        <div className="status-pill">{isRecording ? "Recording" : "Camera Preview"}</div>
        {hasStream ? (
          <>
            <video ref={videoRef} className="webcam-video" autoPlay muted playsInline />
            {visibleAlert ? <div className="webcam-alert-banner">{visibleAlert}</div> : null}
            <div className="webcam-guide" aria-hidden="true">
              <div className="webcam-guide-frame">
                <div className="webcam-guide-eye-line" />
                <div className="webcam-guide-face-ring" />
              </div>
              <div className="webcam-guide-copy">{guidance.reminder || "Keep both eyes near the line and center your face inside the oval."}</div>
            </div>
          </>
        ) : (
          <div className="webcam-placeholder">
            Enable camera and microphone access to practice in a realistic interview environment.
          </div>
        )}
      </div>
    </section>
  );
}

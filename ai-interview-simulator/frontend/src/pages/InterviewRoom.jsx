import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import FeedbackList from "../components/FeedbackList";
import LiveMetrics from "../components/LiveMetrics";
import LiveTranscript from "../components/LiveTranscript";
import ProgressStepper from "../components/ProgressStepper";
import QuestionCard from "../components/QuestionCard";
import RecorderControls from "../components/RecorderControls";
import SessionSnapshot from "../components/SessionSnapshot";
import WebcamPanel from "../components/WebcamPanel";
import useInterviewFlow from "../hooks/useInterviewFlow";
import useCameraGuidance from "../hooks/useCameraGuidance";
import useMediaRecorder from "../hooks/useMediaRecorder";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useWebcamStream from "../hooks/useWebcamStream";
import { uploadAnswer } from "../services/interviewService";

export default function InterviewRoom() {
  const location = useLocation();
  const navigate = useNavigate();

  const storedSession = useMemo(() => {
    if (location.state) {
      return location.state;
    }
    const rawValue = window.localStorage.getItem("interviewSession");
    return rawValue ? JSON.parse(rawValue) : null;
  }, [location.state]);

  const session = storedSession?.session;
  const questions = storedSession?.questions || [];

  const { currentIndex, currentQuestion, goToNextQuestion, isLastQuestion, totalQuestions } =
    useInterviewFlow(questions);
  const { videoRef, stream, error: mediaError } = useWebcamStream();
  const guidance = useCameraGuidance(videoRef, Boolean(stream));
  const { blob, clearRecording, isRecording, recordingTime, startRecording, stopRecording } =
    useMediaRecorder(stream);
  const {
    isSupported: speechSupported,
    liveTranscript,
    resetTranscript,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  const [analysis, setAnalysis] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!session || questions.length === 0) {
    return (
      <section className="panel">
        <h1 className="page-title">No active interview session</h1>
        <p className="page-copy">Start a session from setup first so the interview room has questions to run.</p>
        <button className="button button-primary" onClick={() => navigate("/setup")}>
          Go to setup
        </button>
      </section>
    );
  }

  function handleStart() {
    setError("");
    setAnalysis(null);
    clearRecording();
    resetTranscript();
    startRecording();
    if (speechSupported) {
      startListening();
    }
  }

  function handleStop() {
    stopRecording();
    stopListening();
  }

  async function handleSubmit() {
    if (!currentQuestion) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await uploadAnswer({
        sessionId: session.id,
        questionId: currentQuestion.id,
        durationSeconds: recordingTime || 60,
        transcriptHint: liveTranscript,
        videoBlob: blob,
      });

      setAnalysis(result);
      clearRecording();
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to analyze this answer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleNext() {
    setAnalysis(null);
    resetTranscript();
    clearRecording();

    if (isLastQuestion) {
      navigate(`/results/${session.id}`);
      return;
    }

    goToNextQuestion();
  }

  return (
    <div className="page-grid interview-page">
      <div className="stack">
        <SessionSnapshot
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          category={session.category}
          difficulty={session.difficulty}
          isRecording={isRecording}
        />
        <LiveTranscript liveText={liveTranscript} finalText={analysis?.transcript} />
      </div>

      <div className="interview-layout interview-layout-refined">
        <div className="stack">
          <QuestionCard question={currentQuestion} currentIndex={currentIndex} total={totalQuestions} />
          <WebcamPanel
            videoRef={videoRef}
            hasStream={Boolean(stream)}
            isRecording={isRecording}
            guidance={guidance}
          />
          <RecorderControls
            isRecording={isRecording}
            recordingTime={recordingTime}
            onStart={handleStart}
            onStop={handleStop}
            onSubmit={handleSubmit}
            canSubmit={Boolean(blob || liveTranscript)}
            isSubmitting={isSubmitting}
          />
          {mediaError ? <div className="error-text">{mediaError}</div> : null}
          {error ? <div className="error-text">{error}</div> : null}
        </div>

        <div className="stack">
          <LiveMetrics metrics={analysis?.metrics || {}} />
          <FeedbackList
            title="Current Answer Feedback"
            items={
              analysis?.feedback ||
              [
                "Record one answer so INTERVAI can inspect your speech and camera focus.",
                "Submit when you're ready to generate a transcript, video review, and score snapshot.",
              ]
            }
          />
          <ProgressStepper current={currentIndex} total={totalQuestions} />
          <section className="panel">
            <div className="controls-row" style={{ justifyContent: "space-between" }}>
              <div className="chip-row">
                <span className="chip">{session.category}</span>
                <span className="chip">{session.difficulty}</span>
              </div>
              <button className="button button-secondary" onClick={handleNext} disabled={!analysis}>
                {isLastQuestion ? "Finish interview" : "Next question"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

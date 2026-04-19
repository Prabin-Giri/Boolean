import api from "./api";

export async function uploadAnswer({
  sessionId,
  questionId,
  durationSeconds,
  transcriptHint,
  videoBlob,
}) {
  const formData = new FormData();
  formData.append("session_id", String(sessionId));
  formData.append("question_id", String(questionId));
  formData.append("duration_seconds", String(durationSeconds || 60));
  if (transcriptHint) {
    formData.append("transcript_hint", transcriptHint);
  }
  if (videoBlob) {
    formData.append("video", videoBlob, "answer.webm");
    formData.append("audio", videoBlob, "answer.webm");
  }

  const response = await api.post("/answer/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

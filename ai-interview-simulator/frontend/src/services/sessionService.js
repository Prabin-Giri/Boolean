import api from "./api";

export async function startSession(payload) {
  const response = await api.post("/session/start", payload);
  return response.data;
}

export async function getSessionResults(sessionId) {
  const response = await api.get(`/session/${sessionId}/results`);
  return response.data;
}

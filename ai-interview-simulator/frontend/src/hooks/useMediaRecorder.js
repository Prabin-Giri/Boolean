import { useEffect, useMemo, useRef, useState } from "react";

export default function useMediaRecorder(stream) {
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [blob, setBlob] = useState(null);

  const mimeType = useMemo(() => {
    if (typeof MediaRecorder === "undefined") {
      return "";
    }
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
      return "video/webm;codecs=vp9,opus";
    }
    if (MediaRecorder.isTypeSupported("video/webm")) {
      return "video/webm";
    }
    return "";
  }, []);

  useEffect(() => () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
  }, []);

  function startRecording() {
    if (!stream) {
      return;
    }

    chunksRef.current = [];
    setBlob(null);
    setRecordingTime(0);

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      setBlob(new Blob(chunksRef.current, { type: mimeType || "video/webm" }));
    };

    recorder.start();
    setIsRecording(true);
    timerRef.current = window.setInterval(() => {
      setRecordingTime((time) => time + 1);
    }, 1000);
  }

  function stopRecording() {
    if (!recorderRef.current || recorderRef.current.state === "inactive") {
      return;
    }

    recorderRef.current.stop();
    setIsRecording(false);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function clearRecording() {
    setBlob(null);
    setRecordingTime(0);
  }

  return {
    blob,
    clearRecording,
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
  };
}

import { useEffect, useRef, useState } from "react";

export default function useWebcamStream() {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let activeStream = null;

    async function enableMedia() {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (cancelled) {
          activeStream.getTracks().forEach((track) => track.stop());
          return;
        }

        setStream(activeStream);
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
        }
      } catch (err) {
        setError(err?.message || "Unable to access camera or microphone.");
      }
    }

    enableMedia();

    return () => {
      cancelled = true;
      activeStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return { videoRef, stream, error };
}

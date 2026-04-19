import { useEffect, useState } from "react";

function buildWarnings({ faceCount, primaryFace, frameWidth, frameHeight, detectorReady }) {
  const warnings = {
    alert: "",
    reminder: "",
  };

  if (!detectorReady) {
    warnings.reminder = "Stay alone in frame, sit upright, and avoid black sunglasses so your eyes stay visible.";
    return warnings;
  }

  if (faceCount === 0) {
    warnings.alert = "No face detected. Sit alone, face the camera directly, and keep your full face visible.";
    warnings.reminder = "Avoid black sunglasses so INTERVAI can read your eyes clearly.";
    return warnings;
  }

  if (faceCount > 1) {
    warnings.alert = "Multiple people detected. Only one person should be in the frame.";
  }

  if (primaryFace && frameWidth > 0 && frameHeight > 0) {
    const faceCenterX = primaryFace.x + primaryFace.width / 2;
    const faceCenterY = primaryFace.y + primaryFace.height / 2;
    const centerOffsetX = Math.abs(faceCenterX / frameWidth - 0.5);
    const centerOffsetY = Math.abs(faceCenterY / frameHeight - 0.45);
    const faceWidthRatio = primaryFace.width / frameWidth;
    const faceHeightRatio = primaryFace.height / frameHeight;

    if (!warnings.alert && (centerOffsetX > 0.18 || centerOffsetY > 0.2)) {
      warnings.alert = "Sit upright and re-center yourself inside the guide.";
    }

    if (!warnings.alert && (faceWidthRatio < 0.18 || faceHeightRatio < 0.28)) {
      warnings.alert = "Move closer to the camera so your face fills more of the guide.";
    }
  }

  warnings.reminder = "Do not wear black sunglasses. Your eyes need to stay clearly visible.";
  return warnings;
}

export default function useCameraGuidance(videoRef, hasStream) {
  const [guidance, setGuidance] = useState({
    alert: "",
    reminder: "Stay alone in frame, sit upright, and avoid black sunglasses so your eyes stay visible.",
  });

  useEffect(() => {
    if (!hasStream || typeof window === "undefined") {
      return undefined;
    }

    const FaceDetectorClass = window.FaceDetector;
    if (!FaceDetectorClass) {
      setGuidance({
        alert: "",
        reminder: "Stay alone in frame, sit upright, and avoid black sunglasses so your eyes stay visible.",
      });
      return undefined;
    }

    let cancelled = false;
    const detector = new FaceDetectorClass({ fastMode: true, maxDetectedFaces: 3 });

    async function inspectFrame() {
      if (cancelled || !videoRef.current) {
        return;
      }

      const video = videoRef.current;
      if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
        return;
      }

      try {
        const faces = await detector.detect(video);
        if (cancelled) {
          return;
        }

        const sortedFaces = [...faces].sort(
          (left, right) =>
            right.boundingBox.width * right.boundingBox.height - left.boundingBox.width * left.boundingBox.height,
        );
        const primaryFace = sortedFaces[0]?.boundingBox ?? null;

        setGuidance(
          buildWarnings({
            faceCount: faces.length,
            primaryFace,
            frameWidth: video.videoWidth,
            frameHeight: video.videoHeight,
            detectorReady: true,
          }),
        );
      } catch {
        if (!cancelled) {
          setGuidance({
            alert: "",
            reminder: "Stay alone in frame, sit upright, and avoid black sunglasses so your eyes stay visible.",
          });
        }
      }
    }

    const intervalId = window.setInterval(() => {
      inspectFrame();
    }, 1200);

    inspectFrame();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [hasStream, videoRef]);

  return guidance;
}

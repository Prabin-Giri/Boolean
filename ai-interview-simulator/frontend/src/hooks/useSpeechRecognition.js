import { useEffect, useRef, useState } from "react";

export default function useSpeechRecognition() {
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) {
          finalTranscriptRef.current += `${result[0].transcript} `;
        } else {
          interim += result[0].transcript;
        }
      }
      setLiveTranscript(`${finalTranscriptRef.current}${interim}`.trim());
    };

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    setIsSupported(true);

    return () => {
      recognition.stop();
    };
  }, []);

  function startListening() {
    if (!recognitionRef.current) {
      return;
    }
    finalTranscriptRef.current = "";
    setLiveTranscript("");
    recognitionRef.current.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
  }

  function resetTranscript() {
    finalTranscriptRef.current = "";
    setLiveTranscript("");
  }

  return {
    isListening,
    isSupported,
    liveTranscript,
    resetTranscript,
    startListening,
    stopListening,
  };
}

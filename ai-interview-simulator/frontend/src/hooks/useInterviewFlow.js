import { useMemo, useState } from "react";

export default function useInterviewFlow(initialQuestions = []) {
  const [questions] = useState(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = useMemo(() => questions[currentIndex] ?? null, [questions, currentIndex]);
  const isLastQuestion = currentIndex >= questions.length - 1;

  function goToNextQuestion() {
    if (!isLastQuestion) {
      setCurrentIndex((index) => index + 1);
    }
  }

  return {
    currentIndex,
    currentQuestion,
    goToNextQuestion,
    isLastQuestion,
    questions,
    totalQuestions: questions.length,
  };
}

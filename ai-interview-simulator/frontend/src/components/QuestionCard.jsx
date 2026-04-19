export default function QuestionCard({ question, currentIndex, total }) {
  return (
    <section className="question-card">
      <div className="question-meta">
        <span>Question {currentIndex + 1} of {total}</span>
        <span>{question?.category?.toUpperCase()} · {question?.difficulty}</span>
      </div>
      <h2 className="question-text">{question?.text ?? "Waiting for question..."}</h2>
    </section>
  );
}

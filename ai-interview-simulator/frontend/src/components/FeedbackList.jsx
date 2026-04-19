export default function FeedbackList({ title = "Suggestions", items = [] }) {
  return (
    <section className="panel">
      <h3 className="section-heading">{title}</h3>
      <ul className="feedback-list">
        {items.length > 0 ? items.map((item) => <li key={item}>{item}</li>) : <li>No feedback yet.</li>}
      </ul>
    </section>
  );
}

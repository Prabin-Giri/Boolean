import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import FeedbackList from "../components/FeedbackList";
import ScoreCard from "../components/ScoreCard";
import { getSessionResults } from "../services/sessionService";
import { formatPercent } from "../utils/formatters";

export default function Results() {
  const { sessionId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResults() {
      try {
        const response = await getSessionResults(sessionId);
        setData(response);
      } catch (err) {
        setError(err?.response?.data?.detail || "Unable to load results.");
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [sessionId]);

  if (loading) {
    return <section className="panel">Loading interview results...</section>;
  }

  if (error || !data) {
    return (
      <section className="panel">
        <h1 className="page-title">Results unavailable</h1>
        <p className="error-text">{error || "No results found."}</p>
        <Link className="button button-primary" to="/setup">
          Start a new interview
        </Link>
      </section>
    );
  }

  const aggregateScores = data.responses.reduce(
    (totals, item) => ({
      communication: totals.communication + item.scores.communication,
      confidence: totals.confidence + item.scores.confidence,
      clarity: totals.clarity + item.scores.clarity,
      relevance: totals.relevance + item.scores.relevance,
      eye_contact: totals.eye_contact + item.scores.eye_contact,
    }),
    { communication: 0, confidence: 0, clarity: 0, relevance: 0, eye_contact: 0 },
  );

  const count = Math.max(data.responses.length, 1);
  const chartData = [
    { name: "Communication", score: Math.round(aggregateScores.communication / count) },
    { name: "Confidence", score: Math.round(aggregateScores.confidence / count) },
    { name: "Clarity", score: Math.round(aggregateScores.clarity / count) },
    { name: "Relevance", score: Math.round(aggregateScores.relevance / count) },
    { name: "Eye Contact", score: Math.round(aggregateScores.eye_contact / count) },
  ];

  return (
    <div className="results-grid">
      <section className="panel">
        <div className="results-hero">
          <div>
            <h1 className="page-title">Interview results</h1>
            <p className="page-copy">
              Session {data.session_id} · {data.category} · {data.difficulty} · {data.completed_questions} answers analyzed
            </p>
          </div>
          <div className="results-score">
            <span className="muted">Overall score</span>
            <strong>{formatPercent(data.total_score)}</strong>
          </div>
        </div>
      </section>

      <section className="score-grid">
        {chartData.map((item) => (
          <ScoreCard key={item.name} label={item.name} value={item.score} />
        ))}
      </section>

      <section className="panel">
        <h2 className="section-heading">Score breakdown</h2>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#fca311" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <FeedbackList title="Overall suggestions" items={data.summary_feedback} />

      <section className="review-grid">
        {data.responses.map((response, index) => (
          <article key={response.id} className="review-card">
            <div className="question-meta">
              <span>Answer {index + 1}</span>
              <span>{formatPercent(response.scores.overall)}</span>
            </div>
            <h3 className="section-heading">{response.question.text}</h3>
            <div className="transcript-box">{response.transcript}</div>
            <div className="chip-row" style={{ marginTop: "1rem" }}>
              <span className="chip">WPM {Math.round(response.metrics.words_per_minute)}</span>
              <span className="chip">Fillers {response.metrics.filler_count}</span>
              <span className="chip">Eye Contact {formatPercent(response.metrics.eye_contact_score)}</span>
            </div>
            <ul className="feedback-list" style={{ marginTop: "1rem" }}>
              {response.feedback.map((item) => (
                <li key={`${response.id}-${item}`}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="cta-row">
          <Link className="button button-primary" to="/setup">
            Run another interview
          </Link>
          <Link className="button button-secondary" to="/">
            Back to home
          </Link>
        </div>
      </section>
    </div>
  );
}

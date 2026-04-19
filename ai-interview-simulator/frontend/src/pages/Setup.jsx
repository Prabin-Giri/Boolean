import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { startSession } from "../services/sessionService";
import {
  COMPANY_TYPES,
  DIFFICULTY_LEVELS,
  INTERVIEW_CATEGORIES,
  INTERVIEW_EMPHASIS_OPTIONS,
  QUESTION_COUNT_OPTIONS,
  SENIORITY_LEVELS,
  TARGET_MARKETS,
} from "../utils/constants";

const prepCards = [
  { label: "Camera", value: "Centered framing" },
  { label: "Audio", value: "Quiet room" },
  { label: "Style", value: "Short focused answers" },
];

export default function Setup() {
  const navigate = useNavigate();
  const [careerFocus, setCareerFocus] = useState("frontend developer");
  const [seniority, setSeniority] = useState("mid-level");
  const [techStack, setTechStack] = useState("React, TypeScript, Node.js");
  const [targetMarket, setTargetMarket] = useState("United States");
  const [companyType, setCompanyType] = useState("product company");
  const [interviewEmphasis, setInterviewEmphasis] = useState("balanced");
  const [category, setCategory] = useState("behavioral");
  const [difficulty, setDifficulty] = useState("medium");
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!careerFocus.trim()) {
      setError("Add the career you are targeting so INTERVAI can generate role-specific questions.");
      setLoading(false);
      return;
    }

    try {
      const data = await startSession({
        career_focus: careerFocus.trim(),
        seniority,
        tech_stack: techStack.trim(),
        target_market: targetMarket,
        company_type: companyType,
        interview_emphasis: interviewEmphasis,
        category,
        difficulty,
        total_questions: totalQuestions,
      });

      window.localStorage.setItem("interviewSession", JSON.stringify(data));
      navigate("/interview", { state: data });
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to start the interview session.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-grid page-grid-spacious">
      <section className="setup-stage panel">
        <div>
          <div className="eyebrow">Build your INTERVAI run</div>
          <h1 className="setup-title">Set the room, pick the pressure, and jump in.</h1>
          <p className="setup-copy">
            Keep the first run light, get a feel for the feedback, then tighten the challenge once
            the flow feels natural.
          </p>
        </div>
        <div className="setup-spotlight" aria-hidden="true">
          <div className="spotlight-core">LIVE REVIEW</div>
          <div className="spotlight-tags">
            {prepCards.map((card) => (
              <span key={card.label} className="quick-chip">
                {card.label}: {card.value}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="setup-grid setup-grid-rich">
        <form className="panel form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="career-focus">Career focus</label>
            <input
              id="career-focus"
              type="text"
              value={careerFocus}
              onChange={(event) => setCareerFocus(event.target.value)}
              placeholder="e.g. frontend developer, data analyst, product manager"
            />
          </div>

          <div className="field">
            <label htmlFor="seniority">Seniority</label>
            <select id="seniority" value={seniority} onChange={(event) => setSeniority(event.target.value)}>
              {SENIORITY_LEVELS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="tech-stack">Tech stack / specialization</label>
            <input
              id="tech-stack"
              type="text"
              value={techStack}
              onChange={(event) => setTechStack(event.target.value)}
              placeholder="e.g. React, TypeScript, Node.js or SQL, Python, Tableau"
            />
          </div>

          <div className="field">
            <label htmlFor="target-market">Target market</label>
            <select id="target-market" value={targetMarket} onChange={(event) => setTargetMarket(event.target.value)}>
              {TARGET_MARKETS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="company-type">Company type</label>
            <select id="company-type" value={companyType} onChange={(event) => setCompanyType(event.target.value)}>
              {COMPANY_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="interview-emphasis">Interview emphasis</label>
            <select
              id="interview-emphasis"
              value={interviewEmphasis}
              onChange={(event) => setInterviewEmphasis(event.target.value)}
            >
              {INTERVIEW_EMPHASIS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="category">Interview category</label>
            <select id="category" value={category} onChange={(event) => setCategory(event.target.value)}>
              {INTERVIEW_CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="difficulty">Difficulty</label>
            <select id="difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
              {DIFFICULTY_LEVELS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="questions">Question count</label>
            <select
              id="questions"
              value={totalQuestions}
              onChange={(event) => setTotalQuestions(Number(event.target.value))}
            >
              {QUESTION_COUNT_OPTIONS.map((count) => (
                <option key={count} value={count}>
                  {count} questions
                </option>
              ))}
            </select>
          </div>

          {error ? <div className="error-text">{error}</div> : null}

          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? "Building session..." : "Launch INTERVAI"}
          </button>
        </form>

        <section className="panel session-preview">
          <h2 className="section-heading section-heading-large">Session preview</h2>
          <div className="preview-grid">
            <article className="preview-card">
              <span>Career focus</span>
              <strong>{careerFocus || "Add a target role"}</strong>
            </article>
            <article className="preview-card">
              <span>Seniority</span>
              <strong>{SENIORITY_LEVELS.find((option) => option.value === seniority)?.label}</strong>
            </article>
            <article className="preview-card">
              <span>Stack</span>
              <strong>{techStack || "Generalist"}</strong>
            </article>
            <article className="preview-card">
              <span>Market</span>
              <strong>{targetMarket}</strong>
            </article>
            <article className="preview-card">
              <span>Company type</span>
              <strong>{COMPANY_TYPES.find((option) => option.value === companyType)?.label}</strong>
            </article>
            <article className="preview-card">
              <span>Emphasis</span>
              <strong>{INTERVIEW_EMPHASIS_OPTIONS.find((option) => option.value === interviewEmphasis)?.label}</strong>
            </article>
            <article className="preview-card">
              <span>Category</span>
              <strong>{INTERVIEW_CATEGORIES.find((option) => option.value === category)?.label}</strong>
            </article>
            <article className="preview-card">
              <span>Difficulty</span>
              <strong>{DIFFICULTY_LEVELS.find((option) => option.value === difficulty)?.label}</strong>
            </article>
            <article className="preview-card">
              <span>Questions</span>
              <strong>{totalQuestions}</strong>
            </article>
          </div>
          <div className="setup-helper">
            <p>INTERVAI now uses your submitted role, seniority, stack, market, company type, and interview emphasis to generate the questions.</p>
            <p>INTERVAI will score the answer more accurately when it can see your eyes and hear your voice clearly.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

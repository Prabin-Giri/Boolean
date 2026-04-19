import { Link } from "react-router-dom";

const featureCards = [
  {
    icon: "psychology",
    iconStyle: "blue",
    title: "Sentiment Analysis",
    text: "We decode your tone and emotional resonance to ensure you're projecting the right attitude for the role.",
  },
  {
    icon: "speed",
    iconStyle: "filled",
    title: "Real-time Feedback",
    text: "Get instant insights on filler words, speaking pace, and clarity of thought as you practice.",
  },
  {
    icon: "grid_view",
    iconStyle: "warm",
    title: "Industry Templates",
    text: "Choose from 500+ role-specific interview banks including FAANG, Finance, and Creative roles.",
  },
];

export default function Home() {
  return (
    <div className="page-grid homepage-shot">
      {/* Hero Section */}
      <section className="homepage-hero-wrap">
        <div className="homepage-hero-card">
          <div className="homepage-kicker">
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
              auto_awesome
            </span>
            AI-Powered Interview Prep
          </div>

          <h1 className="homepage-title">
            Practice like the interview is{" "}
            <span className="highlight">already real</span>
          </h1>

          <p className="homepage-copy">
            Record your answers to real-world questions. Our AI analyzes your delivery,
            body language, and content to give you professional, actionable feedback in seconds.
          </p>

          <div className="cta-row">
            <Link className="button button-primary button-large" to="/setup">
              Start interview
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <a className="button button-secondary button-large" href="#home-features">
              Explore features
            </a>
          </div>

          <div className="homepage-social-proof">
            <span className="homepage-social-text">Joined by 10k+ candidates this month</span>
          </div>
        </div>

        {/* Dashboard Visualization */}
        <div className="homepage-visual-card">
          <div className="homepage-visual-glow homepage-visual-glow-one" />
          <div className="homepage-visual-glow homepage-visual-glow-two" />

          {/* Video HUD simulation */}
          <div className="homepage-video-preview">
            <div style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #0f172a, #1e3a5f)",
              color: "rgba(255,255,255,0.3)",
              fontSize: "0.9rem",
              fontWeight: 600
            }}>
              <div style={{ textAlign: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "3rem", opacity: 0.4 }}>videocam</span>
                <div style={{ marginTop: "0.5rem" }}>Camera Preview</div>
              </div>
            </div>
            <div className="homepage-video-overlay" />
            <div className="homepage-rec-badge">
              <span className="pulse-dot" />
              REC 02:45
            </div>
            <div className="homepage-mic-badge">
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>mic</span>
              Level: Optimal
            </div>
          </div>

          {/* Analysis Metrics */}
          <div className="homepage-metrics-row">
            <div className="homepage-metric-item">
              <div className="homepage-metric-header">
                <span className="homepage-metric-label">Eye Contact</span>
                <span className="homepage-metric-value blue">82%</span>
              </div>
              <div className="homepage-progress-bar">
                <span className="fill-blue" style={{ width: "82%" }} />
              </div>
            </div>
            <div className="homepage-metric-item">
              <div className="homepage-metric-header">
                <span className="homepage-metric-label">Clarity</span>
                <span className="homepage-metric-value green">Strong</span>
              </div>
              <div className="homepage-clarity-bars">
                <span className="active" />
                <span className="active" />
                <span className="active" />
                <span />
              </div>
            </div>
          </div>

          {/* Feedback Chips */}
          <div className="homepage-chips">
            <span className="homepage-chip green">Confidence High</span>
            <span className="homepage-chip blue">Great Pacing</span>
            <span className="homepage-chip amber">Watch Hand Gestures</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="homepage-feature-wrap" id="home-features">
        <h2 className="homepage-feature-title">What makes IntervAI useful</h2>
        <p className="homepage-feature-copy">
          Our specialized AI models are trained on thousands of successful hiring cycles
          to help you master the art of the interview.
        </p>

        <div className="homepage-feature-grid">
          {featureCards.map((card) => (
            <article key={card.title} className="glass-card homepage-feature-card">
              <div className={`homepage-feature-icon ${card.iconStyle}`}>
                <span className="material-symbols-outlined" style={{ fontSize: "1.5rem" }}>
                  {card.icon}
                </span>
              </div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="glass-card homepage-cta-section">
        <div className="dot-pattern" />
        <h2>Ready to land your dream job?</h2>
        <p>
          Start your first AI-guided practice session today. No credit card required to begin.
        </p>
        <Link className="button button-primary button-large" to="/setup">
          Get Started Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">IntervAI</div>
            <p className="footer-copyright">© 2024 IntervAI. All rights reserved.</p>
          </div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Support</a>
            <a href="#">Career Guidance</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

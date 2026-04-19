import {
  ArrowUpRight,
  Clapperboard,
  FolderCog,
  Globe,
  Network,
  Share2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type React from "react";
import { Link } from "react-router-dom";

const featureCards = [
  {
    title: "Smart Match",
    description:
      "AI-driven alignment between your skills and market opportunities.",
    icon: TrendingUp,
    accent: "border-t-primary text-primary",
  },
  {
    title: "Dynamic Feedback",
    description:
      "Instant sentiment analysis and structural recommendations for answers.",
    icon: Sparkles,
    accent: "border-t-[#4a86e8] text-[#4a86e8]",
  },
  {
    title: "Career Hub",
    description:
      "Centralized command center for all your professional growth activities.",
    icon: Network,
    accent: "border-t-[#7d8699] text-[#556070]",
  },
];

export const HomePage: React.FC = () => {
  const interviewSimulatorUrl =
    import.meta.env.VITE_INTERVIEW_SIMULATOR_URL || "http://localhost:4173";

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_18%_0%,rgba(0,88,190,0.14),transparent_34%),radial-gradient(circle_at_82%_14%,rgba(252,222,181,0.34),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[18rem] h-[34rem] bg-[radial-gradient(circle_at_50%_50%,rgba(0,88,190,0.05),transparent_42%)]" />

      <header className="sticky top-0 z-20 border-b border-border/80 bg-card/72 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-border/80 bg-card shadow-sm">
              <span className="bg-gradient-to-r from-[#0058be] to-[#4a86e8] bg-clip-text font-headline text-lg font-bold text-transparent">
                CT
              </span>
            </div>
            <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text font-headline text-2xl font-bold tracking-tight text-transparent">
              CareerTwin
            </span>
          </div>

          <nav className="hidden items-center gap-8 text-[15px] md:flex">
            <a
              className="border-b-2 border-primary pb-1 font-headline text-primary"
              href="#platform"
            >
              Platform
            </a>
            <a
              className="font-headline text-muted-foreground transition-colors hover:text-foreground"
              href="#features"
            >
              Resources
            </a>
            <a
              className="font-headline text-muted-foreground transition-colors hover:text-foreground"
              href="#features"
            >
              Pricing
            </a>
            <a
              className="font-headline text-muted-foreground transition-colors hover:text-foreground"
              href="#footer"
            >
              Enterprise
            </a>
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <Link
              className="px-4 py-2 font-headline text-muted-foreground transition-colors hover:text-foreground"
              to="/sign-in"
            >
              Sign In
            </Link>
            <Link
              className="rounded-2xl bg-primary px-6 py-3 font-headline font-semibold text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5"
              to="/sign-in?mode=register&next=%2Fjobs%2Fready"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        <section className="mx-auto max-w-[1440px] px-5 pb-12 pt-20 text-center md:px-8 md:pt-24">
          <h1 className="font-headline text-[clamp(3.4rem,8vw,5.5rem)] font-bold tracking-[-0.05em] text-foreground">
            CareerTwin
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-[clamp(1rem,2vw,1.9rem)] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
            Move Ahead With Your Career
          </p>
        </section>

        <section
          className="mx-auto grid max-w-[1440px] gap-8 px-5 pb-24 md:grid-cols-2 md:px-8"
          id="platform"
        >
          <article className="group flex min-h-[34rem] flex-col justify-between rounded-[32px] border border-border/80 bg-card/86 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/25">
            <div>
              <div className="mb-10 flex items-start justify-between gap-6">
                <div>
                  <span className="inline-flex rounded-full border border-primary/15 bg-primary/8 px-4 py-2 font-headline text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    Management Applications
                  </span>
                  <h2 className="mt-5 font-headline text-5xl font-bold tracking-[-0.04em] text-foreground">
                    JobOps
                  </h2>
                </div>
                <div className="grid h-24 w-24 place-items-center rounded-[24px] border border-primary/20 bg-[linear-gradient(180deg,rgba(0,88,190,0.12),rgba(255,255,255,0.7))]">
                  <FolderCog className="h-11 w-11 text-primary" strokeWidth={1.8} />
                </div>
              </div>

              <p className="max-w-xl text-[1.05rem] leading-9 text-muted-foreground">
                The Job Search &amp; Application Management Platform. Streamline
                your workflow with intelligent tracking and pipeline
                visualization.
              </p>

              <div className="mt-16 flex h-2 overflow-hidden rounded-full bg-secondary">
                <div className="w-[34%] rounded-full bg-primary shadow-[0_0_18px_rgba(0,88,190,0.25)]" />
                <div className="w-[27%] rounded-full bg-primary/45" />
                <div className="w-[16%] rounded-full bg-primary/20" />
              </div>
            </div>

            <div className="mt-14">
              <Link
                className="flex w-full items-center justify-center gap-3 rounded-[22px] bg-primary px-6 py-5 font-headline text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/95"
                to="/sign-in?next=%2Fjobs%2Fready"
              >
                Get Started
                <ArrowUpRight className="h-5 w-5" strokeWidth={2.4} />
              </Link>
            </div>
          </article>

          <article className="group flex min-h-[34rem] flex-col justify-between rounded-[32px] border border-border/80 bg-card/86 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/25">
            <div>
              <div className="mb-10 flex items-start justify-between gap-6">
                <div>
                  <span className="inline-flex rounded-full border border-primary/15 bg-primary/8 px-4 py-2 font-headline text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    Practice Interviews
                  </span>
                  <h2 className="mt-5 font-headline text-5xl font-bold tracking-[-0.04em] text-foreground">
                    IntervAI
                  </h2>
                </div>
                <div className="grid h-24 w-24 place-items-center rounded-[24px] border border-primary/20 bg-[linear-gradient(180deg,rgba(252,222,181,0.42),rgba(255,255,255,0.72))]">
                  <Clapperboard className="h-11 w-11 text-primary" strokeWidth={1.8} />
                </div>
              </div>

              <p className="max-w-xl text-[1.05rem] leading-9 text-muted-foreground">
                The AI Mock Interview Simulator. Master your pitch with
                real-time feedback, speech analysis, and technical drills.
              </p>

              <div className="mt-16 flex items-center gap-5 rounded-[24px] border border-border/80 bg-background/90 px-5 py-6 shadow-sm">
                <div className="flex items-end gap-1.5">
                  <span className="h-7 w-1.5 rounded-full bg-primary/40" />
                  <span className="h-10 w-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(0,88,190,0.28)]" />
                  <span className="h-5 w-1.5 rounded-full bg-primary/60" />
                </div>
                <span className="font-headline text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  AI analyzing speech patterns...
                </span>
              </div>
            </div>

            <div className="mt-14">
              <a
                className="flex w-full items-center justify-center gap-3 rounded-[22px] bg-primary px-6 py-5 font-headline text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/95"
                href={interviewSimulatorUrl}
                rel="noreferrer"
                target="_blank"
              >
                Start Practice
                <ArrowUpRight className="h-5 w-5" strokeWidth={2.4} />
              </a>
            </div>
          </article>
        </section>

        <section
          className="mx-auto grid max-w-[1440px] gap-6 px-5 pb-28 md:grid-cols-3 md:px-8"
          id="features"
        >
          {featureCards.map(({ title, description, icon: Icon, accent }) => (
            <article
              key={title}
              className={`rounded-[26px] border border-border/80 border-t-2 bg-card/86 p-6 shadow-lg backdrop-blur-sm ${accent}`}
            >
              <Icon className="mb-5 h-6 w-6" strokeWidth={2.1} />
              <h3 className="font-headline text-[1.95rem] font-bold tracking-[-0.03em] text-foreground">
                {title}
              </h3>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </section>
      </div>

      <footer
        className="relative z-10 border-t border-border/80 bg-card/76 py-12 backdrop-blur-sm"
        id="footer"
      >
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 md:flex-row md:items-end md:justify-between md:px-8">
          <div>
            <div className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text font-headline text-2xl font-bold text-transparent">
              CareerTwin
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              © 2024 CareerTwin. All rights reserved.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <a className="transition-colors hover:text-primary" href="#platform">
              About Us
            </a>
            <a className="transition-colors hover:text-primary" href="#footer">
              Contact
            </a>
            <a className="transition-colors hover:text-primary" href="#footer">
              Privacy Policy
            </a>
            <a className="transition-colors hover:text-primary" href="#footer">
              Terms of Service
            </a>
          </nav>

          <div className="flex items-center gap-4 text-muted-foreground">
            <button
              className="transition-colors hover:text-primary"
              type="button"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              className="transition-colors hover:text-primary"
              type="button"
            >
              <Globe className="h-5 w-5" />
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
};

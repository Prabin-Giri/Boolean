import { createJob } from "@shared/testing/factories.js";
import { render, screen } from "@testing-library/react";
import type React from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { JobHeader } from "./JobHeader";

const mockJob = createJob({
  id: "job-1",
  title: "Software Engineer",
  employer: "Tech Corp",
  location: "London",
  salary: "£60,000",
  deadline: "2025-12-31",
  status: "discovered",
  source: "linkedin",
  suitabilityScore: 85,
  suitabilityReason: "Strong match",
});

describe("JobHeader", () => {
  const renderWithRouter = (ui: React.ReactElement) =>
    render(<MemoryRouter>{ui}</MemoryRouter>);

  it("renders basic job information", () => {
    renderWithRouter(<JobHeader job={mockJob} />);
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    expect(screen.getByText("London")).toBeInTheDocument();
    expect(screen.getByText("£60,000")).toBeInTheDocument();
  });

  it("links the title and view button to the job page", () => {
    renderWithRouter(<JobHeader job={mockJob} />);

    expect(
      screen.getByRole("link", { name: "Software Engineer" }),
    ).toHaveAttribute("href", "/job/job-1");
    expect(screen.getByRole("link", { name: /view/i })).toHaveAttribute(
      "href",
      "/job/job-1",
    );
  });

  it("shows a previously applied status indicator with match details", () => {
    const jobWithAppliedDuplicate = {
      ...mockJob,
      appliedDuplicateMatch: {
        jobId: "job-2",
        title: "Software Engineer",
        employer: "Tech Corp",
        appliedAt: "2026-04-01T10:00:00.000Z",
        score: 97,
        titleScore: 98,
        employerScore: 96,
      },
    };

    renderWithRouter(<JobHeader job={jobWithAppliedDuplicate} />);

    expect(screen.getByText("Previously Applied")).toBeInTheDocument();
  });

  it("hides the view button when already on a job page", () => {
    render(
      <MemoryRouter initialEntries={["/job/job-1"]}>
        <JobHeader job={mockJob} />
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole("link", { name: /view/i }),
    ).not.toBeInTheDocument();
  });
});

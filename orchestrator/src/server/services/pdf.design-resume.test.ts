import { beforeEach, describe, expect, it, vi } from "vitest";
import { runWithRequestContext } from "@infra/request-context";
import { generateDesignResumePdf } from "./pdf";

process.env.DATA_DIR = "/tmp";

const { currentPdfRenderer, mockRenderResumePdf } = vi.hoisted(() => ({
  currentPdfRenderer: { value: "latex" as "latex" | "rxresume" },
  mockRenderResumePdf: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../repositories/settings", () => ({
  getSetting: vi.fn().mockImplementation((key: string) => {
    if (key === "pdfRenderer") return Promise.resolve(currentPdfRenderer.value);
    return Promise.resolve(null);
  }),
}));

vi.mock("./design-resume", () => ({
  getCurrentDesignResume: vi.fn().mockResolvedValue({
    id: "user:demo:primary",
    title: "Primary Resume",
    resumeJson: {
      $schema: "https://rxresu.me/schema.json",
      version: "5.0.0",
      picture: {
        hidden: true,
        url: "",
        size: 96,
        rotation: 0,
        aspectRatio: 1,
        borderRadius: 0,
        borderColor: "#000000",
        borderWidth: 0,
        shadowColor: "#000000",
        shadowWidth: 0,
      },
      basics: {
        name: "Test User",
        headline: "Engineer",
        email: "",
        phone: "",
        location: "",
        website: {
          url: "",
          label: "",
        },
        customFields: [],
      },
      summary: {
        title: "Summary",
        columns: 1,
        hidden: false,
        content: "Summary",
      },
      sections: {
        profiles: { title: "Profiles", columns: 1, hidden: false, items: [] },
        experience: {
          title: "Experience",
          columns: 1,
          hidden: false,
          items: [],
        },
        education: {
          title: "Education",
          columns: 1,
          hidden: false,
          items: [],
        },
        projects: {
          title: "Projects",
          columns: 1,
          hidden: false,
          items: [],
        },
        skills: {
          title: "Skills",
          columns: 1,
          hidden: false,
          items: [],
        },
        languages: {
          title: "Languages",
          columns: 1,
          hidden: false,
          items: [],
        },
        interests: {
          title: "Interests",
          columns: 1,
          hidden: false,
          items: [],
        },
        awards: { title: "Awards", columns: 1, hidden: false, items: [] },
        certifications: {
          title: "Certifications",
          columns: 1,
          hidden: false,
          items: [],
        },
        publications: {
          title: "Publications",
          columns: 1,
          hidden: false,
          items: [],
        },
        volunteer: {
          title: "Volunteer",
          columns: 1,
          hidden: false,
          items: [],
        },
        references: {
          title: "References",
          columns: 1,
          hidden: false,
          items: [],
        },
      },
      customSections: [],
      metadata: {
        template: "rhyhorn",
        layout: {
          sidebarWidth: 220,
          pages: [
            {
              fullWidth: false,
              main: ["summary", "experience", "education", "projects"],
              sidebar: ["profiles", "skills", "languages"],
            },
          ],
        },
        css: {
          enabled: false,
          value: "",
        },
        page: {
          gapX: 18,
          gapY: 18,
          marginX: 18,
          marginY: 18,
          format: "a4",
          locale: "en",
          hideIcons: false,
          options: {
            breakLine: true,
            pageNumbers: true,
          },
        },
        design: {
          level: {
            icon: "circle",
            type: "hidden",
          },
          colors: {
            background: "#ffffff",
            text: "#000000",
            primary: "#2563eb",
          },
        },
        typography: {
          body: {
            fontFamily: "Inter",
            fontWeights: ["regular"],
            fontSize: 14,
            lineHeight: 1.5,
          },
          heading: {
            fontFamily: "Inter",
            fontWeights: ["600"],
            fontSize: 14,
            lineHeight: 1.25,
          },
        },
        notes: "",
      },
    },
    sourceResumeId: null,
    sourceMode: null,
  }),
}));

vi.mock("./resume-renderer", () => ({
  renderResumePdf: mockRenderResumePdf,
}));

vi.mock("./rxresume", () => ({
  importResume: vi.fn(),
  exportResumePdf: vi.fn(),
  deleteResume: vi.fn(),
  getResume: vi.fn(),
  prepareTailoredResumeForPdf: vi.fn(),
}));

describe("generateDesignResumePdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes a user-scoped design resume PDF filename", async () => {
    const result = await runWithRequestContext({ userId: "user-123" }, () =>
      generateDesignResumePdf(),
    );

    expect(mockRenderResumePdf).toHaveBeenCalledWith(
      expect.objectContaining({
        outputPath: expect.stringContaining(
          "/pdfs/design_resume_user-123.pdf",
        ),
      }),
    );
    expect(result.pdfUrl).toContain("/pdfs/design_resume_user-123.pdf");
  });

  it("falls back to the legacy shared filename when no user is scoped", async () => {
    const result = await generateDesignResumePdf();

    expect(mockRenderResumePdf).toHaveBeenCalledWith(
      expect.objectContaining({
        outputPath: expect.stringContaining("/pdfs/design_resume_current.pdf"),
      }),
    );
    expect(result.pdfUrl).toContain("/pdfs/design_resume_current.pdf");
  });
});

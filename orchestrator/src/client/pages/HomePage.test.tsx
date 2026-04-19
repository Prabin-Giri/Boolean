import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("uses the IntervAI dev port as the fallback practice URL", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", { name: /start practice/i }),
    ).toHaveAttribute("href", "http://localhost:4173");
  });
});

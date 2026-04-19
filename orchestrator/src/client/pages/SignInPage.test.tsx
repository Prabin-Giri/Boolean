import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignInPage } from "./SignInPage";

vi.mock("@client/api", () => ({
  hasAuthenticatedSession: vi.fn(() => false),
  registerWithCredentials: vi.fn(async () => undefined),
  restoreAuthSessionFromLegacyCredentials: vi.fn(async () => false),
  signInWithCredentials: vi.fn(async () => undefined),
}));

import {
  hasAuthenticatedSession,
  registerWithCredentials,
  restoreAuthSessionFromLegacyCredentials,
  signInWithCredentials,
} from "@client/api";

describe("SignInPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hasAuthenticatedSession).mockReturnValue(false);
    vi.mocked(registerWithCredentials).mockResolvedValue(undefined);
    vi.mocked(restoreAuthSessionFromLegacyCredentials).mockResolvedValue(false);
    vi.mocked(signInWithCredentials).mockResolvedValue(undefined);
  });

  it("signs in and returns to the requested next route", async () => {
    render(
      <MemoryRouter initialEntries={["/sign-in?next=%2Fjobs%2Fready"]}>
        <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/jobs/ready" element={<div>ready-page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(restoreAuthSessionFromLegacyCredentials).toHaveBeenCalledTimes(1);
    });

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Sign in" })[1]);

    await waitFor(() => {
      expect(signInWithCredentials).toHaveBeenCalledWith("admin", "secret");
      expect(screen.getByText("ready-page")).toBeInTheDocument();
    });
  });

  it("registers a new account and returns to the requested next route", async () => {
    render(
      <MemoryRouter
        initialEntries={["/sign-in?mode=register&next=%2Fjobs%2Fready"]}
      >
        <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/jobs/ready" element={<div>ready-page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(restoreAuthSessionFromLegacyCredentials).toHaveBeenCalledTimes(1);
    });

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "new-user" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "super-secret" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "super-secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(registerWithCredentials).toHaveBeenCalledWith(
        "new-user",
        "super-secret",
      );
      expect(screen.getByText("ready-page")).toBeInTheDocument();
    });
  });

  it("shows a clear error when the new-account password is too short", async () => {
    render(
      <MemoryRouter initialEntries={["/sign-in?mode=register"]}>
        <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(restoreAuthSessionFromLegacyCredentials).toHaveBeenCalledTimes(1);
    });

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "bipin" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(registerWithCredentials).not.toHaveBeenCalled();
    expect(
      screen.getByText("Password must be at least 8 characters."),
    ).toBeInTheDocument();
  });
});

import type { Server } from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startServer, stopServer } from "./test-utils";

async function registerUser(baseUrl: string, username: string) {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      password: "super-secret",
    }),
  });
  const body = await response.json();
  return {
    token: body.data.token as string,
    userId: body.data.user.id as string,
  };
}

describe.sequential("Pipeline API routes", () => {
  let server: Server;
  let baseUrl: string;
  let closeDb: () => void;
  let tempDir: string;

  beforeEach(async () => {
    ({ server, baseUrl, closeDb, tempDir } = await startServer());
  });

  afterEach(async () => {
    await stopServer({ server, closeDb, tempDir });
  });

  it("reports pipeline status", async () => {
    const res = await fetch(`${baseUrl}/api/pipeline/status`);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.isRunning).toBe(false);
    expect(body.data.lastRun).toBeNull();
  });

  it("scopes pipeline history to the authenticated user", async () => {
    const { createPipelineRun } = await import("@server/repositories/pipeline");
    const { runWithRequestContext } = await import("@infra/request-context");

    const userA = await registerUser(baseUrl, "pipeline-user-a");
    const userB = await registerUser(baseUrl, "pipeline-user-b");

    await runWithRequestContext({ userId: userA.userId }, async () => {
      await createPipelineRun();
    });
    await runWithRequestContext({ userId: userB.userId }, async () => {
      await createPipelineRun();
    });

    const responseA = await fetch(`${baseUrl}/api/pipeline/runs`, {
      headers: { Authorization: `Bearer ${userA.token}` },
    });
    const bodyA = await responseA.json();

    expect(responseA.status).toBe(200);
    expect(bodyA.ok).toBe(true);
    expect(bodyA.data).toHaveLength(1);

    const responseB = await fetch(`${baseUrl}/api/pipeline/runs`, {
      headers: { Authorization: `Bearer ${userB.token}` },
    });
    const bodyB = await responseB.json();
    expect(responseB.status).toBe(200);
    expect(bodyB.ok).toBe(true);
    expect(bodyB.data).toHaveLength(1);
  });

  it("validates pipeline run payloads", async () => {
    const badRun = await fetch(`${baseUrl}/api/pipeline/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minSuitabilityScore: 120 }),
    });
    expect(badRun.status).toBe(400);

    const { runPipeline } = await import("@server/pipeline/index");
    const runRes = await fetch(`${baseUrl}/api/pipeline/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topN: 5, sources: ["gradcracker"] }),
    });
    const runBody = await runRes.json();
    expect(runBody.ok).toBe(true);
    expect(runPipeline).toHaveBeenCalledWith({
      topN: 5,
      sources: ["gradcracker"],
    });

    const glassdoorRunRes = await fetch(`${baseUrl}/api/pipeline/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sources: ["glassdoor"] }),
    });
    const glassdoorRunBody = await glassdoorRunRes.json();
    expect(glassdoorRunBody.ok).toBe(true);
    expect(runPipeline).toHaveBeenNthCalledWith(2, {
      sources: ["glassdoor"],
    });

    const adzunaRunRes = await fetch(`${baseUrl}/api/pipeline/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sources: ["adzuna"] }),
    });
    const adzunaRunBody = await adzunaRunRes.json();
    expect(adzunaRunBody.ok).toBe(true);
    expect(runPipeline).toHaveBeenNthCalledWith(3, {
      sources: ["adzuna"],
    });
  });

  it("returns conflict when cancelling with no active pipeline", async () => {
    const res = await fetch(`${baseUrl}/api/pipeline/cancel`, {
      method: "POST",
    });
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("CONFLICT");
    expect(typeof body.meta.requestId).toBe("string");
  });

  it("accepts cancellation when pipeline is running", async () => {
    const { requestPipelineCancel } = await import("@server/pipeline/index");
    vi.mocked(requestPipelineCancel).mockReturnValue({
      accepted: true,
      pipelineRunId: "run-1",
      alreadyRequested: false,
    });

    const res = await fetch(`${baseUrl}/api/pipeline/cancel`, {
      method: "POST",
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.pipelineRunId).toBe("run-1");
    expect(body.data.alreadyRequested).toBe(false);
    expect(typeof body.meta.requestId).toBe("string");
  });

  it("streams pipeline progress over SSE", async () => {
    const controller = new AbortController();
    const res = await fetch(`${baseUrl}/api/pipeline/progress`, {
      signal: controller.signal,
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    const reader = res.body?.getReader();
    if (reader) {
      try {
        const { value } = await reader.read();
        const text = new TextDecoder().decode(value);
        expect(text).toContain("data:");
        expect(text).toContain('"crawlingSource"');
        expect(text).toContain('"crawlingSourcesTotal"');
      } finally {
        await reader.cancel();
        controller.abort();
      }
    } else {
      controller.abort();
    }
  });
});

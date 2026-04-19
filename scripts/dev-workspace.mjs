import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";
const pythonPath = path.join(
  rootDir,
  "ai-interview-simulator",
  "backend",
  "venv",
  "bin",
  "python",
);

const services = [
  {
    name: "intervai-backend",
    cwd: path.join(rootDir, "ai-interview-simulator", "backend"),
    command: pythonPath,
    args: ["run.py"],
    enabled: existsSync(pythonPath),
  },
  {
    name: "intervai-frontend",
    cwd: path.join(rootDir, "ai-interview-simulator", "frontend"),
    command: npmCmd,
    args: ["run", "dev", "--", "--host", "0.0.0.0", "--port", "4173"],
  },
];

const children = [];
let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      try {
        child.kill("SIGTERM");
      } catch {
        // Ignore already-exited processes.
      }
    }
  }

  setTimeout(() => {
    for (const child of children) {
      if (!child.killed) {
        try {
          child.kill("SIGKILL");
        } catch {
          // Ignore already-exited processes.
        }
      }
    }
    process.exit(code);
  }, 500);
}

console.log("");
console.log("IntervAI dev workspace");
console.log("Frontend: http://localhost:4173/");
console.log("Backend:  http://localhost:8000/");
console.log("");

for (const service of services) {
  if (service.enabled === false) {
    console.warn(`[skip] ${service.name} is disabled because no backend venv was found.`);
    continue;
  }

  const child = spawn(service.command, service.args, {
    cwd: service.cwd,
    env: process.env,
    stdio: "inherit",
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    const reason =
      signal !== null
        ? `${service.name} exited from signal ${signal}`
        : `${service.name} exited with code ${code ?? 0}`;
    console.error(reason);
    shutdown(code ?? 1);
  });

  children.push(child);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

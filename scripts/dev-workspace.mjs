import { execSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

const services = [
  {
    name: "jobops-server",
    cwd: rootDir,
    command: npmCmd,
    args: ["--workspace", "orchestrator", "run", "dev:server"],
    env: {},
  },
  {
    name: "jobops-client",
    cwd: rootDir,
    command: npmCmd,
    args: [
      "--workspace",
      "orchestrator",
      "run",
      "dev:client",
      "--",
      "--port",
      "3005",
    ],
    env: {
      VITE_INTERVIEW_SIMULATOR_URL: "http://localhost:4173",
    },
  },
  {
    name: "intervai-backend",
    cwd: path.join(rootDir, "ai-interview-simulator", "backend"),
    command: path.join(
      rootDir,
      "ai-interview-simulator",
      "backend",
      "venv",
      "bin",
      "python",
    ),
    args: ["run.py"],
    env: {},
    enabled: existsSync(
      path.join(
        rootDir,
        "ai-interview-simulator",
        "backend",
        "venv",
        "bin",
        "python",
      ),
    ),
  },
  {
    name: "intervai-frontend",
    cwd: path.join(rootDir, "ai-interview-simulator", "frontend"),
    command: npmCmd,
    args: ["run", "dev", "--", "--host", "0.0.0.0", "--port", "4173"],
    env: {},
  },
];

const ports = [3001, 3005, 4173, 8000];
const children = [];
let shuttingDown = false;

function killPort(port) {
  try {
    if (isWindows) {
      return;
    }
    const pids = execSync(`lsof -ti :${port}`, {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .split(/\s+/)
      .filter(Boolean);

    for (const pid of pids) {
      try {
        process.kill(Number(pid), "SIGKILL");
      } catch {
        // Ignore race conditions for already-exited processes.
      }
    }
  } catch {
    // Nothing listening on the port.
  }
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      try {
        child.kill("SIGTERM");
      } catch {
        // Ignore if child already exited.
      }
    }
  }

  setTimeout(() => {
    for (const child of children) {
      if (!child.killed) {
        try {
          child.kill("SIGKILL");
        } catch {
          // Ignore if child already exited.
        }
      }
    }
    process.exit(code);
  }, 500);
}

for (const port of ports) {
  killPort(port);
}

console.log("");
console.log("CareerTwin dev workspace");
console.log("Homepage:         http://localhost:3005/");
console.log("JobOps backend:   http://localhost:3001/health");
console.log("IntervAI app:     http://localhost:4173/");
console.log("IntervAI backend: http://localhost:8000/");
console.log("");

for (const service of services) {
  if (service.enabled === false) {
    console.warn(`[skip] ${service.name} is disabled in this environment.`);
    continue;
  }

  const child = spawn(service.command, service.args, {
    cwd: service.cwd,
    env: {
      ...process.env,
      ...service.env,
    },
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

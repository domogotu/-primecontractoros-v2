import { spawn } from "node:child_process";

const command = process.platform === "win32" ? "tsx.cmd" : "tsx";
const child = spawn(command, ["watch", "server/_core/index.ts"], {
  stdio: "inherit",
  windowsHide: true,
  env: { ...process.env, NODE_ENV: "development" },
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});

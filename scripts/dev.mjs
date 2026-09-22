import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const tsxCli = fileURLToPath(new URL("../node_modules/tsx/dist/cli.mjs", import.meta.url));

const child = spawn(process.execPath, [tsxCli, "watch", "server/_core/index.ts"], {
  stdio: "inherit",
  windowsHide: true,
  env: { ...process.env, NODE_ENV: "development" },
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});

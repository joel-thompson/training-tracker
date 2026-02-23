export {};

const input = await Bun.stdin.text();
const data = JSON.parse(input);
const filePath: string | undefined = data.tool_input?.file_path;

if (!filePath || !/\.(ts|tsx|js|jsx)$/.test(filePath)) process.exit(0);

import { resolve } from "path";
const projectRoot = resolve(import.meta.dir, "../..");
let subDir: string | null = null;
for (const sp of ["frontend", "backend", "shared"]) {
  if (filePath.startsWith(`${projectRoot}/${sp}/`)) {
    subDir = `${projectRoot}/${sp}`;
    break;
  }
}
if (!subDir) process.exit(0);

const run = (args: string[], cwd: string) =>
  Bun.spawnSync(args, { cwd, stdio: ["pipe", "pipe", "pipe"] });

const prettier = run(["bunx", "prettier", "--write", filePath], subDir);
const eslint = run(["bunx", "eslint", filePath], subDir);
const typecheck = run(["bun", "run", "typecheck"], subDir);

const output = [
  `=== prettier ===\n${prettier.stdout.toString() || "(no output)"}`,
  `=== eslint ===\n${eslint.stdout.toString() || "(no output)"}${eslint.stderr.toString()}`,
  `=== typecheck ===\n${typecheck.stdout.toString()}${typecheck.stderr.toString()}`,
].join("\n");

process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: output } }));
process.exit(0);

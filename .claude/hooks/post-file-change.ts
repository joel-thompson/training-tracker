export {};

const input = await Bun.stdin.text();
const data = JSON.parse(input);
const filePath: string | undefined = data.tool_input?.file_path;

if (!filePath || !/\.(ts|tsx|js|jsx)$/.test(filePath)) process.exit(0);

const projectRoot = "/home/joel/src/training-tracker";
let subDir: string | null = null;
for (const sp of ["frontend", "backend", "shared"]) {
  if (filePath.startsWith(`${projectRoot}/${sp}/`)) {
    subDir = `${projectRoot}/${sp}`;
    break;
  }
}
if (!subDir) process.exit(0);

const run = (args: string[], cwd: string) =>
  Bun.spawnSync(args, { cwd, stdio: ["pipe", "inherit", "inherit"] });

run(["bunx", "prettier", "--write", filePath], subDir);
run(["bunx", "eslint", filePath], subDir);
run(["bun", "run", "typecheck"], subDir);

process.exit(0);

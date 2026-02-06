import { execSync } from "child_process";
import path from "path";

function run(cmd: string, cwd?: string) {
  console.log(`\n▶ ${cmd}`);
  execSync(cmd, {
    stdio: "inherit",
    env: process.env,
    cwd,
  });
}

async function main() {
  // Fetch latest VAA JSON files
  run("npx tsx src/vaa-fetcher.ts", path.resolve(process.cwd(), "vaa-fetcher"));

  // Cleanup verified_message accounts (pre-test)
  run("anchor run cleanup", process.cwd());

  // Run verification tests
  run("anchor test --skip-deploy", process.cwd());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import fs from "fs";
import path from "path";

export function listVaaFiles(): string[] {
  const dir = path.join(process.cwd(), "vaa-fetcher", "json");

  if (!fs.existsSync(dir)) {
    throw new Error(`VAA directory not found: ${dir}`);
  }

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort();
}

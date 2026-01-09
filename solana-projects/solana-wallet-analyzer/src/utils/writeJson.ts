import fs from "fs";
import path from "path";

/**
 * Writes data to a JSON file, creating directories if needed
 */
export function writeJson(filePath: string, data: unknown): void
{
  const directoryPath = path.dirname(filePath);

  if (!fs.existsSync(directoryPath))
  {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

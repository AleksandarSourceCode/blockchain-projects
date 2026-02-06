import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function saveJson(fileName: string, data: unknown): Promise<void> {
  const dirPath = join(process.cwd(), "json");
  const filePath = join(dirPath, `${fileName}.json`);

  await mkdir(dirPath, { recursive: true });

  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

  console.log(`✅ JSON saved to ${filePath}`);
}

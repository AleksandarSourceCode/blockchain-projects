import fs from "fs";
import path from "path";

type VaaResponse = {
  data: {
    vaa: string;
  };
};

export function loadVaaFromFile(fileName: string): VaaResponse {
  const filePath = path.join(process.cwd(), "vaa-fetcher", "json", fileName);

  const raw = fs.readFileSync(filePath, "utf-8");

  return JSON.parse(raw);
}

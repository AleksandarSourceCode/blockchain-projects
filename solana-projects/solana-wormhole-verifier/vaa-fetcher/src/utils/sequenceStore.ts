import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const STATE_DIR = join(process.cwd(), "state");
const STATE_FILE = join(STATE_DIR, "sequence.json");

type SequenceState = {
  sequence: number;
};

export async function loadSequence(defaultValue: number): Promise<number> {
  await mkdir(STATE_DIR, { recursive: true });

  try {
    const raw = await readFile(STATE_FILE, "utf-8");
    const data: SequenceState = JSON.parse(raw);
    return data.sequence;
  } catch {
    await saveSequence(defaultValue);
    return defaultValue;
  }
}

export async function saveSequence(sequence: number): Promise<void> {
  await mkdir(STATE_DIR, { recursive: true });

  await writeFile(STATE_FILE, JSON.stringify({ sequence }, null, 2), "utf-8");
}

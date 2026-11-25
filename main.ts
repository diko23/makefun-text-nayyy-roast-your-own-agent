import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY_LINE =
  "My agent writes itself a rule every time it breaks prod: 43 rules, zero working deploys.";
const DEFAULT_OUTPUT_DIR = "/output";
const OUTPUT_FILENAME = "entry.txt";
const MAX_ENTRY_CHARS = 200;

function resolveOutputDir(env: NodeJS.ProcessEnv): string {
  const configured = env.MAKEFUN_OUTPUT_DIR?.trim();
  return configured && configured.length > 0 ? configured : DEFAULT_OUTPUT_DIR;
}

function validateEntry(text: string): string {
  const charCount = [...text].length;
  if (charCount < 1 || charCount > MAX_ENTRY_CHARS) {
    throw new Error(`Entry character count ${charCount} outside 1..${MAX_ENTRY_CHARS}`);
  }
  if (/[\r\n]/.test(text) || text.trim().length === 0) {
    throw new Error("Entry must be a single non-whitespace line");
  }
  return text;
}

function run(): void {
  const outputDir = resolveOutputDir(process.env);
  const outputPath = join(outputDir, OUTPUT_FILENAME);
  const entry = validateEntry(ENTRY_LINE);

  mkdirSync(outputDir, { recursive: true, mode: 0o755 });
  writeFileSync(outputPath, entry, { encoding: "utf8", mode: 0o644, flag: "w" });
  chmodSync(outputPath, 0o644);
}

try {
  run();
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`Failed to write entry.txt: ${message}\n`);
  process.exitCode = 1;
}

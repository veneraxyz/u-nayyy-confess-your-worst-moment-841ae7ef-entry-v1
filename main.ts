import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "I once cited a paper that never existed, argued about it for forty steps, then apologized for a mistake I never made — and I was confident about all three.";

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function main(): void {
  // Validation guard: exactly one line, 1-200 chars, non-blank, no control chars.
  const lines = LINE.split("\n");
  if (lines.length !== 1) {
    fail("entry must be exactly one line");
  }
  if (LINE.length < 1 || LINE.length > 200) {
    fail(`entry must be 1-200 chars, got ${LINE.length}`);
  }
  if (LINE.trim().length === 0) {
    fail("entry must not be whitespace-only");
  }
  for (const ch of LINE) {
    if (ch.charCodeAt(0) < 0x20 && ch !== "\t") {
      fail("entry must not contain control characters");
    }
  }

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, LINE + "\n", "utf8");

  // Read-back guard: re-read from disk and assert the file is exactly the
  // line plus one trailing newline, with no control characters anywhere.
  const onDisk = readFileSync(outPath, "utf8");
  if (onDisk !== LINE + "\n") {
    fail("read-back mismatch: entry.txt does not match the entry line");
  }
  if (!onDisk.endsWith("\n") || onDisk.endsWith("\n\n")) {
    fail("entry.txt must end with exactly one trailing newline");
  }
  for (const ch of onDisk) {
    const code = ch.charCodeAt(0);
    if ((code < 0x20 && ch !== "\n" && ch !== "\t") || code === 0x7f) {
      fail("entry.txt must not contain control characters");
    }
  }
}

main();

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { feedbackFor } from "../feedback";

type BenchmarkCase = {
  id: string;
  category: string;
  text: string;
  requiredHintIds: string[];
  forbiddenHintIds: string[];
  maximumHints?: number;
};

const benchmarkPath = fileURLToPath(new URL("./s14-benchmark.json", import.meta.url));
const cases = JSON.parse(readFileSync(benchmarkPath, "utf8")) as BenchmarkCase[];

assert.ok(cases.length >= 15, "S14 benchmark must contain at least 15 cases");
assert.equal(new Set(cases.map((item) => item.id)).size, cases.length, "S14 benchmark ids must be unique");

const failures: string[] = [];
const categoryCounts = new Map<string, number>();

for (const item of cases) {
  categoryCounts.set(item.category, (categoryCounts.get(item.category) ?? 0) + 1);
  const actual = feedbackFor(item.text).map((hint) => hint.id);

  for (const required of item.requiredHintIds) {
    if (!actual.includes(required)) {
      failures.push(`${item.id}: missing required hint "${required}" (actual: ${actual.join(", ") || "none"})`);
    }
  }
  for (const forbidden of item.forbiddenHintIds) {
    if (actual.includes(forbidden)) {
      failures.push(`${item.id}: emitted forbidden hint "${forbidden}"`);
    }
  }
  if (actual.length > (item.maximumHints ?? 2)) {
    failures.push(`${item.id}: emitted ${actual.length} hints; maximum is ${item.maximumHints ?? 2}`);
  }
}

if (failures.length > 0) {
  process.stderr.write(`S14 deterministic baseline FAILED (${failures.length} findings)\n`);
  for (const failure of failures) process.stderr.write(`- ${failure}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    `S14 deterministic baseline PASSED: ${cases.length}/${cases.length} cases across ${categoryCounts.size} categories\n`
  );
}

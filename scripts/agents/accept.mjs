#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const contractPath = process.argv[2];
const evidencePath = process.argv[3];
if (!contractPath || !evidencePath) {
  console.error('usage: accept.mjs task-contract.json evidence.json');
  process.exit(2);
}

const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
const changed = execFileSync('git', ['diff', '--name-only', `${contract.base_ref}...HEAD`], { encoding: 'utf8' })
  .trim().split('\n').filter(Boolean);

const globToRegex = (glob) => {
  const doubleStar = '__DOUBLE_STAR__';
  const escaped = glob
    .replaceAll('**', doubleStar)
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replaceAll('*', '[^/]*')
    .replaceAll(doubleStar, '.*');
  return new RegExp(`^${escaped}$`);
};
const allowed = contract.allowed_paths.map(globToRegex);
const forbidden = contract.forbidden_paths.map(globToRegex);
const failures = [];

for (const path of changed) {
  if (!allowed.some((pattern) => pattern.test(path))) failures.push(`out-of-scope change: ${path}`);
  if (forbidden.some((pattern) => pattern.test(path))) failures.push(`forbidden change: ${path}`);
}
for (const criterion of contract.acceptance) {
  if (evidence.criteria?.[criterion.id]?.status !== 'pass') failures.push(`criterion not passed: ${criterion.id}`);
}
for (const gate of contract.human_gates) {
  if (evidence.human_gates?.[gate]?.status !== 'approved') failures.push(`human gate not approved: ${gate}`);
}

if (failures.length) {
  console.error('ACCEPTANCE: FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`ACCEPTANCE: PASS (${contract.id}; ${changed.length} changed files)`);

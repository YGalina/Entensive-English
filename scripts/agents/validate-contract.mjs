#!/usr/bin/env node
import fs from 'node:fs';

const contractPath = process.argv[2];
if (!contractPath) {
  console.error('usage: validate-contract.mjs PATH/TO/task-contract.json');
  process.exit(2);
}

const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const requiredArrays = [
  'authoritative_inputs', 'allowed_paths', 'forbidden_paths',
  'deliverables', 'acceptance', 'human_gates'
];

const errors = [];
if (!/^IE-[0-9]{3,}$/.test(contract.id ?? '')) errors.push('invalid id');
if (typeof contract.objective !== 'string' || contract.objective.length < 10) errors.push('objective is missing or too short');
if (typeof contract.base_ref !== 'string' || !contract.base_ref) errors.push('base_ref is required');
for (const key of requiredArrays) {
  if (!Array.isArray(contract[key])) errors.push(`${key} must be an array`);
}
for (const key of ['authoritative_inputs', 'allowed_paths', 'forbidden_paths', 'deliverables', 'acceptance']) {
  if (Array.isArray(contract[key]) && contract[key].length === 0) errors.push(`${key} must not be empty`);
}
if ((contract.budgets?.max_workers ?? 1) > 3) errors.push('max_workers must be <= 3');

if (errors.length) {
  for (const error of errors) console.error(`contract: ${error}`);
  process.exit(1);
}
console.log(`contract: valid (${contract.id})`);

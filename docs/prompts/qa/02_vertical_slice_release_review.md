---
id: QA-02
title: Vertical Slice release review
owner: Codex
status: approved
output: Pilot release verdict
---

# Prompt

Review the actual Vertical Slice implementation, not documentation or implementation claims. Inspect changed code, run relevant tests, and try to bypass the protocol through direct core calls.

Canonical order: pretest 28 → fourteen curriculum sessions plus fourteen calendar days → trained assessment 22 → new-context task → holdout 6 → explicit one-time finalization → repeated read-only export.

Verify core guards, completeness, idempotency, duplicate protection, immutable evidence, recovery isolation, contamination/opportunity states, grammar checker scope, written/spoken separation, private unanalysed voice, process-only metrics, UI order, persistence, and regressions. Distinguish project defects from pre-existing/environment failures.

Return only: Critical bugs; High-priority issues; Tests and results; Protocol invariant verdict; Acceptable limitations; Release verdict (`Blocked for Pilot release`, `Ready for Pilot with stated limitations`, or `Ready for Pilot`).

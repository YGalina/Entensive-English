---
id: QA-03
title: Design implementation review
owner: Codex
status: current
output: UX/design compliance and engineering verdict
---

# Prompt

Review the implemented screen or flow against its approved Screen Specification, Interaction Architecture, visual design, and Product Constitution.

Do not redesign or introduce features. Inspect actual code and execute available checks.

Verify functional flow, all specified states, semantic hierarchy, one primary action, navigation/Back/Close, safe exit versus completion, drafts versus accepted evidence, offline/loading/error behavior, voice lifecycle, privacy, modality claims, accessibility, responsive behavior, analytics/event semantics, and absence of regressions.

Separate missing implementation, visual mismatch, acceptable implementation shortcut, pre-existing issue, and environment limitation.

Return: Critical bugs; High-priority issues; Visual/UX mismatches; Accessibility issues; Tests performed; Acceptable shortcuts; Release verdict.

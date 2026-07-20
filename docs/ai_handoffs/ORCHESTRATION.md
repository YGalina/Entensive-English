# Minimal Claude + Codex orchestration

## Decision

This repository uses the installed official Claude Code and Codex CLIs directly. No third-party orchestrator, MCP server, global package, credentials, or model configuration is installed by this setup.

The shared contract is `AGENTS.md`; Claude loads it through `CLAUDE.md`. Claude-specific roles live in `.claude/agents/`. Codex is launched in read-only or workspace-write mode for an explicitly scoped task and reads `AGENTS.md` automatically.

## Commands

```bash
npm run agents:doctor
npm run agents:smoke
AGENT_SMOKE_LIVE=1 npm run agents:smoke
npm run agents:review -- HEAD
```

The default smoke run is local and makes no model calls. Live smoke calls both CLIs in read-only mode; Claude has a USD 0.10 cap while Codex uses the signed-in subscription or configured provider.

Claude roles can also be started directly:

```bash
claude --agent architect
claude --agent independent-reviewer
claude --agent test-engineer
```

For a scoped Codex implementation, use an explicit prompt and workspace sandbox:

```bash
codex exec --sandbox workspace-write "Read AGENTS.md and implement only <approved task>. Run relevant checks and report changed files."
```

Never use permission bypass flags in this repository. Keep architecture/review agents read-only, name the governing specification, and review the resulting commit independently.

## GitHub workflow

`.github/workflows/agent-config.yml` validates configuration structure and shell syntax. It deliberately does not invoke paid models and requires no repository secrets. Human approval remains required before product changes are merged.

## Removal

Remove `.claude/agents/`, `scripts/agents/`, `.github/workflows/agent-config.yml`, and this document; then delete the three `agents:*` scripts from `package.json`. No global uninstall or credential cleanup is needed.

## Risks and boundaries

- Two models do not create objective truth; independent review can still agree on the same mistake.
- Live runs may consume subscription quota or API budget and may send repository context to the configured model providers.
- Claude and Codex permission systems differ. The wrapper uses read-only modes for review, but implementation runs require deliberate scope and diff review.
- MCP servers are user-level integrations on this machine. This setup neither copies nor enables them for automation.
- Ruflo/Claude Flow and similar third-party orchestrators add supply-chain, permission, configuration-drift, and maintenance risk. Re-evaluate them only when native orchestration is demonstrably insufficient, and pin/audit any version before adoption.

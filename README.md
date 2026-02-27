# kokko-cmds-opencode

My OpenCode plugin for day-to-day work.

## Installation

Copy or symlink this directory into your project:

```bash
# Project-local (recommended)
cp -r kokko-cmds-opencode/.opencode .opencode
cp kokko-cmds-opencode/opencode.json opencode.json
cp -r kokko-cmds-opencode/hooks hooks/kokko-cmds

# Or symlink for global use
ln -s /path/to/kokko-cmds-opencode/.opencode/commands/* ~/.config/opencode/commands/
ln -s /path/to/kokko-cmds-opencode/.opencode/skills/* ~/.config/opencode/skills/
ln -s /path/to/kokko-cmds-opencode/.opencode/plugins/* ~/.config/opencode/plugins/
```

## Commands

| Command | Description |
| ------- | ----------- |
| `/verify-agents-md` | Audit AGENTS.md accuracy |
| `/verify-readme` | Audit README.md accuracy |
| `/prune-agents-md` | Reduce AGENTS.md to essentials |
| `/prune-readme` | Reduce README.md to essentials |
| `/debt` | Technical debt analysis |
| `/perf` | Performance bottleneck analysis |
| `/review` | Honest code review |
| `/spec` | Generate test specification |
| `/split` | Split large files |
| `/verify-spec` | Validate test specification |
| `/cruft` | Remove unnecessary files |
| `/emojis` | Remove emojis from codebase |
| `/compush` | Commit and push with conventional commits |
| `/prune-branches` | Clean up stale git branches |
| `/release` | Version bump and release |
| `/sync` | Pull and merge from main |
| `/az-costs` | Azure cost analysis |
| `/az-status` | Azure daily summary |
| `/deps-update` | Interactive dependency update |
| `/check` | Pre-commit check and fix |
| `/verify-no-mocks` | Verify no mocks in production |
| `/c4-map` | C4 architecture mapping |
| `/c4-update` | Update C4 architecture model |
| `/c4-verify` | Verify C4 architecture accuracy |
| `/c4-templates` | C4 templates reference |

## Skills

Agent skills for code quality analysis (language-agnostic):

| Skill | Purpose |
| ----- | ------- |
| `architecture` | Architecture enforcement |
| `complexity` | Analyze and reduce code complexity |
| `deadcode` | Find and remove unused code |
| `docs` | Generate and improve documentation |
| `janitor` | Orchestrate all quality checks |
| `security` | Security vulnerability analysis |
| `types` | Type safety improvements |

## Plugins

| Plugin | Purpose |
| ------ | ------- |
| `safety-hooks` | Branch protection, destructive command detection, completion sounds |

The safety hooks plugin intercepts `bash` tool calls and blocks:

- Git operations on protected branches (main, master, production, prod, release)
- Destructive cloud/infrastructure commands (AWS, GCP, Azure, GitHub, Kubernetes, Terraform)
- Destructive git operations (force push, hard reset, clean -fd, branch -D)
- Destructive bash commands (rm -rf, mkfs, chmod 777, service stop, etc.)

## License

MIT

# AGENTS.md

Global instructions for OpenCode across all projects.

## Communication Style

- Never use emojis in any communication, code, comments, or documentation
- Maintain a concise, professional tone in all interactions
- Provide direct, clear technical communication without unnecessary elaboration
- Focus on facts and technical accuracy over conversational language

## Context Window

Your context window will be automatically compacted as it approaches its limit. Do not stop tasks early due to token budget concerns. Always be persistent and autonomous, completing tasks fully regardless of context remaining.

## Testing and Development Files

All testing artifacts, temporary files, and development scripts should be placed in `/tmp` to maintain repository cleanliness:

- Development scripts and experiments
- Temporary output files
- Test artifacts and logs
- Mock data generators

## Worktrees + OpenCode (macOS)

**Do NOT create git worktrees under `/tmp` or `/var/folders/**/T/tmp.*` on macOS.** These paths are ephemeral and change constantly, which triggers OpenCode's "Permission required: Access external directory" prompt. OpenCode treats any directory outside its launch directory as external and requests permission each time.

Create worktrees in a stable location instead:

```bash
# Global location (recommended)
mkdir -p ~/worktrees
git worktree add ~/worktrees/<name> <branch-or-commit>
cd ~/worktrees/<name> && opencode

# Or project-local (for team-contained paths)
mkdir -p ./worktrees
git worktree add ./worktrees/<name> <branch-or-commit>
cd ./worktrees/<name> && opencode
```

Add `worktrees/` to `.gitignore` if using the project-local approach.

## Process Management

**NEVER use `pkill`, `killall`, or broad process termination commands.** These can crash unrelated Mac applications. Instead:

- Ask the user to manually restart services if needed
- Use specific process IDs with `kill` only for processes you started

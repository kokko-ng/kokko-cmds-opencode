import { readFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { execSync } from "child_process"

const __dirname = dirname(fileURLToPath(import.meta.url))
const HOOKS_DIR = join(__dirname, "..", "..", "hooks")
const PATTERNS_DIR = join(HOOKS_DIR, "dangerous-patterns")
const PLAY_SOUND = join(HOOKS_DIR, "utils", "play-sound.sh")

function loadPatterns(...categories) {
  const patterns = []
  for (const category of categories) {
    const file = join(PATTERNS_DIR, `${category}.txt`)
    if (existsSync(file)) {
      const lines = readFileSync(file, "utf-8").split("\n")
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith("#")) {
          try {
            patterns.push(new RegExp(trimmed, "i"))
          } catch {
            // Skip invalid regex patterns
          }
        }
      }
    }
  }
  return patterns
}

function matchesAny(command, patterns) {
  return patterns.some((p) => p.test(command))
}

function playSound(type) {
  try {
    if (existsSync(PLAY_SOUND)) {
      execSync(`bash "${PLAY_SOUND}" "${type}"`, { stdio: "ignore" })
    }
  } catch {
    // Sound is best-effort
  }
}

// Pre-load all pattern sets
const CLOUD_PATTERNS = loadPatterns(
  "cloud-aws",
  "cloud-gcp",
  "cloud-azure",
  "cloud-github",
  "kubernetes",
  "terraform"
)
const GIT_PATTERNS = loadPatterns("git")
const BASH_PATTERNS = loadPatterns(
  "file-operations",
  "disk-storage",
  "permissions",
  "users",
  "system-services",
  "packages",
  "networking",
  "process",
  "shell-security",
  "databases",
  "docker"
)

const PROTECTED_BRANCHES = ["main", "master", "production", "prod", "release"]

export const SafetyHooks = async ({ $, client }) => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool !== "bash") return

      const command = output.args?.command || ""
      if (!command) return

      // Branch protection
      if (/git\s+(commit|push|reset|rebase)/.test(command)) {
        // Check for force push to protected branches
        for (const branch of PROTECTED_BRANCHES) {
          const fp1 = new RegExp(
            `git\\s+push\\s+(.*\\s+)?(--force|-f)\\s+(origin|upstream)\\s+${branch}(\\s|$)`
          )
          const fp2 = new RegExp(
            `git\\s+push\\s+(origin|upstream)\\s+${branch}\\s+(--force|-f)`
          )
          if (fp1.test(command) || fp2.test(command)) {
            playSound("warning")
            throw new Error(
              `SAFETY: Force push to protected branch '${branch}' detected. ` +
                "This could overwrite shared history."
            )
          }
        }

        // Check if on protected branch
        try {
          const result = await $`git branch --show-current`.text()
          const currentBranch = result.trim()
          if (
            PROTECTED_BRANCHES.includes(currentBranch) &&
            /git\s+(commit|push|reset|rebase)/.test(command)
          ) {
            playSound("warning")
            throw new Error(
              `SAFETY: You are on protected branch '${currentBranch}'. ` +
                "This git command targets a protected branch directly."
            )
          }
        } catch (e) {
          if (e.message?.startsWith("SAFETY:")) throw e
          // Not in a git repo or git not available, skip
        }
      }

      // Cloud operations check
      if (matchesAny(command, CLOUD_PATTERNS)) {
        playSound("warning")
        throw new Error(
          "SAFETY: Destructive cloud/infrastructure operation detected. " +
            "This command can delete or stop resources."
        )
      }

      // Destructive git check
      if (matchesAny(command, GIT_PATTERNS)) {
        playSound("warning")
        throw new Error(
          "SAFETY: Destructive git operation detected. " +
            "This could rewrite history, delete branches, or discard changes."
        )
      }

      // Destructive bash check
      if (matchesAny(command, BASH_PATTERNS)) {
        playSound("warning")
        throw new Error(
          "SAFETY: Potentially destructive bash command detected. " +
            "This could delete files, stop services, or modify system state."
        )
      }
    },

    "session.idle": async () => {
      playSound("completion")
    },
  }
}

---
description: Map codebase architecture using hierarchical C4 model
---

# C4 Architecture Mapping

Map the codebase architecture using a hierarchical C4 model
(Context -> Containers -> Components).

## Arguments

Usage: `/c4-map [target-directory]`

- `target-directory` - Directory to analyze (default: current working directory)

If `$ARGUMENTS` is provided, use it as the target directory to analyze.

## Prerequisites

A codebase to analyze. No existing C4 model required - this command
generates the initial map.

## Orchestration

```text
Phase 1: Context -> Phase 2: Containers -> Phase 3: Components ->
Phase 4: Synthesis -> Phase 5: Files
```

Each level depends on outputs from the previous level. Execute sequentially,
passing outputs forward.

**Output structure:** See [c4-templates.md](./c4-templates.md#output-structure)

---

## Phase 1: System Context

Spawn a subagent to map SYSTEM CONTEXT level (C4 Level 1):

1. Identify system name, create kebab-case SYSTEM_ID
2. Define system boundary and purpose
3. Find actors (auth patterns, API consumers, user roles)
4. Map external systems (SDK imports, env vars, HTTP clients)
5. Identify preliminary containers (deployable units)

**Search:**

- Glob: `**/*.env*`, `**/pyproject.toml`, `**/package.json`
- Grep: `requests\.`, `httpx\.`, `import.*azure`, `import.*aws`
- Check `docker-compose.yml` for external services

**Output:** JSON per c4-templates.md context phase output schema.
Include C4-PlantUML context diagram.

**WAIT for Phase 1 to complete.**

Store: `SYSTEM_ID`, `EXTERNAL_SYSTEMS`, `PRELIMINARY_CONTAINERS`

---

## Phase 2: Containers

Spawn a subagent to map CONTAINER level (C4 Level 2):

Using Phase 1 outputs (SYSTEM_ID, EXTERNAL_SYSTEMS, PRELIMINARY_CONTAINERS):

1. Validate each is a distinct deployable unit
2. Identify technology stack (framework, runtime)
3. Map inter-container communication (protocols)
4. Identify preliminary components within each
5. Validate external system boundaries

**Search:**

- Glob: `**/Dockerfile`, `**/docker-compose.yml`, `**/main.py`
- Grep: `FastAPI`, `Express`, `Flask`
- Analyze directory structure per container

**Output:** JSON per c4-templates.md container phase output schema.
Include C4-PlantUML container diagram.

**WAIT for Phase 2 to complete.**

Store: `CONTAINERS` with `PRELIMINARY_COMPONENTS`, `CONTAINER_RELATIONSHIPS`

---

## Phase 3: Components

Spawn a subagent to map COMPONENT level (C4 Level 3):

Using Phase 2 outputs (SYSTEM_ID, CONTAINERS):

1. Validate coherent module with clear responsibility
2. Identify internal dependencies (same container)
3. Identify cross-container dependencies
4. Map component interfaces/contracts

**Search:**

- Read `__init__.py` or `index.ts` for exports
- Grep: `class \w+`
- Analyze import statements

**Output:** JSON per c4-templates.md component phase output schema.
Include C4-PlantUML component diagrams (one per container).

**WAIT for Phase 3 to complete.**

Store: `COMPONENTS_BY_CONTAINER`

---

## Phase 4: Synthesis

Spawn a subagent to validate cross-level consistency before file generation:

Using all phase outputs:

1. ID Consistency: Every element traces to parent level
2. Relationship Consistency: Dependencies match imports
3. Coverage Gaps: Missing elements, empty containers
4. Naming Conflicts: Duplicate IDs, invalid folder names
5. Structural Issues: Empty containers, deep nesting

**If validation fails with errors, report to user before proceeding.**

---

## Phase 5: File Generation

Using `FINAL_STRUCTURE` from Phase 4:

### Step 0: Download C4-PlantUML Library

```bash
mkdir -p codemap/.c4-plantuml
BASE_URL="https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master"

[ -f codemap/.c4-plantuml/C4.puml ] || \
  curl -sL -o codemap/.c4-plantuml/C4.puml "$BASE_URL/C4.puml"
[ -f codemap/.c4-plantuml/C4_Context.puml ] || \
  curl -sL -o codemap/.c4-plantuml/C4_Context.puml "$BASE_URL/C4_Context.puml"
[ -f codemap/.c4-plantuml/C4_Container.puml ] || \
  curl -sL -o codemap/.c4-plantuml/C4_Container.puml "$BASE_URL/C4_Container.puml"
[ -f codemap/.c4-plantuml/C4_Component.puml ] || \
  curl -sL -o codemap/.c4-plantuml/C4_Component.puml "$BASE_URL/C4_Component.puml"
```

### Step 1: Create Folders

```bash
SYSTEM_ID="<from FINAL_STRUCTURE>"
mkdir -p codemap/$SYSTEM_ID/containers

for CONTAINER_ID in <containers>; do
  mkdir -p codemap/$SYSTEM_ID/containers/$CONTAINER_ID/components
  for COMPONENT_ID in <components>; do
    mkdir -p codemap/$SYSTEM_ID/containers/$CONTAINER_ID/components/$COMPONENT_ID
  done
done
```

### Step 2: Write Files

Use templates from c4-templates.md:

| Level | Files |
| ----- | ----- |
| System | `context.puml`, `context.md` |
| Container | `container.puml`, `container.md` |
| Component | `component.puml`, `component.md` |

### Step 3: Generate PNGs

```bash
find codemap -name "*.puml" ! -path "*/\.c4-plantuml/*" \
  -exec plantuml -DRELATIVE_INCLUDE="." -tpng {} \;
```

### Step 4: Write README

Create `codemap/README.md` with entry point to `<system-id>/context.md`.

### Step 5: Confirm

```bash
find codemap -type f | sort
```

---

## Output Summary

```markdown
# C4 Mapping Complete

## System: <system-id>

## Structure Generated
- Context level: 1 diagram
- Containers: X containers
- Components: Y components

## Files Created
- Total files: N
- PlantUML diagrams: X
- Markdown docs: Y
- PNG images: Z

## Entry Point
`codemap/<system-id>/context.md`

## Validation
- Status: PASSED/FAILED
- Issues: [list if any]
```

---

## Error Handling

See c4-templates.md for error handling details.

- If any phase fails: Report failure, do not proceed to dependent phases
- If Phase 4 validation fails: List errors, ask user to proceed or fix

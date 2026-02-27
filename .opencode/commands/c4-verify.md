---
description: Validate accuracy and completeness of C4 architecture map
---

# C4 Architecture Verification

Validate accuracy and completeness of the hierarchical C4 architecture map.

## Arguments

Usage: `/c4-verify [system-id]`

- `system-id` - System ID to verify (default: auto-detected from codemap/)

If `$ARGUMENTS` is provided, use it as the system-id to verify.

## Prerequisites

Existing model in `codemap/<system-id>/`. If not present, run `/c4-map` first.

## Orchestration

```text
Phase 1: Preparation -> Phase 2: Parallel Verification -> Phase 3: Synthesis
-> Phase 4: Apply Fixes -> Phase 5: Re-Verification -> Phase 6: Finalization
```

Phase 2 runs five checks in parallel: Completeness, Accuracy, Hierarchy,
Diagram Quality, and Image Pairing.

---

## Phase 1: Preparation

```bash
SYSTEM_ID=$(ls codemap/ | head -1)
echo "System ID: $SYSTEM_ID"
find codemap/$SYSTEM_ID -type f \
  \( -name "*.md" -o -name "*.puml" -o -name "*.png" \) | sort
echo "Containers: $(find codemap/$SYSTEM_ID/containers \
  -maxdepth 1 -type d | wc -l)"
echo "Components: $(find codemap/$SYSTEM_ID -type d -name components \
  -exec ls {} \; | wc -l)"
```

---

## Phase 2: Parallel Verification

Launch ALL FIVE subagents IN PARALLEL in a single message.

### Subagent 1: Completeness Check

Verify all deployable units have folders, all major modules documented,
all integrations in context.puml.

### Subagent 2: Accuracy Check

Verify documented deps match code imports, technology labels match
pyproject.toml/package.json, elements in correct parent folders.

### Subagent 3: Hierarchy Validation

Verify required files exist at each level, no orphans or empty containers,
diagram elements match folders, all navigation links resolve.

### Subagent 4: Diagram Quality Check

Verify PlantUML syntax, correct includes per level, correct macros per level,
element coverage not overloaded or sparse.

### Subagent 5: Image Pairing Check

Verify every markdown diagram reference has corresponding PNG, check PNG
freshness (not stale), find orphan PNGs.

**WAIT for ALL FIVE subagents to complete.**

---

## Phase 3: Synthesis

Spawn a subagent to synthesize findings:

1. Find INTERSECTIONS: Same issue from multiple checks = higher confidence
2. Identify CONFLICTS: Contradictory findings
3. ROOT CAUSE analysis: Multiple issues from one cause
4. PRIORITIZE: severity, frequency, cascade impact, structural first

Fix order: Structural -> Diagrams -> Documentation -> Navigation -> Images

---

## Phase 4: Apply Fixes

Execute fixes in order from correction plan:

- **Structural:** Create missing / remove orphan folders
- **Diagrams:** Fix PlantUML syntax and includes
- **Documentation:** Update markdown content
- **Navigation:** Fix broken links and drill-down tables
- **Images:** Regenerate stale/missing PNGs

---

## Phase 5: Re-Verification

Spawn a subagent to verify fixes were applied correctly.

---

## Phase 6: Finalization

### Step 6A: Regenerate All PNGs

```bash
find codemap -name "*.puml" ! -path "*/\.c4-plantuml/*" \
  -exec plantuml -DRELATIVE_INCLUDE="." -tpng {} \;
```

### Step 6B: Write Verification Report

Create `codemap/VERIFICATION.md` with scores and corrections applied.

### Step 6C: Update README

Update `codemap/README.md` with verification timestamp.

---

## Output Summary

```markdown
# C4 Verification Complete

## Status: PASS/PARTIAL/FAIL

## Scores
- Completeness: X/4
- Accuracy: X%
- Hierarchy: X/5
- Diagram Quality: X/5
- Image Pairing: X missing, Y stale, Z orphan

## Fixes Applied
- Structural: X
- Diagrams: Y
- Documentation: Z
- Navigation: W
- Images: V regenerated

## Report: codemap/VERIFICATION.md
```

---

## Error Handling

- **Subagent failure:** Continue with other checks, note incomplete verification
- **Irreconcilable conflicts:** List for human decision, skip auto-fix
- **Fix failure:** Log, continue with independent fixes, report partial success
- **Re-verification failure:** List failed fixes, suggest manual intervention

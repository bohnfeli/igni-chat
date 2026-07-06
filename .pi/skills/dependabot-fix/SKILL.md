---
name: dependabot-fix
description: Fix open GitHub Dependabot security alerts in this repo. Lists alerts via `gh api`, maps each to the correct per-ecosystem fix command (npm/rust), applies it, verifies, and commits. Use when Dependabot alerts need resolving or the user says "fix dependabot alert".
---

# dependabot-fix

Resolves every **open** Dependabot alert on the current repo's default remote.

## Prerequisites

- `gh` authenticated (`gh auth status`) to the repo's GitHub remote.
- Node 20+ (uses the built-in `node:test` runner — no install needed).
- For `npm` alerts: `pnpm`. For `rust`/`cargo` alerts: `cargo`.

## Steps

### 1. Resolve repo + fetch open alerts

```bash
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
gh api "repos/$REPO/dependabot/alerts" --jq \
  '[.[] | select(.state=="open") | {
     number, ecosystem: .security_vulnerability.package.ecosystem,
     package: .security_vulnerability.package.name,
     manifest: .dependency.manifest_path,
     fixed: .security_vulnerability.first_patched_version.identifier,
     summary: .security_advisory.summary }]'
```

If the array is empty, there is nothing to do — stop here.

### 2. Plan the fix for each alert

For each alert object, derive the fix command from the pure planner in this
skill directory (this is the tested part — do not improvise commands):

```bash
node -e 'import("./.pi/skills/dependabot-fix/parse-fix.mjs").then(m =>
  console.log(JSON.stringify(m.planFix(ALERT_JSON), null, 2)))'
```

where `ALERT_JSON` is the single alert object from step 1. Each result is a
list of `{ run, cwd }` steps.

Per-ecosystem behaviour:

- `npm` → `pnpm add <pkg>@<fixed>` (rewrites package.json + lockfile).
- `rust` / `cargo` → `cargo update -p <pkg> --precise <fixed>` run in the
  crate dir (`src-tauri` for this repo). If the direct Cargo.toml constraint
  excludes the fixed version, cargo errors clearly — then bump the version in
  `Cargo.toml` and re-run.
- anything else throws `unsupported ecosystem: <x>` → handle manually or
  extend `parse-fix.mjs` (and its test) first.

### 3. Apply

Run each step's `run` with `cwd` as working directory.

### 4. Verify

- Always: `pnpm test`.
- If a rust alert was fixed: `cargo check` in the affected crate dir.

If verification fails → revert the change (`git checkout -- <files>`) and
rethink. Do not commit broken fixes.

### 5. Commit (one per alert)

Conventional commit, e.g.:

```
fix(deps): bump glib to 0.20.0 (dependabot security alert #1)
```

Stage only the manifest/lockfile the fix touched (`Cargo.lock`,
`package.json`, `pnpm-lock.yaml`, …), not `ketchup-plan.md`.

### 6. (Optional) dismiss / confirm

Re-run step 1 — the fixed alert should now be `state: "dismissed"` or gone.

## Self-test

The planner is unit-tested; run it any time you edit `parse-fix.mjs`:

```bash
node --test .pi/skills/dependabot-fix/parse-fix.test.mjs
```

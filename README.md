# Igni-chat

> A tracer-bullet desktop Matrix client on Tauri 2 + matrix-rust-sdk + React —
> proving a clean, minimal, debt-free path exists.

## Goals

- End-to-end tracer bullet: login → sync → rooms → history → send → live receive → E2EE.
- Clean UI↔SDK seam so a future web (WASM) build slots in without a rewrite.
- Minimal, readable codebase — the anti-Element.
- Develop and test against a local Synapse instance.

## Getting Started

Desktop app scaffolded (Tauri 2 + React + TS); backend wired to
matrix-rust-sdk. Local Synapse runs via docker-compose — bring it up with
`./dev/synapse/provision.sh` (creates the dev `igni` account). The full
tracer bullet (login → sync → rooms → history → send → live receive → E2EE)
is wired and verified against it.

```bash
pnpm install            # frontend deps (allows esbuild build via pnpm-workspace.yaml)
cargo build             # Tauri backend (Rust) — in src-tauri/
pnpm tauri dev          # run the desktop app
```

A Matrix account on local Synapse is assumed to already exist (registration
is out of scope for v1).

## Architecture

- **Tauri 2 backend (Rust):** `src-tauri/`. Depends on `matrix-sdk` 0.18
  (default features: `e2e-encryption`, `automatic-room-key-forwarding`,
  `sqlite`). Will expose the SDK through a defined set of Tauri commands —
  the UI↔SDK seam. SDK uses rustls (no system-TLS linkage).
- **Vite + React frontend (TypeScript):** `src/`. Runs in the Tauri webview.
  Atomic Design + Feature-First structure emerge with the first feature.
  Depends only on the seam interface, never on raw SDK types.
- **Dev Synapse:** docker-compose homeserver for testing (including E2EE);
  provision via `./dev/synapse/provision.sh`.

## Contributing

> Placeholder — personal project for now; conventions land as the codebase does.

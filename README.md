# Desktop Client Element (working name)

> A tracer-bullet desktop Matrix client on Tauri 2 + matrix-rust-sdk + React —
> proving a clean, minimal, debt-free path exists.

## Goals

- End-to-end tracer bullet: login → sync → rooms → history → send → live receive → E2EE.
- Clean UI↔SDK seam so a future web (WASM) build slots in without a rewrite.
- Minimal, readable codebase — the anti-Element.
- Develop and test against a local Synapse instance.

## Getting Started

> Placeholder — fill in once the project is scaffolded. Planned shape:

1. Start a local Synapse (docker-compose in `./dev/synapse`).
2. `pnpm install` (frontend deps) and `cargo build` (Tauri backend).
3. `pnpm tauri dev` to run the desktop app.
4. Log in to the local Synapse with a test account.

## Architecture

> Placeholder — to be filled once scaffolded. Intended shape:

- **Tauri 2 backend (Rust):** binds matrix-rust-sdk; exposes the SDK through a
  defined set of Tauri commands (the UI↔SDK seam).
- **Vite + React frontend (TypeScript):** the desktop UI. Built with Atomic
  Design (atoms → molecules → organisms → templates → pages) and a Feature-First
  directory structure (organized by feature/domain, not by file type). Depends
  only on the seam interface, never on raw SDK types.
- **Dev Synapse:** docker-compose Matrix homeserver for testing, including E2EE.

## Contributing

> Placeholder — personal project for now; conventions land as the codebase does.

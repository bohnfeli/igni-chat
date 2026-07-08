# Project: Igni-chat

## Vision

A tracer-bullet desktop Matrix client that proves a clean, minimal, debt-free

path is possible — in deliberate contrast to Element Desktop, a glorified

wrapper around a debt-laden web codebase. Built on Tauri 2 + matrix-rust-sdk + React. Personal project; the deliverable is the proof that the architecture

breathes end-to-end, not a feature-complete Element replacement.

## Goals

1. Ship a thin end-to-end tracer bullet: login → sync → list rooms → open a

   room → see history → send a message → receive a live message → E2EE works

   transparently. One wire, lit up.
2. Keep the UI↔SDK boundary a clean interface (Tauri command layer) so a future

   WASM/web build can slot in without rewriting the frontend.
3. Keep the codebase clean and minimal — be the anti-Element, not a second one.
4. Develop and test against a local Synapse instance (full control, E2EE

   testable, no risk to real accounts).

## Stakeholders

- The owner (solo, personal project, proof of concept).
- Future readers evaluating "what's possible" with Tauri + matrix-rust-sdk.

## Assumptions

- matrix-rust-sdk compiles and runs cleanly as a Tauri (Rust) backend dependency.
- A local Synapse via docker-compose is sufficient for all dev/test, including E2EE.
- Tauri 2 + Vite + React + TypeScript is a stable, supported combination.
- E2EE is the SDK's job. The client's job is to wire it up correctly, not to

  reimplement crypto.
- A Matrix account already exists on the local Synapse (registration flows are

  out of scope for v1).

## Fundamental Requirements

- The end-to-end tracer bullet must work against local Synapse: log in, sync,

  open an encrypted room, send, and receive a live message.
- The UI must depend only on a defined UI↔SDK interface — never on raw SDK types

  leaking across the seam.
- The desktop (Tauri) build must run on the dev machine.

## Technical Patterns

- Tauri 2 — Rust backend + webview frontend.
- matrix-rust-sdk — Rust crate, lives in the Tauri backend; the frontend calls

  it through Tauri commands (the seam).
- Vite + React + TypeScript (SPA frontend, runs in the Tauri webview).
- Atomic Design — UI components built up as atoms → molecules → organisms →

  templates → pages.
- Feature-First structure — the frontend is organized by feature/domain (each

  feature owns its components, hooks, state, and types), not by file type.
- Local Synapse via docker-compose for dev/test.
- Clean UI↔SDK seam: one interface, a Tauri-command impl now, a WASM impl later.

## Constraints

- Solo contributor, no hard timeline.
- Desktop first; the browser/web target is explicitly deferred (seam preserved).
- matrix-rust-sdk is the chosen SDK — no matrix-js-sdk, no Element-Web lineage.
- Dev platform: macOS (Tauri is cross-platform; the build target is desktop).

## Out of Scope (v1)

- Web/browser target (deferred; seam kept clean for it).
- Spaces, threads, VoIP, reactions, file/media sharing, multi-account, search,

  notifications, read receipts, rich settings UI — anything beyond the 7-point

  tracer bullet.
- Mobile.
- Crypto reimplementation — the SDK handles E2EE.
- Account registration flows — assume the account exists on local Synapse.

---

## Guidelines

- **Be honest and give constructive feedback.** If something is wrong, say so.

  If a requirement is contradictory, flag it. Silence is not helpful.
- **Follow the principle of Occam's Razor.** Among competing explanations or

  solutions, prefer the simplest one that fits the evidence. Simplicity is a

  feature, not a shortcut.
- **Follow KISS (Keep It Simple, Stupid).** If a design or implementation cannot

  be explained in plain language, it is too complex. Refactor until it can.
- **Follow YAGNI (You Aren't Gonna Need It).** Do not build for speculative

  future needs. Build what is needed now. When the future arrives, it will bring

  its own requirements.
- **Aim for ~80% test coverage.** Pragmatic, not dogmatic. Cover real behavior

  and branches (login flows, seams, non-trivial logic); skip trivial getters

  and pure presentational glue. Don't write tests just to chase a number.
- **Maximize the work that does not need to be done.** The best code is the code

  that never had to be written. Every line of code is a liability — it must be
- Stay aligned to what already exists (**DRY**). If there is something that should
be refactored first ask for permission

---

## Code Conventions

### Object binding vs. free functions (Rust)

Operations are **bound to a struct**, not exposed as free functions. The only
free functions allowed are constructors that build the struct. Rationale: a
free function that looks "stateless" today is a trap — there is **always
more**. Any operation on a real client needs the shared authenticated
`matrix_sdk::Client` (login, sync, send, send-to-device...). Binding up front
avoids a forced refactor the moment a second operation lands.

Applied: the `igni-matrix` crate exposes `IgniClient`, constructed once and
holding the live `Client`; `login` (and later sync/send) are methods on it.
Free functions exist only at the outermost wiring seam (`run()` entry points,
`#[tauri::command]` shims, the wasm-bindgen wrapper) where a struct would be
pure ceremony — those translate, they do not own domain logic.

### Test file layout

Tests live in **separate files** in a `tests/` directory, aligned with the
TypeScript convention (`foo.test.ts(x)`). Rust unit tests are **not** inlined
as `#[cfg(test)] mod tests { ... }` at the bottom of the module — that bloats
the source file and mixes concerns. Keep production code and test code apart.

- **TypeScript:** `src/foo.ts` tested by `src/foo.test.ts(x)`.
- **Rust:** `src/lib.rs` (or `src/<module>.rs`) tested by
  `tests/<module>.rs` (integration) or a sibling test module file.

Where private-item access forces an inline test, isolate it in a dedicated
`#[cfg(test)]` module in its **own** file referenced via `#[path]`, never
inside the production module body.

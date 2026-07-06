---
version: alpha
name: Igni-chat
description: Dark-first, calm, minimal design system for Igni-chat — a tracer-bullet desktop Matrix client. One warm ember accent over a near-black canvas; tonal depth, not heavy shadows.
colors:
  canvas: "#131015"
  surface: "#1B181D"
  surface-high: "#232026"
  surface-highest: "#2C2830"
  primary: "#FF6A3D"
  on-primary: "#1A0E08"
  secondary: "#6C7278"
  tertiary: "#6FB3FF"
  neutral: "#2A262E"
  on-surface: "#F3EFEA"
  on-surface-muted: "#A39CA6"
  verified: "#3DDC97"
  error: "#FF5470"
typography:
  display:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  h1:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.2
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.5
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.2
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.3
  mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 18px
  full: 9999px
spacing:
  none: 0
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 16px
  margin: 24px
components:
  message-bubble-received:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm} {spacing.md}"
  message-bubble-sent:
    backgroundColor: color-mix(in srgb, "{colors.primary}" 16%, "{colors.surface}")
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm} {spacing.md}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.lg}"
  button-primary-hover:
    backgroundColor: "#FF8055"
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.lg}"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
  room-list-item:
    padding: "{spacing.sm} {spacing.md}"
    rounded: "{rounded.md}"
  avatar:
    backgroundColor: "{colors.surface-high}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    size: 36px
  chip-encrypted:
    backgroundColor: color-mix(in srgb, "{colors.verified}" 16%, transparent)
    textColor: "{colors.verified}"
    rounded: "{rounded.sm}"
    padding: "2px {spacing.xs}"
---

# Igni-chat Design System

A design system for Igni-chat — a minimal desktop Matrix client built on Tauri 2

+ matrix-rust-sdk + React. The system exists to make one thing effortless:
**reading and writing conversation**, even when it is end-to-end encrypted.

## Overview

Igni-chat is the deliberate anti-Element: not a web wrapper, not a feature
swarm. One wire, lit up. The visual language follows the same discipline.

+ **Personality:** Calm, focused, quietly confident. The app should feel like a
  reading room, not a control tower. Long sessions of conversation should leave
  no visual fatigue.
+ **Dark-first.** Chat happens at all hours; a near-black canvas with a single
  warm accent is restful and legible. Light mode is deferred, not designed
  against.
+ **One accent, used sparingly.** The ember (`primary`) is the brand's
  namesake — *Igni*, to kindle. It marks exactly two things: **your own
  presence** (your sent messages, the send action) and **the primary action of
  the current screen**. Nothing else is ember. Restraint is the brand.
+ **Tonal, not shadowed.** Depth comes from layered surface brightness, never
  from drop shadows. The UI stays flat and engineered.
+ **Density with air.** Conversations are scannable, but each element has room
  to breathe. A strict 8px rhythm (4px half-step for micro-adjustments) holds it
  together.

The emotional goal: a tool you trust with your private words because it gets out
of the way.

## Colors

The palette is a deep warm-black canvas, a near-white ink, one ember accent, and
two sparing semantic colors (encryption-verified, error).

+ **Canvas (#131015):** The room itself — every screen sits on this warm
  near-black. Never pure `#000`; the warmth softens long reading.
+ **Surface (#1B181D → #2C2830):** Three tonal steps for panels, bubbles, and
  raised controls. Step up in brightness to lift something forward; never use a
  shadow to do it.
+ **Primary / Ember (#FF6A3D):** The single brand accent. Reserved for the
  screen's primary action and the user's own messages. Paired with `on-primary`
  near-black ink for AA text on the ember fill.
+ **Secondary (#6C7278):** A neutral slate for borders, dividers, and inert
  chrome — never for body text.
+ **Tertiary / Ice (#6FB3FF):** Used only for links and Matrix handles inside
  messages. Cool, so it never competes with the ember.
+ **Verified (#3DDC97):** The signal of trust. Appears exclusively for
  end-to-end-encryption state (lock chips, verified-device indicators). Green =
  "your words are protected."
+ **Error (#FF5470):** Failures only — failed sends, broken encryption, auth
  errors.
+ **On-surface (#F3EFEA / #A39CA6):** Warm near-white for primary text; a muted
  companion for timestamps, previews, and metadata. Both clear AA on every
  surface tone.

All foreground/background pairs verified at WCAG AA (4.5:1) or better; primary
text and the muted companion clear AAA (7:1) on canvas.

## Typography

Two typefaces, one job each.

+ **Inter** carries everything people *read*: messages, room names, controls,
  labels. It is legible at chat density and has nothing to prove.
+ **JetBrains Mono** carries everything that is *technical*: Matrix user IDs,
  device IDs, room IDs, and timestamps. Matrix identifiers are data, not prose —
  rendering them in mono signals "precise, machine-verified," which reinforces
  the encryption story without an extra icon.

Ten levels, each with a role:

+ **display:** The login screen wordmark — *Igni-chat*. The only 40px type in
  the product.
+ **h1 / h2:** Screen and section titles (a room's name, a settings group).
+ **body-lg:** The message body itself. 17px so a long thread reads like prose.
+ **body-md:** Default UI text — buttons, inputs, menu items.
+ **body-sm:** Secondary text — room previews in the list, subtle hints.
+ **label-md:** Room names in the sidebar, composer affordances; semi-bold to
  anchor scanning.
+ **label-sm:** Eyebrow caps — `ENCRYPTED`, `SENDING`, section kickers. Short,
  uppercase, tracked.
+ **caption:** Timestamps and metadata in running prose context.
+ **mono:** All Matrix identifiers and timestamps inside the timeline.

Never more than two font weights visible on one screen (regular + one
semi-bold). Bold is for anchoring the eye, not decoration.

## Layout

A two-pane desktop shell: a persistent **room list** rail on the left and the
**conversation** filling the rest. The composer is pinned to the bottom of the
conversation pane; the timeline scrolls above it.

+ **Fluid for the conversation, fixed for the rail.** The room list is a stable
  ~280px width; the timeline and composer flex to fill remaining width with a
  comfortable max line length for `body-lg` reading.
+ **8px spacing scale** (with a 4px half-step for micro-adjustments). Every gap,
  padding, and inset lands on the scale — rhythm is felt, not noticed.
+ **Containment over connection.** Panels and bubbles read as discrete objects
  separated by canvas, not by lines. Borders are a last resort; breathing room
  is the default separator.
+ **Composer as stage.** The message input is the most important control in the
  app; it sits on `surface`, lifted by its own padding, with the send button in
  ember as that screen's primary action.

## Elevation & Depth

Depth is **tonal**, never shadowed. There are no drop shadows anywhere in the
product — they read as decoration and add visual noise to dense conversation.

+ **Canvas** is the lowest plane.
+ **Surface** is one step up — bubbles, inputs, the composer.
+ **surface-high / surface-highest** raise hovered rooms, active selections,
  and floating overlays (tooltips, menus).

If something must feel detached (a popover, a modal), step its brightness up two
levels and add a hairline `neutral` border. That is the entire elevation system.

## Shapes

**Calm geometry.** A small, consistent set of radii, never mixed within a view.

+ **4px (sm):** Chips, small inline controls, the encryption lock chip.
+ **8px (md):** Inputs, buttons, list items, the composer field.
+ **12px (lg):** Message bubbles and panels.
+ **18px (xl):** Reserved for oversized emphasis surfaces if ever needed; default
  to 12px.
+ **full:** Avatars, the send button, pills.

The rule: corners within a single view agree. A timeline of 12px bubbles does
not suddenly host an 18px element.

## Components

+ **Message bubbles.** Received messages sit on `surface`; your own sit on an
  ember-tinted surface (16% ember over surface) so your eye finds your own
  words first. Both use `body-lg`, 12px radius, and consistent padding so the
  timeline reads as a single column.
+ **Buttons.** Primary = ember fill, dark ink, the screen's one important
  action (Log in, Send). Secondary = transparent with `on-surface` text for
  lower-priority actions. No tertiary affordance beyond a plain link in `tertiary`.
+ **Room list item.** Avatar + room name (`label-md`) + last-message preview
  (`body-sm`, muted). Active/hover state lifts the background to `surface-high`.
  Unread state introduces the ember as a small dot — never as a flood of color.
+ **Composer.** A `surface` field with 8px radius; the Send button is a `full`
  ember disc on the trailing edge. Disabled when empty; ember dims to indicate
  the disabled state.
+ **Encryption chip.** `verified`-green text on a 16% `verified` tint, 4px
  radius, a lock glyph. Appears in the composer and on encrypted room headers.
  It is the single visible proof of E2EE — present, small, trustworthy.
+ **Input fields.** `surface` fill, `on-surface` text, 8px radius, clear focus
  via an ember ring rather than a border-weight change.
+ **Avatar.** `full` circle, `surface-high` fill, initials or a homeserver image.
+ **Tooltips.** `surface-highest` with a `neutral` hairline, `caption` text,
  short delay. Used for truncated Matrix IDs only.

## Do's and Don'ts

**Do**

+ Use the ember (`primary`) for exactly two things per context: the primary
  action, and the user's own messages.
+ Maintain WCAG AA contrast (4.5:1 text, 3:1 large) — the token pairs above are
  pre-verified.
+ Convey depth with surface brightness, not shadows.
+ Render Matrix identifiers and timestamps in `mono` — it signals trust.
+ Keep to the 8px spacing scale; use the 4px half-step only for micro-adjustments.

**Don't**

+ Don't introduce a second accent color. If a new state appears, reuse an
  existing semantic color or express it through surface tone.
+ Don't mix corner radii within a single view.
+ Don't use drop shadows for elevation.
+ Don't put more than two font weights on one screen.
+ Don't style encryption as decorative — the green lock is a guarantee, treat it
  with restraint.

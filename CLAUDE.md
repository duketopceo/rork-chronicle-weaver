# rork-chronicle-weaver — Agent Instructions

## Gospel Rules

**READ FIRST**: All agents and contributors must follow [luke-agents](https://github.com/duketopceo/luke-agents) — Karpathy principles, code standards, testing, security, guardrails, integrations, and deployment patterns. That repo is the source of truth.

**Precedence**:
1. `luke-agents` (gospel)
2. This `CLAUDE.md` (repo-specific overrides)
3. Runtime agent instructions

---

# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Derived from Andrej Karpathy's observations on LLM coding pitfalls.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## Chronicle Weaver — Project-Specific Rules

- `main` is always deployable. Never commit broken builds.
- `npx tsc --noEmit` + `npm test` must pass before every commit.
- Firebase and Supabase are feature-flagged. Don't remove Firebase until `EXPO_PUBLIC_USE_SUPABASE=true` is confirmed stable.
- Don't touch `backend/` TypeScript config from root — it has its own `tsconfig.json`.
- Don't add unsolicited type fixes to files outside the scope of the task.
- Model provider changes go through `ModelRouter` — never call Ollama or cloud APIs directly from components.
- RLS policies are security-critical. Any schema change requires a migration file in `supabase/migrations/`.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

> Source: [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)

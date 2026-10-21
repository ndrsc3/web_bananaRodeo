# /ship — Validate, commit, push a feature branch, open a PR into main

Use this when a change is ready. This repo uses **GitHub flow**: `feature/*` → PR into `main` → merge publishes to banana.rodeo (see `CLAUDE.md` § Git Workflow). `/ship` gets your branch validated, pushed, and PR'd. It never merges.

## Preconditions

- You're on a `feature/*` / `fix/*` / `chore/*` branch, ideally in its **own worktree**, not on `main`. If on `main`, stop and tell the user to ship from a feature branch.

## Steps

1. **Check** — `npm run check` (typecheck, lint, test, build, smoke; the same gate CI runs). If it fails, stop and help fix before proceeding.
2. **Fetch first** — `git fetch origin`. If `main` has advanced, rebase your un-pushed commits onto `origin/main`; surface conflicts, don't force-resolve. (Concurrent sessions merge here routinely.)
3. **Show the summary** — `git diff --stat` and `git status` so the user sees exactly what's committed.
4. **Ask the user for the commit message** — their ship moment; don't generate it.
5. **Commit** with the user's message. The pre-commit hook re-runs `npm run check`; never pass `--no-verify`.
6. **Push the branch** — `git push -u origin <branch>` (Vercel builds a preview).
7. **Open the PR into `main`** — `gh pr create --base main --head <branch>`, and give the user the PR URL. Run `/review` first if not already done.
8. **Report** CI `verify` and the preview URL once they finish. Validate the change on the preview.

## Merging (publishing) — separate and deliberate

Only after CI is green, the preview is validated, and **the owner approves in chat**:

```
gh pr merge <n> --merge
```

Merging triggers the Vercel production deploy. Then verify production (`CLAUDE.md` § Git Workflow, step 7) and clean up the worktree. If GitHub reports the branch is out of date, run `gh pr update-branch <n>` and wait for CI again.

## Notes

- **Never** push to `main` directly; the ruleset rejects it anyway.
- If anything fails, stop and diagnose rather than retrying.

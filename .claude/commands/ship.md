# /ship — Validate, commit, push a feature branch, open a PR into development

Use this when a feature is ready to integrate. This repo uses a **two-tier flow** — `feature/* → development → main` (see `CLAUDE.md` § Git Workflow). `/ship` gets your **feature branch** validated, pushed, and PR'd into **`development`**. It never touches `main` directly.

## Preconditions

- You're on a `feature/*` / `fix/*` / `chore/*` branch, ideally in its **own worktree** — **not** on `development` or `main`. If on `development` or `main`, stop and tell the user to ship from a feature branch.

## Steps

1. **Build** — `npm run build`. If it fails, stop and help fix before proceeding.
2. **Lint** — `npm run lint`. If it fails, stop and fix. Warnings are advisory.
3. **Fetch first** — `git fetch origin`. If `development` has advanced, rebase your un-pushed commits onto `origin/development` before continuing; surface conflicts, don't force-resolve. (Concurrent sessions/agents push here routinely.)
4. **Show the summary** — `git diff --stat` and `git status` so the user sees exactly what's committed.
5. **Ask the user for the commit message** — their ship moment; don't generate it.
6. **Commit** with the user's message.
7. **Push the feature branch** — `git push -u origin <branch>` (Vercel builds a branch preview).
8. **Open the PR into `development`** — `gh pr create --base development --head <branch>` (merge commit, not squash), or give the user the PR URL. Validate on the preview deploy; run `/review` first if not already done.

## Promoting `development` → `main` (production) — separate & deliberate

Only after `development` is validated on its preview. This is the publish step:

```
git checkout main && git fetch origin && git merge --ff-only origin/development && git push origin main
```

`main` only ever **fast-forwards** to a validated `development` tip — it never takes a direct feature merge. Pushing `main` triggers the Vercel production deploy to banana.rodeo. Confirm with the user before running it.

## Notes

- **Never** push to `main` directly, and **never** PR a feature into `main` — features go to `development`.
- Never skip build or lint — broken code reaching production is worse than a slow ship.
- If anything fails, stop and diagnose rather than retrying.

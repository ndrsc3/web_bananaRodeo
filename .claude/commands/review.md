# /review — Pre-merge code review

Use this command before merging a branch to main. Run through each step in order. Build failures are blockers — stop and fix before proceeding. Security and quality findings are advisory — surface them clearly and let the developer decide.

## Steps

### 1. Confirm branch
Check current branch. If already on `main`, stop and say: "You're on main — run `/review` from a feature branch before merging."

```
git branch --show-current
```

### 2. Show what's changing
Summarize the diff so the developer knows the scope of the review.

```
git diff main...HEAD --stat
git log main..HEAD --oneline
```

### 3. Run build — BLOCKING
```
npm run build
```
If the build fails: **stop here**. Do not proceed. Show the error, diagnose the root cause, and help fix it. Only continue once the build is clean.

### 4. Run lint — BLOCKING
```
npm run lint
```
If lint fails: **stop here**. Fix the errors before proceeding. Warnings are advisory — note them but don't block.

### 5. Security checklist
Review the diff against main (`git diff main...HEAD`) and check each item. For each issue found, flag it clearly with the file and line number.

- [ ] **XSS** — any user-supplied content inserted into the DOM? Must go through `escapeHtml()` or use `textContent`, not raw `innerHTML` interpolation
- [ ] **Secrets** — no API keys, tokens, or passwords hardcoded or committed. Env vars belong in `.env.local` (gitignored), never in source
- [ ] **API validation** — new or modified API endpoints validate required fields and reject unexpected input
- [ ] **Auth coverage** — any new pages that should be behind the auth gate? Check that `handleAuthRedirect()` runs via `main.ts`
- [ ] **External links** — `target="_blank"` links include `rel="noopener noreferrer"`

### 6. Code quality checklist
These are advisory — surface findings as suggestions, not blockers.

- [ ] No leftover debug `console.log` statements with sensitive data
- [ ] No commented-out code blocks left behind
- [ ] New TypeScript is properly typed — no unnecessary `any` casts
- [ ] No duplicate logic that could be a shared helper (only flag if obvious)

### 7. Render verdict

**If any BLOCKING issue was found** (build, lint, security): state clearly what needs to be fixed and stop.

**If only advisory findings**: list them with file:line references. Then say: "No blockers found. Advisory items above — address or note why you're skipping them. Ready to merge when you are."

**If clean**: say: "All checks passed. Ready to merge — run `/ship` to proceed."

## Notes
- This is a pre-merge review, not a post-merge fix. Run it before `git checkout main`.
- For security items, err on the side of flagging — better a false positive than a missed XSS.
- If the diff is large (50+ files), focus security review on `api/`, `src/`, and any HTML files with user-facing content.

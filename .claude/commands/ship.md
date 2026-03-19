# /ship — Validate, commit, and push to main

Use this command when the user is ready to ship their changes. Walk through each step, confirming before destructive actions.

## Steps

1. **Run the build** to validate everything compiles and static assets process correctly:
   ```
   npm run build
   ```
   If the build fails, stop and help the user fix the errors before proceeding.

2. **Show a summary of what's changing** — run `git diff --stat` and `git status` so the user can see exactly what will be committed.

3. **Ask the user for a commit message** that describes what changed and why. Do not generate the message yourself — this is their ship moment.

4. **Commit the changes** with the user's message, co-authored by Claude.

5. **Confirm before pushing** — tell the user: "Pushing to main will trigger a Vercel auto-deploy. Ready?" Wait for explicit confirmation.

6. **Push to main**: `git push origin main`

7. **Confirm success** — show the push output and remind the user to check their Vercel dashboard for the deployment status.

## Notes
- If the user hasn't run `/review` yet, remind them: "Have you run `/review` on this branch? It catches build, lint, and security issues before they hit production." Don't block on this — it's a reminder, not a gate.
- If the user is on a feature branch, merge to main first (`git checkout main && git merge <branch> --no-ff`) before pushing
- Never skip the build step — a broken build deploying to production is worse than a slow ship
- If anything fails, stop and diagnose rather than retrying

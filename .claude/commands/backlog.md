# /backlog — Session Brief & Task Triage

Run the backlog agent to generate the session brief, then ask: "What are we working on today?"

If the user names a page or feature:
- Search `docs/TASKS.md` for matching tags and surface related tasks
- If they name something that has an exploration file but no tasks yet, offer to run `/explore` on it

## Session End

When wrapping up, update `docs/TASKS.md`:
- Mark completed tasks `[x]`
- Change started-but-not-finished to `[~]`
- Move newly completed items to the Done section
- Update the `_Last touched:` date at the top

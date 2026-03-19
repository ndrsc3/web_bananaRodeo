# /explore — Inquiry Session

If no argument is given, read `docs/explorations/` and list ideas that aren't yet `planned`, then ask which one to explore.

Otherwise, run the explore agent with `$ARGUMENTS` to get the orientation report. Once it returns, begin the inquiry:

1. Present the open questions from the report one at a time — don't front-load them all
2. Work through them conversationally; probe for what the experience should *feel* like, not just what it does
3. As questions get answered, update `docs/explorations/<name>.md`
4. Update `status` if the exploration has advanced

**If reaching `planned`:**
- Fill in the `## Plan` section in the exploration file
  - Inline steps if the feature is self-contained
  - Create `docs/plans/<name>.md` and link from the exploration if it's complex
- Add tasks to `docs/TASKS.md` under P3
- Update status to `planned`

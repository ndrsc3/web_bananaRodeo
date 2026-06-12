#!/usr/bin/env bash
# Create a feature worktree with everything needed to run `npx vercel dev`:
# branch + folder, node_modules symlink, and a copy of the Vercel project
# link (.vercel/ — gitignored, so fresh worktrees don't have it).
#
# Usage: scripts/new-worktree.sh <branch-name> [base-ref]
#   scripts/new-worktree.sh falling-bananas      → feature/falling-bananas
#   scripts/new-worktree.sh fix/auth-redirect    → fix/auth-redirect
#   base-ref defaults to origin/development
set -euo pipefail

NAME="${1:?usage: scripts/new-worktree.sh <branch-name> [base-ref]}"
BASE="${2:-origin/development}"

# Bare names get the feature/ prefix; full prefixed names pass through.
case "$NAME" in
    feature/*|fix/*|chore/*) BRANCH="$NAME" ;;
    */*) echo "error: unknown branch prefix '${NAME%%/*}' (use feature/, fix/, or chore/)" >&2; exit 1 ;;
    *) BRANCH="feature/$NAME" ;;
esac

REPO_ROOT="$(git rev-parse --show-toplevel)"
PARENT="$(dirname "$REPO_ROOT")"
MAIN="$PARENT/web_bananaRodeo"   # the primary checkout, source for node_modules + .vercel
DIR="$PARENT/web_bananaRodeo-${BRANCH#*/}"

[ -e "$DIR" ] && { echo "error: $DIR already exists" >&2; exit 1; }

git -C "$REPO_ROOT" fetch origin
git -C "$REPO_ROOT" worktree add -b "$BRANCH" "$DIR" "$BASE"

# node_modules: symlink into the main checkout's install. The symlink isn't
# matched by .gitignore's `node_modules/` (dir pattern), so keep it out of
# git via the shared exclude file.
ln -s "$MAIN/node_modules" "$DIR/node_modules"
EXCLUDE="$(git -C "$REPO_ROOT" rev-parse --path-format=absolute --git-common-dir)/info/exclude"
grep -qx "node_modules" "$EXCLUDE" 2>/dev/null || echo "node_modules" >> "$EXCLUDE"

# Vercel project link + cached dev env. Copy, don't symlink — vercel writes
# build cache into .vercel/, and concurrent dev servers shouldn't share it.
if [ -d "$MAIN/.vercel" ]; then
    cp -R "$MAIN/.vercel" "$DIR/.vercel"
else
    echo "warn: $MAIN/.vercel not found — run 'npx vercel link' in the new worktree before 'vercel dev'" >&2
fi

echo
echo "Worktree ready: $DIR  (branch $BRANCH from $BASE)"
echo "  cd $DIR"
echo "  npx vercel dev    # use --listen 3001 if another dev server holds port 3000"

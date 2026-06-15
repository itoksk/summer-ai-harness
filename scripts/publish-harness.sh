#!/usr/bin/env bash
# Publish this harness to a DEDICATED PUBLIC GitHub TEMPLATE repo that students
# copy with "Use this template". The contents of study-harness/ become the repo
# root (unlike summer-ai-materials, which nests under materials/).
#
# Source of truth: summer-ai/study-harness/ (in the private summer-ai repo).
# Published copy: itoksk/summer-ai-harness  (public, marked as a template)
#
# Run as the itoksk GitHub account:
#   gh auth switch --user itoksk        # if needed
#   bash study-harness/scripts/publish-harness.sh
#
# Re-running updates the public repo with the latest harness.
set -euo pipefail

OWNER="itoksk"
REPO="summer-ai-harness"
BRANCH="main"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Harness source: $SRC_DIR"
command -v gh >/dev/null || { echo "ERROR: gh CLI not found"; exit 1; }
echo "Active GitHub account:"; gh auth status 2>&1 | grep -i "active account" | head -1 || true

# Stage a clean copy with the harness at the repo root (exclude build/runtime dirs).
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
( cd "$SRC_DIR" && find . \
    -path './node_modules' -prune -o \
    -path './public' -prune -o \
    -path './.git' -prune -o \
    -name '.DS_Store' -prune -o \
    -type f -print | while read -r f; do
      mkdir -p "$TMP/$(dirname "$f")"
      cp "$f" "$TMP/$f"
    done )

cd "$TMP"
git init -q -b "$BRANCH"
git add .
git commit -q -m "Publish AI course thinking harness (template)"

if gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
  echo "Repo exists — pushing update to $OWNER/$REPO"
  git remote add origin "https://github.com/$OWNER/$REPO.git"
  git push -f origin "$BRANCH"
else
  echo "Creating public repo $OWNER/$REPO and pushing"
  gh repo create "$OWNER/$REPO" --public --source=. --remote=origin --push \
    --description "Per-day thinking-process harness for the AI course — Use this template / 1日単位の思考プロセス記録ハーネス"
fi

# Mark it as a template repository so students get the "Use this template" button.
gh repo edit "$OWNER/$REPO" --template >/dev/null
echo "Marked $OWNER/$REPO as a template repository."

# Sync the issue labels onto the canonical repo (so it is a working example).
# We are still in $TMP, whose git origin points at $OWNER/$REPO and which holds a
# copy of config/labels.json, so sync-labels.mjs targets the right repo.
echo "Syncing labels on $OWNER/$REPO ..."
node "$TMP/scripts/sync-labels.mjs" || echo "WARN: label sync failed (run 'npm run sync-labels' later)."

# Enable GitHub Pages with the GitHub Actions build type (idempotent).
if gh api "repos/$OWNER/$REPO/pages" >/dev/null 2>&1; then
  echo "Pages already enabled."
else
  gh api -X POST "repos/$OWNER/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 \
    && echo "Enabled GitHub Pages (GitHub Actions source)." \
    || echo "WARN: could not enable Pages via API — set Settings > Pages > Source: GitHub Actions."
fi

echo
echo "Done. Template ready:  https://github.com/$OWNER/$REPO  ->  Use this template"

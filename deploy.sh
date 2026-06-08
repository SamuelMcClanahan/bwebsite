#!/usr/bin/env bash
#
# deploy.sh — build, commit, and push the site so Vercel auto-deploys it.
#
# Usage:
#   ./deploy.sh "your commit message"
#   ./deploy.sh                      (uses a default message)
#
# What it does:
#   1. Runs a local production build to catch errors BEFORE pushing.
#   2. If the build passes, stages everything, commits, and pushes to GitHub.
#   3. Vercel sees the push and deploys the live site (~1 min).
#
set -e

# Always run from the repo root (the folder this script lives in).
cd "$(dirname "$0")"

MSG="${*:-update site}"

echo "==> Building locally (samuel.m) to catch errors first..."
( cd samuel.m && npm run build )

echo "==> Build OK. Staging changes..."
git add -A

if git diff --cached --quiet; then
  echo "==> Nothing to commit. Working tree is clean — nothing to deploy."
  exit 0
fi

echo "==> Committing: \"$MSG\""
git commit -m "$MSG"

echo "==> Pushing to GitHub..."
git push

echo ""
echo "✅ Pushed. Vercel will build and deploy automatically in ~1 minute."
echo "   Watch progress at: https://vercel.com  (your project → Deployments)"

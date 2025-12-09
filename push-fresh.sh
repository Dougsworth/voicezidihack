#!/bin/bash
# Workaround script to push when Git pack-objects fails
# This creates a fresh clone and pushes from there

set -e

REPO_DIR="/Users/douglasbyfield/Documents/Programming/voice-gig-connect"
TEMP_DIR="/tmp/voice-gig-connect-push-$$"

echo "Creating temporary clone..."
cd /tmp
rm -rf "$TEMP_DIR"
git clone https://github.com/Dougsworth/voice-gig-connect.git "$TEMP_DIR"
cd "$TEMP_DIR"

echo "Fetching commits from original repo..."
cd "$REPO_DIR"
git bundle create /tmp/commits.bundle HEAD~3..HEAD 2>/dev/null || {
    echo "Bundle failed, trying to copy commits manually..."
    COMMITS=$(git log --oneline origin/main..HEAD | awk '{print $1}')
    cd "$TEMP_DIR"
    for commit in $COMMITS; do
        git cherry-pick "$commit" 2>/dev/null || echo "Skipping $commit"
    done
    cd "$REPO_DIR"
    exit 0
}

cd "$TEMP_DIR"
git pull /tmp/commits.bundle 2>/dev/null || {
    echo "Pulling bundle failed, will copy files instead..."
    cd "$REPO_DIR"
    rsync -av --exclude='.git' --exclude='node_modules' . "$TEMP_DIR/"
    cd "$TEMP_DIR"
    git add .
    git commit -m "Updates from local repo" || true
}

echo "Pushing to GitHub..."
git push origin main

echo "Cleaning up..."
rm -rf "$TEMP_DIR"
rm -f /tmp/commits.bundle

echo "✓ Push complete!"


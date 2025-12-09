#!/bin/bash
# Manual push workaround - copies files to fresh clone

REPO_DIR="/Users/douglasbyfield/Documents/Programming/voice-gig-connect"
TEMP_DIR="/tmp/voice-gig-push-$$"

echo "Step 1: Creating fresh clone..."
cd /tmp
rm -rf "$TEMP_DIR"
git clone https://github.com/Dougsworth/voicezidihack.git "$TEMP_DIR"
cd "$TEMP_DIR"

echo "Step 2: Copying all files (excluding .git and node_modules)..."
cd "$REPO_DIR"
rsync -av --exclude='.git' --exclude='node_modules' --exclude='.DS_Store' \
    --exclude='dist' --exclude='build' \
    . "$TEMP_DIR/"

echo "Step 3: Committing changes..."
cd "$TEMP_DIR"
git add .
git commit -m "Update: Voice Gig Connect with ASR features" || echo "No changes to commit"

echo "Step 4: Pushing to GitHub..."
git push origin main

echo "Step 5: Cleaning up..."
cd "$REPO_DIR"
rm -rf "$TEMP_DIR"

echo ""
echo "✓ Done! Your changes have been pushed."
echo "Note: You may want to reset your local repo:"
echo "  git fetch origin"
echo "  git reset --hard origin/main"


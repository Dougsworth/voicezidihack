#!/bin/bash
# Safe git commit workaround for bus error issue

MESSAGE="$1"
if [ -z "$MESSAGE" ]; then
    echo "Usage: $0 \"commit message\""
    exit 1
fi

TREE=$(git write-tree)
if [ -z "$TREE" ]; then
    echo "Error: No changes to commit"
    exit 1
fi

# Check if HEAD exists
if git rev-parse --verify HEAD >/dev/null 2>&1; then
    # Normal commit with parent
    COMMIT=$(git commit-tree -m "$MESSAGE" -p HEAD $TREE)
else
    # Initial commit (no parent)
    COMMIT=$(git commit-tree -m "$MESSAGE" $TREE)
fi

git update-ref HEAD $COMMIT
echo "✓ Commit created: $COMMIT"
echo "  Message: $MESSAGE"


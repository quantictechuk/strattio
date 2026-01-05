# Git Workflow Guide - Multi-Device Development

This guide helps you develop the Strattio project simultaneously from multiple devices (e.g., MacBook and Mac Studio) without conflicts.

## 🚀 Quick Start

### First Time Setup (On Each Device)

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd strattio
   ```

2. **Verify your connection**:
   ```bash
   git remote -v
   git status
   ```

## 📋 Daily Workflow

### Before Starting Work (ALWAYS DO THIS FIRST)

```bash
git pull
```

This ensures you have the latest changes from your other device or team members.

### After Finishing Work

```bash
# Check what changed
git status

# Add your changes
git add .

# Commit with a descriptive message
git commit -m "Description of your changes"

# Push to remote
git push
```

## 🔄 Complete Workflow Example

### Device 1 (MacBook)
```bash
# Morning: Start fresh
git pull                    # Get latest changes
# ... make your changes ...
git add .
git commit -m "Added new dashboard feature"
git push                    # Share your work
```

### Device 2 (Mac Studio)
```bash
# Afternoon: Continue work
git pull                    # Get changes from MacBook
# ... make your changes ...
git add .
git commit -m "Fixed authentication bug"
git push                    # Share your work
```

## 🛠️ Common Scenarios

### Scenario 1: Untracked Files Blocking Pull

**Error:** `error: The following untracked working tree files would be overwritten by merge`

**Solution:**
```bash
# Option 1: Move the file temporarily
mv filename.ext filename.ext.backup
git pull
# Compare files if needed, then delete backup

# Option 2: Remove if not needed
rm filename.ext
git pull
```

### Scenario 2: Uncommitted Changes When Pulling

**If you have uncommitted changes and need to pull:**

```bash
# Save your work temporarily
git stash

# Pull latest changes
git pull

# Reapply your changes
git stash pop
```

### Scenario 3: Merge Conflicts

**If you get merge conflicts:**

```bash
# Git will show conflicted files
git status

# Open conflicted files and resolve conflicts
# Look for <<<<<<< HEAD markers

# After resolving:
git add <resolved-files>
git commit
git push
```

### Scenario 4: Switching Devices Mid-Task

**If you need to switch devices before finishing:**

```bash
# On Device 1: Save your progress
git add .
git commit -m "WIP: Feature in progress"
git push

# On Device 2: Continue work
git pull
# ... continue working ...
git add .
git commit -m "Completed: Feature finished"
git push
```

## 🌿 Using Feature Branches (Recommended for Larger Features)

### Creating a Feature Branch

```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Make changes, commit, and push
git add .
git commit -m "Added new feature"
git push -u origin feature/new-feature
```

### Working on Feature Branch from Another Device

```bash
# Fetch all branches
git fetch

# Switch to the feature branch
git checkout feature/new-feature

# Continue work
git add .
git commit -m "More work on feature"
git push
```

### Merging Feature Branch

```bash
# Switch to main branch
git checkout main

# Pull latest main
git pull

# Merge feature branch
git merge feature/new-feature

# Push merged changes
git push
```

## 💡 Best Practices

### 1. **Pull Before You Start**
Always run `git pull` before making changes to ensure you're working with the latest code.

### 2. **Commit Frequently**
Make small, logical commits rather than one large commit at the end of the day.

### 3. **Write Descriptive Commit Messages**
```bash
# Good
git commit -m "Fix: Resolved authentication token expiration issue"

# Bad
git commit -m "fix"
```

### 4. **Check Status Regularly**
```bash
git status  # See what's changed before pulling/pushing
```

### 5. **Use Pull with Rebase (Optional)**
```bash
git pull --rebase  # Puts your commits on top of remote changes
```

## 🔍 Useful Commands

### Check Current Status
```bash
git status              # See what's changed
git log --oneline       # See recent commits
git branch              # See all branches
```

### View Differences
```bash
git diff                # See uncommitted changes
git diff HEAD           # See all changes since last commit
```

### Undo Changes
```bash
git checkout -- <file>  # Discard changes to a file
git reset HEAD <file>   # Unstage a file
```

## ⚠️ Troubleshooting

### "Your branch is behind 'origin/main'"
```bash
git pull  # This will update your branch
```

### "Your branch is ahead of 'origin/main'"
```bash
git push  # This will share your commits
```

### "Failed to push some refs"
```bash
# Someone else pushed changes, pull first
git pull
# Resolve any conflicts, then push again
git push
```

## 📝 Quick Reference Card

| Situation | Command |
|-----------|---------|
| Start work | `git pull` |
| Check status | `git status` |
| Stage changes | `git add .` |
| Commit | `git commit -m "message"` |
| Push | `git push` |
| Save work temporarily | `git stash` |
| Reapply stashed work | `git stash pop` |
| Create branch | `git checkout -b branch-name` |
| Switch branch | `git checkout branch-name` |

## 🎯 Golden Rules

1. ✅ **Always pull before starting work**
2. ✅ **Commit and push when finishing work**
3. ✅ **Write clear commit messages**
4. ✅ **Pull before pushing if you haven't pulled recently**
5. ✅ **Resolve conflicts immediately when they occur**

---

**Remember:** The key to smooth multi-device development is **pull before you start, push when you finish**!

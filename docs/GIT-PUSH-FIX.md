# Fix: failed to push some refs to GitHub

## Step 1: Commit your changes (if not done)

```bash
cd /Users/swift/finder   # or wherever your finder project is

git add .
git status              # verify what's staged
git commit -m "Initial commit: Finder app"
```

## Step 2: Pull remote changes first (if repo has existing content)

If the GitHub repo was created with a README or license, your histories differ. Pull and merge:

```bash
git pull origin main --allow-unrelated-histories
# Resolve any conflicts if prompted, then:
git push origin main
```

## Step 3: If Step 2 causes conflicts

```bash
# After resolving conflicts in the files:
git add .
git commit -m "Merge remote with local"
git push origin main
```

## Step 4: Alternative - force push (overwrites remote)

**Use only if you're sure the remote has nothing you need.**

```bash
git push -u origin main --force
```

## Common causes

| Error / situation          | Fix                                                |
|----------------------------|----------------------------------------------------|
| "failed to push some refs" | Remote has commits you don't have → pull first     |
| "Updates were rejected"   | Same as above → `git pull --allow-unrelated-histories` |
| "Permission denied"       | Check SSH key or use HTTPS with personal access token |
| "No commits yet"          | Run `git add .` and `git commit -m "msg"` first    |

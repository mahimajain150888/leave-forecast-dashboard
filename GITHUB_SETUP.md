# 📘 GitHub Repository Setup - Step by Step

This guide will walk you through creating a GitHub repository and pushing your Leave Forecast Dashboard code.

---

## 🎯 Prerequisites

- A GitHub account (create one at https://github.com if you don't have one)
- Git installed on your Mac (it should already be installed)

---

## 📝 Step-by-Step Instructions

### Step 1: Create a GitHub Account (if needed)

1. Go to https://github.com
2. Click "Sign up"
3. Follow the registration process
4. Verify your email address

### Step 2: Create a New Repository on GitHub

1. **Log in to GitHub** at https://github.com

2. **Click the "+" icon** in the top-right corner

3. **Select "New repository"**

4. **Fill in the repository details**:
   - **Repository name**: `leave-forecast-dashboard` (or any name you prefer)
   - **Description**: `Leave Forecast Dashboard with Monday.com integration`
   - **Visibility**: 
     - Choose **Private** if you want only invited people to see it
     - Choose **Public** if you want it visible to everyone
   - **DO NOT** check "Initialize this repository with a README"
   - **DO NOT** add .gitignore or license yet

5. **Click "Create repository"**

6. **Keep this page open** - you'll need the commands shown

### Step 3: Prepare Your Local Code

Open Terminal and run these commands:

```bash
# Navigate to your project directory
cd "/Users/mahimajain/Downloads/leave forecast/monday-dashboard"

# Check if git is already initialized
ls -la | grep .git
```

**If you see `.git` directory**, skip to Step 4.

**If you DON'T see `.git`**, initialize git:

```bash
# Initialize git repository
git init

# Check git status
git status
```

### Step 4: Create .gitignore File

Before committing, create a `.gitignore` file to exclude sensitive and unnecessary files:

```bash
# Create .gitignore file
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json

# Environment variables
.env
.env.local
.env.production

# Build outputs
dist/
build/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.temp
EOF

# Verify the file was created
cat .gitignore
```

### Step 5: Stage and Commit Your Code

```bash
# Add all files to git (except those in .gitignore)
git add .

# Check what will be committed
git status

# Commit the files
git commit -m "Initial commit: Leave Forecast Dashboard with auto-population feature"

# Verify the commit
git log --oneline
```

### Step 6: Connect to GitHub Repository

**Go back to your GitHub repository page** and copy the commands shown under "…or push an existing repository from the command line"

They should look like this (replace YOUR_USERNAME and YOUR_REPO):

```bash
# Add GitHub as remote origin
git remote add origin https://github.com/YOUR_USERNAME/leave-forecast-dashboard.git

# Rename branch to main (if needed)
git branch -M main

# Push code to GitHub
git push -u origin main
```

**Example with actual username:**
```bash
git remote add origin https://github.com/mahimajain/leave-forecast-dashboard.git
git branch -M main
git push -u origin main
```

### Step 7: Authenticate with GitHub

When you run `git push`, you'll be asked to authenticate:

**Option A: Using Personal Access Token (Recommended)**

1. GitHub will open a browser window
2. Click "Authorize" 
3. Or, create a Personal Access Token:
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Give it a name: "Leave Forecast Dashboard"
   - Select scopes: `repo` (all)
   - Click "Generate token"
   - **Copy the token** (you won't see it again!)
   - Use this token as your password when pushing

**Option B: Using GitHub CLI**

```bash
# Install GitHub CLI (if not installed)
brew install gh

# Authenticate
gh auth login

# Follow the prompts
```

### Step 8: Verify Upload

1. **Refresh your GitHub repository page**
2. You should see all your files uploaded
3. Check that `.env` file is **NOT** visible (it should be ignored)

---

## ✅ Verification Checklist

After completing the steps, verify:

- [ ] Repository created on GitHub
- [ ] Code pushed successfully
- [ ] `.env` file is NOT in the repository
- [ ] `node_modules/` folder is NOT in the repository
- [ ] All source code files are visible
- [ ] README.md is visible

---

## 🔄 Making Updates Later

When you make changes to your code:

```bash
# Navigate to project directory
cd "/Users/mahimajain/Downloads/leave forecast/monday-dashboard"

# Check what changed
git status

# Add changed files
git add .

# Commit with a message
git commit -m "Description of what you changed"

# Push to GitHub
git push
```

---

## 🐛 Troubleshooting

### Problem: "fatal: not a git repository"

**Solution:**
```bash
cd "/Users/mahimajain/Downloads/leave forecast/monday-dashboard"
git init
```

### Problem: "remote origin already exists"

**Solution:**
```bash
# Remove existing remote
git remote remove origin

# Add the correct remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

### Problem: "failed to push some refs"

**Solution:**
```bash
# Pull first, then push
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Problem: Authentication failed

**Solution:**
- Use Personal Access Token instead of password
- Or use GitHub CLI: `gh auth login`

### Problem: ".env file is visible on GitHub"

**Solution:**
```bash
# Remove .env from git tracking
git rm --cached backend/.env
git rm --cached frontend/.env

# Commit the removal
git commit -m "Remove .env files from tracking"

# Push
git push
```

---

## 🎉 Success!

Your code is now on GitHub! 

**Next Steps:**
1. ✅ Code is backed up on GitHub
2. ✅ Ready to deploy to Render/Heroku
3. ✅ Team members can access the code (if repository is public or they're invited)

**Repository URL Format:**
```
https://github.com/YOUR_USERNAME/leave-forecast-dashboard
```

---

## 📞 Need Help?

If you encounter issues:
1. Check the error message carefully
2. Review the troubleshooting section above
3. Search the error on Google
4. Ask on GitHub Community: https://github.community

---

## 🔐 Security Reminder

**NEVER commit these files:**
- ✅ `.env` (contains API tokens)
- ✅ `node_modules/` (too large, can be reinstalled)
- ✅ Personal information
- ✅ API keys or passwords

**Always use `.gitignore` to protect sensitive data!**
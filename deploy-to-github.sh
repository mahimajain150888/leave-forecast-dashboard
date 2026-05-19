#!/bin/bash

# Monday.com Vacation Dashboard - GitHub Deployment Script
# This script helps you quickly push your code to GitHub

echo "🚀 Monday.com Vacation Dashboard - GitHub Deployment"
echo "=================================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository already initialized"
fi

# Check if .env file exists and warn
if [ -f "backend/.env" ]; then
    echo ""
    echo "⚠️  WARNING: .env file detected!"
    echo "   Make sure it's in .gitignore (it should be)"
    echo "   Never commit your API tokens!"
    echo ""
fi

# Show current status
echo "📊 Current Git Status:"
git status --short

echo ""
echo "📝 Ready to commit and push to GitHub"
echo ""

# Ask for GitHub username
read -p "Enter your GitHub username: " github_username

if [ -z "$github_username" ]; then
    echo "❌ GitHub username is required"
    exit 1
fi

# Ask for repository name
read -p "Enter repository name (default: monday-vacation-dashboard): " repo_name
repo_name=${repo_name:-monday-vacation-dashboard}

echo ""
echo "🔍 Summary:"
echo "   GitHub Username: $github_username"
echo "   Repository Name: $repo_name"
echo "   Repository URL: https://github.com/$github_username/$repo_name"
echo ""

read -p "Continue? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

# Add all files
echo ""
echo "📦 Adding files to Git..."
git add .

# Commit
echo "💾 Creating commit..."
git commit -m "Initial commit: Monday.com Vacation Dashboard

Features:
- Employee name display (not IDs)
- Manager-based analytics and charts
- Forecast window (next 3 months) view
- Correct start/end date extraction
- Real-time Monday.com API integration
- Responsive dashboard with multiple views"

# Check if remote exists
if git remote | grep -q "origin"; then
    echo "🔄 Remote 'origin' already exists, updating..."
    git remote set-url origin "https://github.com/$github_username/$repo_name.git"
else
    echo "🔗 Adding remote 'origin'..."
    git remote add origin "https://github.com/$github_username/$repo_name.git"
fi

# Set main branch
git branch -M main

echo ""
echo "📤 Pushing to GitHub..."
echo "   If this is your first push, you may need to create the repository on GitHub first:"
echo "   👉 https://github.com/new"
echo ""

# Push
if git push -u origin main; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🎉 Your repository is now available at:"
    echo "   https://github.com/$github_username/$repo_name"
    echo ""
    echo "📚 Next Steps:"
    echo "   1. Review GITHUB_DEPLOYMENT.md for hosting options"
    echo "   2. Deploy backend to Render/Vercel/Heroku"
    echo "   3. Deploy frontend to Netlify/Vercel"
    echo "   4. Set environment variables on hosting platforms"
    echo ""
else
    echo ""
    echo "❌ Push failed. Common reasons:"
    echo "   1. Repository doesn't exist on GitHub yet"
    echo "      👉 Create it at: https://github.com/new"
    echo "   2. Authentication required"
    echo "      👉 Use GitHub CLI or Personal Access Token"
    echo "   3. Branch protection rules"
    echo ""
    echo "💡 Try creating the repository on GitHub first, then run this script again"
fi

# Made with Bob

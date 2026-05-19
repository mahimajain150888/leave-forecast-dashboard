#!/bin/bash

# 🚀 Deploy to Render - Quick Start Script
# This script helps you deploy your Leave Forecast Dashboard to Render

set -e  # Exit on error

echo "🚀 Leave Forecast Dashboard - Render Deployment Helper"
echo "======================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "backend/server.js" ]; then
    echo -e "${RED}❌ Error: Please run this script from the monday-dashboard directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Step 1: Create Public GitHub Repository${NC}"
echo "-------------------------------------------"
echo "1. Go to: https://github.com"
echo "2. Click 'New' to create a repository"
echo "3. Name: leave-forecast-dashboard"
echo "4. Make it PUBLIC (required for Render free tier)"
echo "5. DO NOT initialize with README"
echo ""
read -p "Have you created the repository? (y/n): " created_repo

if [ "$created_repo" != "y" ]; then
    echo -e "${RED}Please create the repository first, then run this script again.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📋 Step 2: Add Public GitHub Remote${NC}"
echo "-------------------------------------------"
read -p "Enter your GitHub username: " github_username
read -p "Enter your repository name (default: leave-forecast-dashboard): " repo_name
repo_name=${repo_name:-leave-forecast-dashboard}

PUBLIC_REPO_URL="https://github.com/$github_username/$repo_name.git"

echo ""
echo "Repository URL: $PUBLIC_REPO_URL"
echo ""

# Check if 'public' remote already exists
if git remote | grep -q "^public$"; then
    echo -e "${YELLOW}⚠️  'public' remote already exists. Removing it...${NC}"
    git remote remove public
fi

# Add public remote
echo "Adding public GitHub remote..."
git remote add public "$PUBLIC_REPO_URL"

# Verify
echo ""
echo "Current remotes:"
git remote -v
echo ""

echo -e "${YELLOW}📋 Step 3: Commit Latest Changes${NC}"
echo "-------------------------------------------"

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "Uncommitted changes found. Committing..."
    git add .
    git commit -m "Prepare for Render deployment"
    echo -e "${GREEN}✅ Changes committed${NC}"
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Step 4: Push to Public GitHub${NC}"
echo "-------------------------------------------"
echo "Pushing code to public GitHub..."
echo ""

if git push public main; then
    echo ""
    echo -e "${GREEN}✅ Successfully pushed to public GitHub!${NC}"
else
    echo ""
    echo -e "${RED}❌ Failed to push. You may need to authenticate.${NC}"
    echo "Try running: git push public main"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Code is now on public GitHub!${NC}"
echo ""
echo "Next Steps:"
echo "==========="
echo ""
echo "1. Go to: https://render.com"
echo "2. Sign up/Login with your GitHub account"
echo "3. Follow the detailed guide in: RENDER_DEPLOYMENT_STEPS.md"
echo ""
echo "Quick Summary:"
echo "-------------"
echo "• Deploy Backend:"
echo "  - Root Directory: backend"
echo "  - Build Command: npm install"
echo "  - Start Command: node server.js"
echo "  - Add environment variables (see RENDER_DEPLOYMENT_STEPS.md)"
echo ""
echo "• Deploy Frontend:"
echo "  - Root Directory: frontend"
echo "  - Build Command: npm install && npm run build"
echo "  - Start Command: npm run preview -- --host 0.0.0.0 --port \$PORT"
echo "  - Add VITE_API_URL with your backend URL"
echo ""
echo -e "${GREEN}✅ Ready for Render deployment!${NC}"
echo ""
echo "📖 For detailed instructions, see: RENDER_DEPLOYMENT_STEPS.md"

# Made with Bob

#!/bin/bash

# Leave Forecast Dashboard - Quick Deploy Script
# This script helps you deploy the application quickly

set -e

echo "🚀 Leave Forecast Dashboard - Deployment Helper"
echo "================================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Leave Forecast Dashboard"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

echo ""
echo "Choose your deployment option:"
echo "1. Deploy to Render (Free, Recommended)"
echo "2. Deploy to Heroku"
echo "3. Prepare for Company Server"
echo "4. Create GitHub repository"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📋 Render Deployment Steps:"
        echo "1. Create a GitHub repository and push this code"
        echo "2. Sign up at https://render.com"
        echo "3. Create a Web Service for backend:"
        echo "   - Root Directory: backend"
        echo "   - Build Command: npm install"
        echo "   - Start Command: node server.js"
        echo "4. Add environment variables (see DEPLOYMENT_GUIDE.md)"
        echo "5. Create a Web Service for frontend:"
        echo "   - Root Directory: frontend"
        echo "   - Build Command: npm install && npm run build"
        echo "   - Start Command: npm run preview -- --host 0.0.0.0 --port \$PORT"
        echo ""
        echo "📖 Full guide: See DEPLOYMENT_GUIDE.md"
        ;;
    2)
        echo ""
        echo "📋 Heroku Deployment:"
        echo "Installing Heroku CLI..."
        if ! command -v heroku &> /dev/null; then
            echo "Please install Heroku CLI first:"
            echo "brew tap heroku/brew && brew install heroku"
            exit 1
        fi
        
        echo "Logging in to Heroku..."
        heroku login
        
        echo ""
        echo "Creating backend app..."
        cd backend
        heroku create leave-forecast-backend-$(date +%s)
        
        echo "Setting environment variables..."
        read -p "Enter your MONDAY_API_TOKEN: " token
        heroku config:set MONDAY_API_TOKEN=$token
        heroku config:set MONDAY_BOARD_ID=18406509069
        heroku config:set MONDAY_MASTER_BOARD_ID=18407511613
        heroku config:set NODE_ENV=production
        
        echo "Deploying backend..."
        git init
        git add .
        git commit -m "Deploy backend"
        git push heroku main
        
        echo "✅ Backend deployed!"
        echo "Backend URL: $(heroku info -s | grep web_url | cut -d= -f2)"
        ;;
    3)
        echo ""
        echo "📦 Preparing for company server deployment..."
        cd ..
        zip -r leave-forecast-app.zip monday-dashboard/ -x "*/node_modules/*" "*/.git/*"
        echo "✅ Created leave-forecast-app.zip"
        echo ""
        echo "Next steps:"
        echo "1. Transfer leave-forecast-app.zip to your server"
        echo "2. Follow 'Option 3' in DEPLOYMENT_GUIDE.md"
        ;;
    4)
        echo ""
        echo "📋 GitHub Repository Setup:"
        echo ""
        read -p "Enter your GitHub username: " username
        read -p "Enter repository name (leave-forecast-dashboard): " reponame
        reponame=${reponame:-leave-forecast-dashboard}
        
        echo ""
        echo "1. Create a new repository on GitHub:"
        echo "   https://github.com/new"
        echo ""
        echo "2. Run these commands:"
        echo "   git remote add origin https://github.com/$username/$reponame.git"
        echo "   git branch -M main"
        echo "   git push -u origin main"
        echo ""
        echo "3. Then proceed with Render or Heroku deployment"
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment preparation complete!"
echo "📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md"

# Made with Bob

# 🚀 Manual Deployment Commands

Copy and paste these commands one by one into your terminal.

---

## Step 1: First, create your GitHub repository

1. Go to: https://github.com
2. Click "New" button
3. Repository name: `leave-forecast-dashboard`
4. Make it **PUBLIC**
5. **DO NOT** initialize with README
6. Click "Create repository"
7. **Copy the repository URL** (it will look like: `https://github.com/YOUR_USERNAME/leave-forecast-dashboard.git`)

---

## Step 2: Run these commands

**Replace `YOUR_USERNAME` with your actual GitHub username!**

```bash
# Navigate to project directory
cd "/Users/mahimajain/Downloads/leave forecast/monday-dashboard"

# Add public GitHub remote (REPLACE YOUR_USERNAME!)
git remote add public https://github.com/YOUR_USERNAME/leave-forecast-dashboard.git

# Verify remotes
git remote -v

# Add new files
git add .

# Commit changes
git commit -m "Prepare for Render deployment"

# Push to public GitHub (REPLACE YOUR_USERNAME!)
git push public main
```

---

## Step 3: If you get authentication error

If GitHub asks for credentials, you may need a Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "Render Deploy"
4. Check: `repo` (all repo permissions)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. When prompted for password, paste the token instead

---

## Step 4: Deploy to Render

1. Go to: https://render.com
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your `leave-forecast-dashboard` repository

### Backend Configuration:
```
Name: leave-forecast-backend
Root Directory: backend
Build Command: npm install
Start Command: node server.js
Environment Variables:
  NODE_ENV=production
  MONDAY_API_TOKEN=[your_monday_token]
  MONDAY_BOARD_ID=18406509069
  MONDAY_MASTER_BOARD_ID=18407511613
  CACHE_TTL=300
```

5. Click "Create Web Service"
6. Wait for deployment (2-3 minutes)
7. **Copy the backend URL** (e.g., `https://leave-forecast-backend.onrender.com`)

### Frontend Configuration:
```
Name: leave-forecast-frontend
Root Directory: frontend
Build Command: npm install && npm run build
Start Command: npm run preview -- --host 0.0.0.0 --port $PORT
Environment Variables:
  VITE_API_URL=[your_backend_url_from_above]
```

8. Click "Create Web Service"
9. Wait for deployment (2-3 minutes)
10. **Copy the frontend URL** - this is your app!

---

## ✅ Done!

Your app should now be live at the frontend URL!

Share it with your team: `https://leave-forecast-frontend.onrender.com` (or whatever URL Render gives you)
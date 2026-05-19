# 🚀 Deploy to Render - Step by Step Guide

Since you're using IBM GitHub Enterprise, follow these steps to deploy to Render.

---

## 📋 Prerequisites

- ✅ IBM GitHub repo: `https://github.ibm.com/mahima-jain/leave-forecast-dashboard.git`
- ✅ App running locally (Backend: 3001, Frontend: 5173)
- 🔲 Personal GitHub account (for public mirror)
- 🔲 Render account (free)

---

## 🎯 Deployment Strategy

**Problem**: Render cannot access IBM's internal GitHub  
**Solution**: Create a public GitHub mirror (without sensitive data)

---

## Step 1: Create Public GitHub Repository

### 1.1 Go to GitHub.com
- Visit: https://github.com
- Login with your **personal** GitHub account (not IBM)

### 1.2 Create New Repository
- Click **"New"** button (green button, top right)
- Repository name: `leave-forecast-dashboard`
- Description: `Monday.com Leave Forecast Dashboard`
- Choose: **Public** (Render free tier requires public repos)
- ❌ **DO NOT** initialize with README (we'll push existing code)
- Click **"Create repository"**

### 1.3 Copy the Repository URL
You'll see something like:
```
https://github.com/YOUR_USERNAME/leave-forecast-dashboard.git
```
**Save this URL** - you'll need it in Step 2!

---

## Step 2: Push Code to Public GitHub

### 2.1 Add Public GitHub as Remote

```bash
cd "/Users/mahimajain/Downloads/leave forecast/monday-dashboard"

# Add public GitHub as a second remote (named 'public')
git remote add public https://github.com/YOUR_USERNAME/leave-forecast-dashboard.git

# Verify both remotes exist
git remote -v
```

You should see:
```
origin  https://github.ibm.com/mahima-jain/leave-forecast-dashboard.git (fetch)
origin  https://github.ibm.com/mahima-jain/leave-forecast-dashboard.git (push)
public  https://github.com/YOUR_USERNAME/leave-forecast-dashboard.git (fetch)
public  https://github.com/YOUR_USERNAME/leave-forecast-dashboard.git (push)
```

### 2.2 Commit Latest Changes

```bash
# Add the new documentation file
git add IBM_GITHUB_RENDER_SETUP.md

# Commit
git commit -m "Add deployment documentation"
```

### 2.3 Push to Public GitHub

```bash
# Push to public GitHub
git push public main
```

**Note**: You may be prompted for GitHub credentials. Use your personal GitHub username and password (or personal access token).

### 2.4 Verify on GitHub
- Go to: `https://github.com/YOUR_USERNAME/leave-forecast-dashboard`
- You should see all your code!
- ✅ Check that `.env` file is **NOT** visible (it's in .gitignore)

---

## Step 3: Deploy Backend to Render

### 3.1 Create Render Account
- Go to: https://render.com
- Click **"Get Started"**
- Sign up with GitHub (use your personal GitHub account)
- Authorize Render to access your repositories

### 3.2 Create Backend Web Service

1. **Click "New +"** → **"Web Service"**

2. **Connect Repository**:
   - Select: `leave-forecast-dashboard`
   - Click **"Connect"**

3. **Configure Service**:
   ```
   Name: leave-forecast-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   Instance Type: Free
   ```

4. **Add Environment Variables**:
   Click **"Advanced"** → **"Add Environment Variable"**
   
   Add these variables:
   ```
   NODE_ENV = production
   PORT = 3001
   MONDAY_API_TOKEN = [your_actual_monday_token]
   MONDAY_BOARD_ID = 18406509069
   MONDAY_MASTER_BOARD_ID = 18407511613
   CACHE_TTL = 300
   ```

   **⚠️ IMPORTANT**: Replace `[your_actual_monday_token]` with your real Monday.com API token!

5. **Click "Create Web Service"**

6. **Wait for Deployment** (2-3 minutes)
   - You'll see build logs
   - Wait for "Live" status
   - Copy the backend URL (e.g., `https://leave-forecast-backend.onrender.com`)

---

## Step 4: Deploy Frontend to Render

### 4.1 Create Frontend Web Service

1. **Click "New +"** → **"Web Service"**

2. **Connect Repository**:
   - Select: `leave-forecast-dashboard` (same repo)
   - Click **"Connect"**

3. **Configure Service**:
   ```
   Name: leave-forecast-frontend
   Region: Oregon (US West)
   Branch: main
   Root Directory: frontend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm run preview -- --host 0.0.0.0 --port $PORT
   Instance Type: Free
   ```

4. **Add Environment Variables**:
   ```
   VITE_API_URL = https://leave-forecast-backend.onrender.com
   ```
   
   **⚠️ IMPORTANT**: Use the actual backend URL from Step 3.6!

5. **Click "Create Web Service"**

6. **Wait for Deployment** (2-3 minutes)
   - Copy the frontend URL (e.g., `https://leave-forecast-frontend.onrender.com`)

---

## Step 5: Update CORS Settings

### 5.1 Update Backend CORS

Since your frontend is now on a different domain, update CORS:

1. Go to Render Dashboard → **Backend Service**
2. Click **"Environment"** tab
3. Add new environment variable:
   ```
   FRONTEND_URL = https://leave-forecast-frontend.onrender.com
   ```

4. Update `backend/server.js` CORS configuration:

```javascript
// Update CORS to use environment variable
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
};

app.use(cors(corsOptions));
```

5. Commit and push changes:
```bash
cd "/Users/mahimajain/Downloads/leave forecast/monday-dashboard"
git add backend/server.js
git commit -m "Update CORS for production"
git push public main
```

6. Render will auto-deploy the changes

---

## Step 6: Test Your Deployed App

### 6.1 Open Frontend URL
- Go to: `https://leave-forecast-frontend.onrender.com`
- You should see the dashboard!

### 6.2 Test Features
- ✅ Dashboard loads with data
- ✅ Filters work
- ✅ Leave form submission works
- ✅ Employee lookup works
- ✅ Excel export works

### 6.3 Check Backend Health
- Go to: `https://leave-forecast-backend.onrender.com/health`
- Should return: `{"status": "ok"}`

---

## Step 7: Share with Team

### 7.1 Get Your App URL
```
Frontend: https://leave-forecast-frontend.onrender.com
```

### 7.2 Share with Team
Send this message to your team:

```
🎉 Leave Forecast Dashboard is now live!

📊 Dashboard: https://leave-forecast-frontend.onrender.com

Features:
✅ View all leave forecasts
✅ Filter by employee, manager, project, dates
✅ Submit new leave requests
✅ Auto-populate employee details
✅ Export to Excel
✅ Real-time data from Monday.com

Note: First load may take 30-60 seconds (free tier cold start)
```

---

## 🔧 Troubleshooting

### Issue: "Service Unavailable"
**Cause**: Free tier services sleep after 15 minutes of inactivity  
**Solution**: Wait 30-60 seconds for service to wake up

### Issue: "CORS Error"
**Cause**: Frontend URL not in CORS whitelist  
**Solution**: Check Step 5 - Update CORS settings

### Issue: "API Token Invalid"
**Cause**: Monday.com API token not set correctly  
**Solution**: 
1. Go to Render Dashboard → Backend Service
2. Environment tab
3. Update `MONDAY_API_TOKEN` value

### Issue: Backend Not Loading Data
**Cause**: Board IDs incorrect  
**Solution**: Verify environment variables:
- `MONDAY_BOARD_ID = 18406509069`
- `MONDAY_MASTER_BOARD_ID = 18407511613`

---

## 🔄 Updating Your App

### When You Make Code Changes:

```bash
cd "/Users/mahimajain/Downloads/leave forecast/monday-dashboard"

# Make your changes...

# Commit changes
git add .
git commit -m "Description of changes"

# Push to IBM GitHub (for backup)
git push origin main

# Push to public GitHub (triggers Render deployment)
git push public main
```

Render will automatically detect the push and redeploy! ⚡

---

## 💰 Cost

**Current Setup**: **FREE** ✅
- Render Free Tier: 750 hours/month
- Both services combined: ~1440 hours/month needed
- **Limitation**: Services sleep after 15 minutes of inactivity

**To Avoid Sleep** (Optional):
- Upgrade to Render Starter ($7/month per service)
- Or use a free uptime monitor (e.g., UptimeRobot) to ping every 10 minutes

---

## 🔐 Security Checklist

Before sharing with team, verify:

- ✅ `.env` file is in `.gitignore`
- ✅ No API tokens in code
- ✅ All secrets in Render environment variables
- ✅ Public GitHub repo has no sensitive data
- ✅ CORS configured correctly

---

## 📞 Need Help?

**Render Issues**:
- Render Docs: https://render.com/docs
- Render Support: https://render.com/support

**App Issues**:
- Check Render logs: Dashboard → Service → Logs tab
- Check browser console: F12 → Console tab

---

## ✅ Success Checklist

- [ ] Public GitHub repo created
- [ ] Code pushed to public GitHub
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Render
- [ ] Environment variables configured
- [ ] CORS updated
- [ ] App tested and working
- [ ] URL shared with team

---

## 🎉 You're Done!

Your Leave Forecast Dashboard is now live and accessible to your team!

**Next Steps**:
1. Monitor usage in Render dashboard
2. Consider upgrading if services sleep too often
3. Keep IBM GitHub as source of truth
4. Push to public GitHub for deployments
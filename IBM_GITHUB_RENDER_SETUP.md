# 🔐 Connecting Render with IBM GitHub Enterprise

This guide explains how to deploy from IBM's internal GitHub to Render.

---

## 🎯 The Challenge

IBM uses **GitHub Enterprise** (internal GitHub), which Render cannot directly access because:
- It's behind IBM's firewall
- Render's GitHub integration only works with public GitHub.com

---

## ✅ Solution: Deploy Without GitHub Integration

You have **2 options** to deploy to Render:

### Option 1: Manual Deploy (Recommended for IBM)

Deploy directly from your local machine without GitHub.

### Option 2: Mirror to Public GitHub

Create a public GitHub repo as a mirror (if allowed by IBM policy).

---

## 📋 Option 1: Manual Deploy to Render (Recommended)

### Step 1: Install Render CLI

```bash
# Install Render CLI
npm install -g @render/cli

# Or using curl
curl -fsSL https://render.com/install-cli.sh | bash
```

### Step 2: Login to Render

```bash
# Login to Render
render login
```

This will open a browser window to authenticate.

### Step 3: Create render.yaml Configuration

Create a file `render.yaml` in your project root:

```bash
cd "/Users/mahimajain/Downloads/leave forecast/monday-dashboard"

cat > render.yaml << 'EOF'
services:
  # Backend Service
  - type: web
    name: leave-forecast-backend
    env: node
    region: oregon
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONDAY_API_TOKEN
        sync: false
      - key: MONDAY_BOARD_ID
        value: 18406509069
      - key: MONDAY_MASTER_BOARD_ID
        value: 18407511613
      - key: PORT
        value: 3001
      - key: CACHE_TTL
        value: 300

  # Frontend Service
  - type: web
    name: leave-forecast-frontend
    env: node
    region: oregon
    plan: free
    buildCommand: cd frontend && npm install && npm run build
    startCommand: cd frontend && npm run preview -- --host 0.0.0.0 --port $PORT
    envVars:
      - key: VITE_API_URL
        sync: false
EOF
```

### Step 4: Deploy Using Render CLI

```bash
# Deploy both services
render deploy

# Or deploy individually
render deploy --service leave-forecast-backend
render deploy --service leave-forecast-frontend
```

### Step 5: Set Environment Variables

After deployment, set sensitive variables via Render Dashboard:

1. Go to https://dashboard.render.com
2. Select your backend service
3. Go to "Environment" tab
4. Add:
   - `MONDAY_API_TOKEN`: your_actual_token
5. Select your frontend service
6. Add:
   - `VITE_API_URL`: https://your-backend-url.onrender.com

---

## 📋 Option 2: Deploy via Render Dashboard (No Git)

If Render CLI doesn't work, use the dashboard:

### Step 1: Create a ZIP File

```bash
cd "/Users/mahimajain/Downloads/leave forecast"

# Create deployment package (excludes node_modules)
zip -r leave-forecast-deploy.zip monday-dashboard/ \
  -x "*/node_modules/*" \
  -x "*/.git/*" \
  -x "*/dist/*" \
  -x "*/.env"

echo "✅ Created: leave-forecast-deploy.zip"
```

### Step 2: Deploy Backend

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Web Service"**
3. **Select "Deploy an existing image or use a Dockerfile"**
4. **Or choose "Public Git repository"** and use a temporary public repo

**Alternative: Use Render's Manual Deploy**

Since Render requires Git, you'll need to either:
- Use Render CLI (Option 1)
- Create a public GitHub mirror (Option 3)
- Use alternative hosting (Option 4)

---

## 📋 Option 3: Mirror to Public GitHub (If Allowed)

If IBM policy allows, create a public mirror:

### Step 1: Create Public GitHub Repository

1. Go to https://github.com (personal account)
2. Create new repository: `leave-forecast-dashboard`
3. Make it **Public** or **Private** (your choice)

### Step 2: Push to Public GitHub

```bash
cd "/Users/mahimajain/Downloads/leave forecast/monday-dashboard"

# Add public GitHub as a second remote
git remote add public https://github.com/YOUR_PERSONAL_USERNAME/leave-forecast-dashboard.git

# Push to public GitHub
git push public main
```

### Step 3: Deploy from Public GitHub

Now follow the standard Render deployment:
1. Connect Render to your personal GitHub
2. Select the public repository
3. Deploy as normal

**⚠️ Important**: Don't include `.env` files or sensitive data!

---

## 📋 Option 4: Alternative Hosting (If Render Doesn't Work)

### A. Heroku (Works with Manual Deploy)

```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create and deploy backend
cd backend
heroku create leave-forecast-backend
git init
git add .
git commit -m "Deploy"
git push heroku main

# Set environment variables
heroku config:set MONDAY_API_TOKEN=your_token
heroku config:set MONDAY_BOARD_ID=18406509069
```

### B. IBM Cloud (Recommended for IBM Employees)

Since you're at IBM, consider using **IBM Cloud**:

1. **IBM Cloud Foundry**:
   ```bash
   # Install IBM Cloud CLI
   curl -fsSL https://clis.cloud.ibm.com/install/osx | sh
   
   # Login
   ibmcloud login --sso
   
   # Deploy
   ibmcloud cf push leave-forecast-backend
   ```

2. **IBM Cloud Code Engine**:
   - Supports containerized apps
   - Can deploy from local code
   - Free tier available

### C. Vercel (Easy Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel

# Deploy backend
cd ../backend
vercel
```

---

## 🔐 Security Considerations for IBM

### DO NOT:
- ❌ Commit `.env` files
- ❌ Include IBM credentials in public repos
- ❌ Share API tokens publicly
- ❌ Violate IBM's code sharing policy

### DO:
- ✅ Use environment variables
- ✅ Keep sensitive data in Render/Heroku config
- ✅ Follow IBM's security guidelines
- ✅ Use private repositories when possible

---

## 📞 Recommended Approach for IBM

**Best Option**: Use **IBM Cloud** or **Heroku** with manual deploy

1. **IBM Cloud** (if you have access):
   - Internal to IBM
   - Secure
   - Compliant with IBM policies

2. **Heroku** (public but secure):
   - Manual deploy (no GitHub needed)
   - Environment variables protected
   - Free tier available

3. **Render with CLI**:
   - Deploy from local machine
   - No GitHub integration needed

---

## 🎯 Quick Start: Heroku Manual Deploy

```bash
# 1. Install Heroku CLI
brew tap heroku/brew && brew install heroku

# 2. Login
heroku login

# 3. Deploy Backend
cd "/Users/mahimajain/Downloads/leave forecast/monday-dashboard/backend"
heroku create leave-forecast-backend-$(date +%s)
echo "web: node server.js" > Procfile
git init
git add .
git commit -m "Deploy backend"
git push heroku main

# 4. Set environment variables
heroku config:set MONDAY_API_TOKEN=your_token
heroku config:set MONDAY_BOARD_ID=18406509069
heroku config:set MONDAY_MASTER_BOARD_ID=18407511613

# 5. Get backend URL
heroku info -s | grep web_url

# 6. Deploy Frontend (similar process)
cd ../frontend
heroku create leave-forecast-frontend-$(date +%s)
heroku config:set VITE_API_URL=your_backend_url
# ... repeat deploy steps
```

---

## ✅ Summary

**For IBM GitHub Enterprise → Render:**
- ❌ Direct integration not possible
- ✅ Use Render CLI for manual deploy
- ✅ Or mirror to public GitHub (if allowed)
- ✅ Or use Heroku/IBM Cloud instead

**Recommended**: Use **Heroku** or **IBM Cloud** for easier deployment from IBM environment.

---

## 📞 Need Help?

Contact your IBM IT team about:
- IBM Cloud access
- Code deployment policies
- Approved hosting platforms
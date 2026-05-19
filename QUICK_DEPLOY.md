# ⚡ Quick Deploy to Render

## 🎯 Two Ways to Deploy

### Option A: Automated Script (Recommended)

```bash
cd "/Users/mahimajain/Downloads/leave forecast/monday-dashboard"
./deploy-to-render.sh
```

This script will:
1. Help you add public GitHub remote
2. Commit and push your code
3. Give you next steps for Render

### Option B: Manual Steps

```bash
# 1. Create public GitHub repo at https://github.com
#    Name: leave-forecast-dashboard
#    Make it PUBLIC

# 2. Add public remote
cd "/Users/mahimajain/Downloads/leave forecast/monday-dashboard"
git remote add public https://github.com/YOUR_USERNAME/leave-forecast-dashboard.git

# 3. Push code
git add .
git commit -m "Deploy to Render"
git push public main

# 4. Go to https://render.com and deploy
```

---

## 📋 Render Configuration

### Backend Service
```
Name: leave-forecast-backend
Root Directory: backend
Build Command: npm install
Start Command: node server.js
Environment Variables:
  NODE_ENV=production
  MONDAY_API_TOKEN=[your_token]
  MONDAY_BOARD_ID=18406509069
  MONDAY_MASTER_BOARD_ID=18407511613
  CACHE_TTL=300
```

### Frontend Service
```
Name: leave-forecast-frontend
Root Directory: frontend
Build Command: npm install && npm run build
Start Command: npm run preview -- --host 0.0.0.0 --port $PORT
Environment Variables:
  VITE_API_URL=[your_backend_url]
```

---

## 📖 Full Documentation

- **Step-by-Step Guide**: `RENDER_DEPLOYMENT_STEPS.md`
- **IBM GitHub Info**: `IBM_GITHUB_RENDER_SETUP.md`

---

## ⏱️ Estimated Time

- Setup: 5 minutes
- Backend Deploy: 3 minutes
- Frontend Deploy: 3 minutes
- **Total: ~15 minutes**

---

## 🆘 Need Help?

See `RENDER_DEPLOYMENT_STEPS.md` for detailed troubleshooting.
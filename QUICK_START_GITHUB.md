# 🚀 Quick Start: Deploy to GitHub

## Option 1: Use the Automated Script (Easiest)

```bash
cd monday-dashboard
./deploy-to-github.sh
```

The script will guide you through the process!

---

## Option 2: Manual Steps

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Name: `monday-vacation-dashboard`
3. **DO NOT** initialize with README
4. Click "Create repository"

### Step 2: Push Your Code

```bash
cd monday-dashboard

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Monday.com Vacation Dashboard"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/monday-vacation-dashboard.git

# Push
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Hosting

See `GITHUB_DEPLOYMENT.md` for detailed hosting options:
- **Render** (Recommended - Free tier)
- **Vercel** (Great for frontend)
- **Netlify** (Easy static hosting)
- **Heroku** (Full-stack option)

---

## 🔐 Important Security Notes

✅ **SAFE TO COMMIT:**
- All source code files
- `.env.example` (template only)
- Documentation files
- Configuration files

❌ **NEVER COMMIT:**
- `.env` file (contains API tokens)
- `node_modules/` folder
- Personal API keys or secrets

The `.gitignore` file is already configured to protect your secrets!

---

## 📦 What Gets Deployed

### Backend (`/backend`)
- Node.js/Express API server
- Monday.com API integration
- Analytics and data processing
- Caching layer

### Frontend (`/frontend`)
- React + Vite application
- Interactive dashboard
- Charts and visualizations
- Responsive design

---

## 🌐 After Deployment

1. **Backend URL**: `https://your-backend.onrender.com`
2. **Frontend URL**: `https://your-frontend.netlify.app`

Update frontend environment variable:
```
VITE_API_URL=https://your-backend.onrender.com
```

---

## 🆘 Need Help?

- **Detailed Guide**: See `GITHUB_DEPLOYMENT.md`
- **Setup Issues**: See `SETUP_GUIDE.md`
- **API Issues**: Check Monday.com API documentation

---

## ✅ Checklist

- [ ] Created GitHub repository
- [ ] Pushed code to GitHub
- [ ] Deployed backend (Render/Vercel/Heroku)
- [ ] Deployed frontend (Netlify/Vercel)
- [ ] Set environment variables on hosting platforms
- [ ] Updated frontend API URL
- [ ] Tested the live application
- [ ] Shared URL with team

---

**Ready to deploy?** Run `./deploy-to-github.sh` to get started! 🎉
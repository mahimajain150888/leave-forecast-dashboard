# GitHub Deployment Guide

This guide will help you deploy the Monday.com Vacation Dashboard to GitHub and optionally to hosting platforms.

## 📋 Prerequisites

- Git installed on your computer
- GitHub account
- Monday.com API token and Board ID

## 🚀 Step 1: Prepare for GitHub

### 1.1 Initialize Git Repository (if not already done)

```bash
cd monday-dashboard
git init
```

### 1.2 Verify .gitignore

The `.gitignore` file is already configured to exclude:
- `node_modules/`
- `.env` files (keeps your secrets safe)
- Build outputs
- IDE files

**IMPORTANT:** Never commit your `.env` file with API tokens!

## 📤 Step 2: Push to GitHub

### 2.1 Create a New Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `monday-vacation-dashboard` (or your choice)
3. Description: "Vacation Forecast Dashboard for Monday.com"
4. Choose Public or Private
5. **DO NOT** initialize with README (we already have files)
6. Click "Create repository"

### 2.2 Add Remote and Push

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: Monday.com Vacation Dashboard with manager analytics and forecast window"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/monday-vacation-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🌐 Step 3: Deployment Options

### Option A: Deploy to Render (Recommended - Free Tier Available)

#### Backend Deployment:

1. Go to https://render.com and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** `monday-dashboard-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

5. Add Environment Variables:
   ```
   MONDAY_API_TOKEN=your_monday_api_token
   MONDAY_BOARD_ID=your_board_id
   PORT=3001
   NODE_ENV=production
   CACHE_TTL=300
   ```

6. Click "Create Web Service"

#### Frontend Deployment:

1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name:** `monday-dashboard-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

5. Click "Create Static Site"

### Option B: Deploy to Vercel

#### Frontend:

```bash
cd frontend
npm install -g vercel
vercel
```

Follow prompts and set environment variable:
```
VITE_API_URL=your_backend_url
```

#### Backend:

```bash
cd backend
vercel
```

Set environment variables in Vercel dashboard.

### Option C: Deploy to Heroku

#### Backend:

```bash
cd backend
heroku create monday-dashboard-backend
heroku config:set MONDAY_API_TOKEN=your_token
heroku config:set MONDAY_BOARD_ID=your_board_id
git subtree push --prefix backend heroku main
```

#### Frontend:

```bash
cd frontend
heroku create monday-dashboard-frontend
heroku buildpacks:set heroku/nodejs
git subtree push --prefix frontend heroku main
```

### Option D: Deploy to Netlify

1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub repository
4. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
5. Add environment variable: `VITE_API_URL`

## 🔧 Step 4: Update Frontend API URL

After deploying the backend, update the frontend to use the production API URL:

### For Render/Vercel/Netlify:

Set environment variable:
```
VITE_API_URL=https://your-backend-url.com
```

### For local development:

Keep using:
```javascript
const API_BASE_URL = '/api/dashboard';
```

## 📝 Step 5: Update README

Create a comprehensive README.md:

```bash
# Update the main README with deployment info
```

## 🔐 Security Checklist

- ✅ `.env` file is in `.gitignore`
- ✅ No API tokens in code
- ✅ Environment variables set on hosting platform
- ✅ `.env.example` provided for reference
- ✅ CORS configured for production domains

## 🔄 Continuous Deployment

Once connected to GitHub, most platforms auto-deploy on push:

```bash
# Make changes
git add .
git commit -m "Update dashboard features"
git push origin main
# Automatic deployment triggered!
```

## 📊 Monitoring

### Render:
- View logs in Render dashboard
- Monitor performance metrics

### Vercel:
- Analytics available in dashboard
- Real-time logs

### Heroku:
- Use `heroku logs --tail` for live logs
- Monitor dyno usage

## 🆘 Troubleshooting

### Build Fails:
- Check Node.js version compatibility
- Verify all dependencies in package.json
- Check build logs for specific errors

### API Connection Issues:
- Verify CORS settings in backend
- Check API URL in frontend environment variables
- Ensure backend is running and accessible

### Environment Variables Not Working:
- Restart the service after adding variables
- Check variable names match exactly
- Verify no typos in values

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Monday.com API Docs](https://developer.monday.com/api-reference/docs)

## 🎉 Success!

Your dashboard is now deployed and accessible via:
- Frontend: `https://your-frontend-url.com`
- Backend API: `https://your-backend-url.com/api/dashboard`

Share the frontend URL with your team to access the vacation dashboard!

---

**Need Help?** Check the logs on your hosting platform or review the setup guide.
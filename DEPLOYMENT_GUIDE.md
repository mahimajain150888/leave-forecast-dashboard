# 🚀 Deployment Guide - Leave Forecast Dashboard

This guide will help you deploy the Leave Forecast Dashboard so your team can access it.

## 📋 Table of Contents
1. [Quick Deployment Options](#quick-deployment-options)
2. [Option 1: Deploy to Render (Recommended - Free)](#option-1-deploy-to-render-recommended)
3. [Option 2: Deploy to Heroku](#option-2-deploy-to-heroku)
4. [Option 3: Deploy to Your Company Server](#option-3-deploy-to-company-server)
5. [Post-Deployment Setup](#post-deployment-setup)

---

## Quick Deployment Options

| Option | Cost | Difficulty | Best For |
|--------|------|-----------|----------|
| **Render** | Free | Easy | Quick team sharing |
| **Heroku** | Free/$7/mo | Easy | Reliable hosting |
| **Company Server** | Varies | Medium | Enterprise deployment |

---

## Option 1: Deploy to Render (Recommended)

Render offers free hosting for both frontend and backend.

### Step 1: Prepare Your Code

1. **Create a GitHub repository** (if you haven't already):
   ```bash
   cd "/Users/mahimajain/Downloads/leave forecast/monday-dashboard"
   git init
   git add .
   git commit -m "Initial commit - Leave Forecast Dashboard"
   ```

2. **Create a GitHub account** at https://github.com if you don't have one

3. **Push to GitHub**:
   ```bash
   # Create a new repository on GitHub first, then:
   git remote add origin https://github.com/YOUR_USERNAME/leave-forecast-dashboard.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy Backend to Render

1. **Sign up at Render**: https://render.com (use your GitHub account)

2. **Create a new Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository: `leave-forecast-dashboard`

3. **Configure the backend**:
   - **Name**: `leave-forecast-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`

4. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable" and add:
   ```
   MONDAY_API_TOKEN=your_monday_api_token
   MONDAY_BOARD_ID=18406509069
   MONDAY_MASTER_BOARD_ID=18407511613
   NODE_ENV=production
   PORT=3001
   ALLOWED_ORIGINS=*
   CACHE_TTL=300
   ```

5. **Deploy**: Click "Create Web Service"

6. **Note your backend URL**: e.g., `https://leave-forecast-backend.onrender.com`

### Step 3: Deploy Frontend to Render

1. **Create another Web Service**:
   - Click "New +" → "Web Service"
   - Select same repository

2. **Configure the frontend**:
   - **Name**: `leave-forecast-frontend`
   - **Root Directory**: `frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview -- --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`

3. **Add Environment Variables**:
   ```
   VITE_API_URL=https://leave-forecast-backend.onrender.com
   ```

4. **Update frontend API configuration**:
   Before deploying, update `frontend/src/components/Dashboard.jsx` and other components:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/dashboard';
   ```

5. **Deploy**: Click "Create Web Service"

6. **Your app URL**: e.g., `https://leave-forecast-frontend.onrender.com`

### Step 4: Share with Team

Share the frontend URL with your team: `https://leave-forecast-frontend.onrender.com`

---

## Option 2: Deploy to Heroku

### Prerequisites
- Heroku account (https://heroku.com)
- Heroku CLI installed

### Step 1: Prepare for Heroku

1. **Install Heroku CLI**:
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   ```

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

### Step 2: Deploy Backend

```bash
cd "/Users/mahimajain/Downloads/leave forecast/monday-dashboard/backend"

# Create Heroku app
heroku create leave-forecast-backend

# Set environment variables
heroku config:set MONDAY_API_TOKEN=your_token
heroku config:set MONDAY_BOARD_ID=18406509069
heroku config:set MONDAY_MASTER_BOARD_ID=18407511613
heroku config:set NODE_ENV=production

# Create Procfile
echo "web: node server.js" > Procfile

# Deploy
git init
git add .
git commit -m "Deploy backend"
heroku git:remote -a leave-forecast-backend
git push heroku main
```

### Step 3: Deploy Frontend

```bash
cd "/Users/mahimajain/Downloads/leave forecast/monday-dashboard/frontend"

# Create Heroku app
heroku create leave-forecast-frontend

# Set backend URL
heroku config:set VITE_API_URL=https://leave-forecast-backend.herokuapp.com

# Build and deploy
npm run build
# Use heroku-buildpack-static or deploy dist folder
```

---

## Option 3: Deploy to Company Server

If your company has an internal server:

### Requirements
- Node.js 18+ installed on server
- PM2 for process management
- Nginx for reverse proxy

### Step 1: Transfer Files

```bash
# Zip the application
cd "/Users/mahimajain/Downloads/leave forecast"
zip -r leave-forecast-app.zip monday-dashboard/

# Transfer to server (replace with your server details)
scp leave-forecast-app.zip user@your-server.com:/var/www/
```

### Step 2: Setup on Server

```bash
# SSH into server
ssh user@your-server.com

# Extract files
cd /var/www
unzip leave-forecast-app.zip
cd monday-dashboard

# Install dependencies
cd backend && npm install --production
cd ../frontend && npm install && npm run build

# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'leave-forecast-backend',
    cwd: './backend',
    script: 'server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      MONDAY_API_TOKEN: 'your_token',
      MONDAY_BOARD_ID: '18406509069',
      MONDAY_MASTER_BOARD_ID: '18407511613'
    }
  }]
};
EOF

# Start backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 3: Configure Nginx

```nginx
# /etc/nginx/sites-available/leave-forecast
server {
    listen 80;
    server_name leave-forecast.yourcompany.com;

    # Frontend
    location / {
        root /var/www/monday-dashboard/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/leave-forecast /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Post-Deployment Setup

### 1. Update Frontend API URL

Update `frontend/src/components/Dashboard.jsx` and all component files:

```javascript
// Change from:
const API_BASE_URL = '/api/dashboard';

// To:
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/dashboard';
```

### 2. Configure CORS

In `backend/server.js`, update CORS settings:

```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'https://your-frontend-url.com'
];
```

### 3. Test the Deployment

1. **Backend Health Check**:
   ```bash
   curl https://your-backend-url.com/api/dashboard/health
   ```

2. **Frontend Access**:
   - Open `https://your-frontend-url.com` in browser
   - Test all features:
     - Dashboard loads
     - Leave form works
     - Employee auto-fill works
     - Export to Excel works

### 4. Share with Team

Send your team:
- **App URL**: `https://your-frontend-url.com`
- **User Guide**: Share the `FILTER_USER_GUIDE.md`
- **Support Contact**: Your email/Slack

---

## 🔒 Security Considerations

1. **API Token**: Never commit `.env` file to Git
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Restrict `ALLOWED_ORIGINS` to your domain only
4. **Rate Limiting**: Already configured (100 requests per 15 minutes)

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend not starting
```bash
# Check logs
pm2 logs leave-forecast-backend
# or on Render: View logs in dashboard
```

**Problem**: Monday.com API errors
- Verify `MONDAY_API_TOKEN` is correct
- Check token hasn't expired
- Verify board IDs are correct

### Frontend Issues

**Problem**: Can't connect to backend
- Check `VITE_API_URL` environment variable
- Verify CORS settings
- Check browser console for errors

**Problem**: Build fails
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📞 Support

For issues or questions:
1. Check the logs first
2. Review this guide
3. Contact: mahima.jain@in.ibm.com

---

## 🎉 Success!

Your Leave Forecast Dashboard is now deployed and accessible to your team!

**Next Steps**:
1. Share the URL with your team
2. Provide training on features
3. Monitor usage and gather feedback
4. Clean up duplicate managers in Monday.com board
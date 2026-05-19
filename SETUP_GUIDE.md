# Quick Setup Guide

Follow these steps to get your Monday.com Vacation Dashboard up and running in minutes!

## Step 1: Get Your Monday.com Credentials

### Get API Token
1. Log in to Monday.com
2. Click your profile picture (bottom left corner)
3. Select **Admin** → **API**
4. Click **Generate** to create a new token (or copy existing)
5. **Save this token** - you'll need it in Step 3

### Get Board ID
1. Open your vacation tracking board in Monday.com
2. Look at the browser URL bar
3. Find the number after `/boards/`
   - Example: `https://yourcompany.monday.com/boards/1234567890`
   - Your Board ID is: `1234567890`
4. **Save this ID** - you'll need it in Step 3

## Step 2: Install Dependencies

Open your terminal and navigate to the project:

```bash
cd monday-dashboard
```

### Install Backend Dependencies
```bash
cd backend
npm install
```

### Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## Step 3: Configure Backend

1. Navigate to the backend folder:
```bash
cd backend
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Open `.env` in your text editor and add your credentials:
```env
MONDAY_API_TOKEN=your_token_from_step_1
MONDAY_BOARD_ID=your_board_id_from_step_1
PORT=3001
NODE_ENV=development
```

**Example:**
```env
MONDAY_API_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjEyMzQ1Njc4OTB9.abcdefghijklmnop
MONDAY_BOARD_ID=1234567890
PORT=3001
NODE_ENV=development
```

## Step 4: Start the Application

You'll need **two terminal windows** open.

### Terminal 1 - Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Monday.com Dashboard API Server running on port 3001
📊 Environment: development
🔗 API Base URL: http://localhost:3001
```

**Keep this terminal running!**

### Terminal 2 - Start Frontend

Open a new terminal window:

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**Keep this terminal running too!**

## Step 5: Open the Dashboard

Open your web browser and go to:
```
http://localhost:3000
```

You should see your vacation dashboard with data from your Monday.com board! 🎉

## Troubleshooting

### Problem: "Failed to fetch board information"

**Solution:**
1. Check that your `MONDAY_API_TOKEN` is correct in `.env`
2. Verify the token has permissions to read the board
3. Confirm `MONDAY_BOARD_ID` matches your board
4. Restart the backend server

### Problem: Backend won't start

**Solution:**
1. Make sure port 3001 is not already in use
2. Check that all dependencies installed: `npm install`
3. Verify `.env` file exists in the backend folder
4. Check for syntax errors in `.env`

### Problem: Frontend shows blank page

**Solution:**
1. Check browser console for errors (F12)
2. Verify backend is running on port 3001
3. Clear browser cache and refresh
4. Check that frontend dependencies installed: `npm install`

### Problem: "CORS Error"

**Solution:**
1. Make sure backend is running
2. Check that frontend is accessing `http://localhost:3000`
3. Restart both backend and frontend

### Problem: No data showing

**Solution:**
1. Verify your Monday.com board has items
2. Check that board has date/timeline columns
3. Test the API directly: `http://localhost:3001/api/dashboard/health`
4. Clear cache: `POST http://localhost:3001/api/dashboard/cache/clear`

## Next Steps

### Customize Your Dashboard

1. **Adjust Cache Duration**: Edit `CACHE_TTL` in `.env` (default: 300 seconds)
2. **Add More Origins**: Update `ALLOWED_ORIGINS` in `.env` for production
3. **Modify Charts**: Edit `frontend/src/components/Dashboard.jsx`

### Deploy to Production

See the main README.md for production deployment instructions.

## Need Help?

1. Check the main [README.md](./README.md) for detailed documentation
2. Review [Monday.com API Documentation](https://developer.monday.com/api-reference/docs)
3. Check the health endpoint: `http://localhost:3001/api/dashboard/health`

## Quick Reference

### Backend Commands
```bash
npm run dev      # Start development server with auto-reload
npm start        # Start production server
```

### Frontend Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### API Endpoints
- Board Info: `GET http://localhost:3001/api/dashboard/board`
- All Items: `GET http://localhost:3001/api/dashboard/items`
- Analytics: `GET http://localhost:3001/api/dashboard/analytics`
- Health Check: `GET http://localhost:3001/api/dashboard/health`
- Clear Cache: `POST http://localhost:3001/api/dashboard/cache/clear`

## Success Checklist

- [ ] Monday.com API token obtained
- [ ] Board ID identified
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] `.env` file created and configured
- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] Dashboard loads in browser
- [ ] Data displays from Monday.com board

If all items are checked, you're all set! 🚀
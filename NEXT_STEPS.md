# ✅ Dependencies Installed Successfully!

Both backend and frontend dependencies have been installed. Here's what to do next:

## 📋 Current Status

✅ Backend dependencies installed (9 packages)
✅ Frontend dependencies installed (React, Vite, Recharts, etc.)
✅ All files created
⏳ **Next: Configure your Monday.com credentials**

---

## 🚀 Quick Start (3 Steps)

### Step 1: Get Your Monday.com Credentials

#### Get API Token:
1. Go to Monday.com
2. Click your profile picture (bottom left)
3. Select **Admin** → **API**
4. Click **Generate** (or copy existing token)
5. **Copy the token**

#### Get Board ID:
1. Open your vacation board in Monday.com
2. Look at the URL: `https://yourcompany.monday.com/boards/1234567890`
3. The number `1234567890` is your Board ID
4. **Copy this number**

---

### Step 2: Configure Backend

Open Terminal and run:

```bash
cd monday-dashboard/backend
cp .env.example .env
```

Then edit the `.env` file with your credentials:

```bash
# Use any text editor (TextEdit, VS Code, nano, etc.)
open .env
```

Replace the values:
```env
MONDAY_API_TOKEN=paste_your_token_here
MONDAY_BOARD_ID=paste_your_board_id_here
PORT=3001
NODE_ENV=development
```

**Save the file!**

---

### Step 3: Test Connection (Optional but Recommended)

```bash
cd monday-dashboard/backend
/usr/local/bin/npm run test-connection
```

This will verify your Monday.com credentials are working correctly.

---

## 🎯 Start the Dashboard

You need **TWO terminal windows**:

### Terminal 1 - Start Backend

```bash
cd monday-dashboard/backend
/usr/local/bin/npm run dev
```

You should see:
```
🚀 Monday.com Dashboard API Server running on port 3001
```

**Keep this terminal running!**

---

### Terminal 2 - Start Frontend

Open a NEW terminal window:

```bash
cd monday-dashboard/frontend
/usr/local/bin/npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms
  ➜  Local:   http://localhost:3000/
```

**Keep this terminal running too!**

---

## 🌐 Open Your Dashboard

Open your web browser and go to:

```
http://localhost:3000
```

You should see your beautiful vacation dashboard with data from Monday.com! 🎉

---

## 🔧 Troubleshooting

### "Failed to fetch board information"

**Check:**
- Is your `MONDAY_API_TOKEN` correct in `.env`?
- Is your `MONDAY_BOARD_ID` correct in `.env`?
- Did you save the `.env` file?
- Did you restart the backend after editing `.env`?

**Solution:**
```bash
# Stop backend (Ctrl+C in Terminal 1)
# Edit .env file
# Restart backend
cd monday-dashboard/backend
/usr/local/bin/npm run dev
```

---

### Backend won't start

**Check:**
- Is port 3001 already in use?
- Are you in the correct directory?

**Solution:**
```bash
# Check if something is using port 3001
lsof -i :3001

# If yes, kill it or change PORT in .env
```

---

### Frontend shows blank page

**Check:**
- Is the backend running?
- Check browser console (F12) for errors

**Solution:**
- Make sure backend is running first
- Refresh the page
- Clear browser cache

---

## 📊 What You'll See

Your dashboard includes:

### Overview Tab
- 📊 Total vacation requests
- 👥 Current vacations count
- 📅 Upcoming vacations (90 days)
- 📈 Unique employees
- Pie chart: Status distribution
- Line chart: Monthly trends
- Bar chart: Top employees

### Upcoming Vacations Tab
- List of all vacations in next 90 days
- Days until vacation
- Date ranges
- Employee names

### Current Vacations Tab
- Who's on vacation right now
- Active vacation periods

---

## 🎨 Dashboard Features

- ✅ Real-time sync with Monday.com
- ✅ Automatic data refresh
- ✅ Smart caching (5 minutes)
- ✅ Beautiful visualizations
- ✅ Responsive design
- ✅ Clear cache button
- ✅ Manual refresh button

---

## 📝 Important Notes

1. **Node.js Path**: Your system has Node.js installed at `/usr/local/bin/npm`
   - If `npm` command doesn't work, use `/usr/local/bin/npm` instead

2. **Data Updates**: Dashboard caches data for 5 minutes
   - Click "Clear Cache" button to force refresh
   - Or click "Refresh" button

3. **Board Structure**: Works best with:
   - Date or Timeline columns (for vacation dates)
   - Status columns (Approved, Pending, Rejected)
   - People columns (for employee assignment)

---

## 🆘 Need Help?

1. **Test Connection**: `cd backend && /usr/local/bin/npm run test-connection`
2. **Check Logs**: Look at terminal output for errors
3. **Health Check**: Visit `http://localhost:3001/api/dashboard/health`
4. **Documentation**: See `README.md` for full API reference

---

## 🎉 You're Almost There!

Just 3 steps away from your dashboard:
1. ✅ Dependencies installed
2. ⏳ Configure `.env` with Monday.com credentials
3. ⏳ Start backend and frontend
4. ⏳ Open http://localhost:3000

**Start with Step 2 above!**
# Filter Bar Troubleshooting Guide

## Filter Bar Not Showing?

If you don't see the filter bar on your dashboard, try these steps:

### 1. Hard Refresh Your Browser
The most common issue is browser cache. Try:

**Chrome/Edge/Firefox:**
- Windows: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Safari:**
- Mac: `Cmd + Option + R`

### 2. Clear Browser Cache
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### 3. Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for any red error messages
4. If you see errors related to FilterBar, report them

### 4. Verify Files Exist
Check that these files were created:
```
monday-dashboard/frontend/src/components/FilterBar.jsx
monday-dashboard/frontend/src/components/FilterBar.css
```

### 5. Check Dev Server
Make sure the dev server is running:
```bash
cd monday-dashboard/frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### 6. Restart Dev Server
Sometimes a restart helps:
```bash
# Stop the server (Ctrl+C)
# Then restart:
cd monday-dashboard/frontend
npm run dev
```

### 7. Check for Import Errors
Open browser console and look for:
- "Failed to fetch module"
- "Cannot find module"
- "Unexpected token"

### 8. Verify Dashboard View
Make sure you're on the "Team Dashboard" tab, not "Submit Leave" or "My Leaves"

## What the Filter Bar Should Look Like

When working correctly, you should see:

```
┌─────────────────────────────────────────────────────┐
│ 🔍 Filters                                          │
│                                                     │
│ [Search Employee] [Manager ▼] [Status ▼] [Dates]  │
└─────────────────────────────────────────────────────┘
```

Located between the header and the statistics cards.

## Still Not Working?

### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for failed requests (red items)

### Verify Build
Run a production build to check for errors:
```bash
cd monday-dashboard/frontend
npm run build
```

If build fails, there's a code issue.

### Check File Contents
Verify Dashboard.jsx includes:
```javascript
import FilterBar from './FilterBar';
```

And in the return statement:
```javascript
<FilterBar
  filters={filters}
  onFilterChange={handleFilterChange}
  availableManagers={availableManagers}
  availableStatuses={availableStatuses}
/>
```

## Common Issues

### Issue: "Cannot find module './FilterBar'"
**Solution**: Make sure FilterBar.jsx exists in the same directory as Dashboard.jsx

### Issue: Blank white space where filter should be
**Solution**: Check browser console for CSS loading errors

### Issue: Filter shows but doesn't work
**Solution**: Check that filteredStats is being used instead of stats in all places

### Issue: Page crashes when typing in search
**Solution**: Clear browser cache and hard refresh

## Getting Help

If none of these steps work:

1. Check browser console for errors
2. Copy any error messages
3. Check that all files were created correctly
4. Verify the dev server is running without errors
5. Try in a different browser (Chrome, Firefox, Safari)

## Quick Reset

If all else fails, try this complete reset:

```bash
# Stop all servers (Ctrl+C in both terminals)

# Clear node modules and reinstall
cd monday-dashboard/frontend
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

Then hard refresh your browser.
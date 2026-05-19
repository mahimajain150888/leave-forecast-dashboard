# Installing Node.js on macOS

You need Node.js installed to run the Monday.com Dashboard. Here are three methods to install it:

## Method 1: Official Installer (Recommended for Beginners)

This is the easiest method:

1. **Download Node.js**
   - Visit: https://nodejs.org/
   - Click the **LTS** (Long Term Support) button to download
   - This will download a `.pkg` file

2. **Install**
   - Double-click the downloaded `.pkg` file
   - Follow the installation wizard
   - Click "Continue" → "Install" → Enter your password
   - Click "Close" when done

3. **Verify Installation**
   - Open Terminal (Applications → Utilities → Terminal)
   - Run these commands:
   ```bash
   node --version
   npm --version
   ```
   - You should see version numbers (e.g., v20.x.x and 10.x.x)

4. **Continue with Dashboard Setup**
   - Once verified, proceed to install the dashboard dependencies

---

## Method 2: Using Homebrew (Recommended for Developers)

If you prefer using a package manager:

### Step 1: Install Homebrew

Open Terminal and run:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the on-screen instructions. You may need to:
- Press ENTER to continue
- Enter your password
- Run additional commands shown at the end

### Step 2: Install Node.js

After Homebrew is installed:
```bash
brew install node
```

### Step 3: Verify Installation
```bash
node --version
npm --version
```

---

## Method 3: Using NVM (Node Version Manager)

For managing multiple Node.js versions:

### Step 1: Install NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

### Step 2: Restart Terminal or Run

```bash
source ~/.zshrc
```

### Step 3: Install Node.js

```bash
nvm install --lts
nvm use --lts
```

### Step 4: Verify Installation
```bash
node --version
npm --version
```

---

## After Node.js is Installed

Once Node.js and npm are installed, return to the main setup:

### 1. Install Dashboard Dependencies

**Backend:**
```bash
cd monday-dashboard/backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 2. Configure Your Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your Monday.com credentials:
```env
MONDAY_API_TOKEN=your_token_here
MONDAY_BOARD_ID=your_board_id_here
```

### 3. Test Connection

```bash
npm run test-connection
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Open Dashboard

Visit: http://localhost:3000

---

## Troubleshooting

### "command not found" after installation

**Solution:** Close and reopen Terminal, then try again.

### Permission errors during npm install

**Solution:** Don't use `sudo` with npm. If you get permission errors:
```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Port already in use

**Solution:** 
- Backend (3001): Change `PORT` in `.env`
- Frontend (3000): It will prompt you to use a different port

### Still having issues?

1. Check Node.js version: `node --version` (should be 16+)
2. Check npm version: `npm --version` (should be 8+)
3. Try clearing npm cache: `npm cache clean --force`
4. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

---

## Quick Reference

### Check if Node.js is installed
```bash
node --version
npm --version
```

### Install dashboard dependencies
```bash
# Backend
cd monday-dashboard/backend
npm install

# Frontend
cd monday-dashboard/frontend
npm install
```

### Run the dashboard
```bash
# Backend (Terminal 1)
cd monday-dashboard/backend
npm run dev

# Frontend (Terminal 2)
cd monday-dashboard/frontend
npm run dev
```

---

## Need Help?

- Node.js Documentation: https://nodejs.org/docs/
- npm Documentation: https://docs.npmjs.com/
- Homebrew Documentation: https://brew.sh/

Once Node.js is installed, refer to `SETUP_GUIDE.md` for complete dashboard setup instructions.
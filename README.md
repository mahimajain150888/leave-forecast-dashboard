# Monday.com Vacation Dashboard

A comprehensive dashboard application that integrates with Monday.com to visualize and analyze vacation forecast data from your Monday.com boards.

## Features

- 📊 **Real-time Data Sync** - Fetches vacation data directly from your Monday.com board
- 📈 **Visual Analytics** - Interactive charts showing vacation trends, status distribution, and employee statistics
- 📅 **Vacation Tracking** - View current and upcoming vacations with detailed information
- 🔄 **Smart Caching** - Reduces API calls with intelligent caching (5-minute TTL)
- 🎨 **Modern UI** - Beautiful, responsive interface built with React
- 🚀 **Easy Setup** - Simple configuration with environment variables

## Dashboard Views

### Overview
- Total vacation requests statistics
- Current and upcoming vacation counts
- Status distribution pie chart
- Monthly trend analysis
- Top employees by vacation requests

### Upcoming Vacations
- List of all vacations in the next 90 days
- Days until vacation countdown
- Date ranges and employee information

### Current Vacations
- Real-time view of who's currently on vacation
- Active vacation periods

## Tech Stack

### Backend
- Node.js + Express
- Monday.com GraphQL API
- Node-cache for intelligent caching
- Helmet for security
- Rate limiting

### Frontend
- React 18
- Vite for fast development
- Recharts for data visualization
- Lucide React for icons
- Axios for API calls

## Prerequisites

- Node.js 16+ and npm
- Monday.com account with API access
- A Monday.com board with vacation data

## Installation

### 1. Clone or Navigate to the Project

```bash
cd monday-dashboard
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Monday.com credentials:

```env
MONDAY_API_TOKEN=your_monday_api_token_here
MONDAY_BOARD_ID=your_board_id_here
PORT=3001
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## Getting Monday.com Credentials

### API Token

1. Log in to your Monday.com account
2. Click on your profile picture (bottom left)
3. Go to **Admin** → **API**
4. Click **Generate** or copy your existing token
5. Copy the token to your `.env` file

### Board ID

1. Open your vacation board in Monday.com
2. Look at the URL: `https://yourcompany.monday.com/boards/1234567890`
3. The number at the end is your Board ID
4. Copy it to your `.env` file

## Running the Application

### Development Mode

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## API Endpoints

### GET /api/dashboard/board
Get Monday.com board information including columns and metadata.

### GET /api/dashboard/items
Get all vacation items from the board with parsed data.

### GET /api/dashboard/analytics
Get comprehensive analytics including:
- Total requests
- Status breakdown
- Monthly trends
- Employee statistics
- Upcoming vacations
- Current vacations

### GET /api/dashboard/coverage
Get team coverage for a specific date range.

**Query Parameters:**
- `startDate` (required): YYYY-MM-DD format
- `endDate` (required): YYYY-MM-DD format

**Example:**
```
GET /api/dashboard/coverage?startDate=2026-05-01&endDate=2026-05-31
```

### POST /api/dashboard/cache/clear
Clear the cache to force fresh data fetch.

### GET /api/dashboard/health
Health check endpoint to verify Monday.com connection.

## Monday.com Board Structure

The dashboard works best with boards that have the following column types:

- **Date/Timeline columns** - For vacation start and end dates
- **Status columns** - For approval status (Approved, Pending, Rejected)
- **People columns** - For employee assignment
- **Text columns** - For vacation descriptions

The service automatically detects and parses these column types.

## Configuration

### Cache Settings

Adjust cache TTL in `.env`:
```env
CACHE_TTL=300  # 5 minutes in seconds
```

### Rate Limiting

Configure rate limits in `.env`:
```env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### CORS

Add allowed origins in `.env`:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://yourdomain.com
```

## Troubleshooting

### "Failed to fetch board information"

- Verify your `MONDAY_API_TOKEN` is correct
- Check that the token has read permissions for the board
- Ensure `MONDAY_BOARD_ID` matches your board

### "CORS Error"

- Add your frontend URL to `ALLOWED_ORIGINS` in backend `.env`
- Restart the backend server after changing `.env`

### Empty Dashboard

- Verify your Monday.com board has items
- Check that date columns are properly formatted
- Use the health check endpoint: `GET /api/dashboard/health`

### Cache Issues

- Clear cache via: `POST /api/dashboard/cache/clear`
- Or restart the backend server

## Development

### Project Structure

```
monday-dashboard/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── dashboardController.js
│   │   ├── services/
│   │   │   └── mondayService.js
│   │   └── routes/
│   │       └── dashboardRoutes.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.jsx
    │   │   └── Dashboard.css
    │   ├── App.jsx
    │   ├── App.css
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

### Adding New Features

1. **Backend**: Add new methods to `mondayService.js` and expose via `dashboardController.js`
2. **Frontend**: Create new components in `src/components/` and import in `Dashboard.jsx`

## Security Notes

- Never commit `.env` files to version control
- Keep your Monday.com API token secure
- Use environment variables for all sensitive data
- Enable rate limiting in production
- Use HTTPS in production environments

## Performance Tips

- Cache is enabled by default (5-minute TTL)
- Adjust `CACHE_TTL` based on your data update frequency
- Use the coverage endpoint for specific date ranges instead of fetching all data
- Monitor API rate limits from Monday.com

## License

MIT

## Support

For issues related to:
- **Monday.com API**: Check [Monday.com API Documentation](https://developer.monday.com/api-reference/docs)
- **This Application**: Review the troubleshooting section above

## Contributing

Feel free to submit issues and enhancement requests!
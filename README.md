# Board Game Tracker

A static website built with Eleventy (11ty) that runs entirely in the browser using localStorage for persistence. Track your board game plays, manage players, and analyze game statistics.

## Features

- **Multi-user Support**: Add multiple players and track their individual statistics
- **Game Library**: Manage your collection of board games with categories and player counts
- **Match Recording**: Record matches with scores, rankings, duration, and notes
- **Analytics**:
  - Leaderboards and win rates
  - Rivalry tracking between players
  - Game popularity and category breakdowns
  - Activity trends over time
- **Data Export**: Export all data to CSV for backup or analysis
- **Privacy-friendly**: All data stored locally in your browser

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This will start a local server at http://localhost:3000

### Production Build

```bash
npm run build
```

The static files will be generated in the `_site` directory.

## Project Structure

```
board-game-tracker/
├── src/
│   ├── _layouts/       # Eleventy layouts
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript modules
│   │   ├── storage.js  # localStorage data layer
│   │   ├── analytics.js # Statistics calculations
│   │   ├── export.js   # CSV export functionality
│   │   └── app.js      # Main application logic
│   ├── index.njk       # Main page
│   └── robots.txt
├── .eleventy.js       # Eleventy configuration
├── package.json
└── README.md
```

## Architecture Notes

### Data Layer (storage.js)

The `Storage` class provides a unified interface for CRUD operations on users, games, and matches. All data is persisted to localStorage with JSON serialization.

Key design decisions:
- Auto-initializes storage keys on first load
- Generates unique IDs using timestamp + random string
- Provides export/import for data backup

### Analytics (analytics.js)

The `Analytics` class calculates various statistics from stored data:

- **User stats**: Total matches, wins, win rate, per-game statistics
- **Game stats**: Play counts, unique players, player rankings
- **Rivalries**: Head-to-head records between players
- **Trends**: Win/loss trends over time, activity by month

### CSV Export (export.js)

Provides export functionality for:
- Individual data types (users, games, matches)
- Statistics (user stats, game stats, leaderboard)
- Full JSON backup

### App (app.js)

The main application handles:
- SPA-like navigation (no page reloads)
- Modal dialogs for CRUD operations
- Event delegation for performance
- Toast notifications for feedback

## Future Enhancements

The architecture supports easy addition of:

1. **Monetization**:
   - Google AdSense integration (script tag in layout)
   - Affiliate links for games (placeholder in footer)

2. **Cloud Sync** (requires backend):
   - User authentication
   - Cloud database storage
   - Real-time sync across devices

3. **Additional Features**:
   - Tournament support
   - Achievement system
   - Game suggestions based on player count

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires localStorage and modern JavaScript (ES6+).

## License

MIT

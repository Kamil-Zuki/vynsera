# Watchlist Feature

## Overview

Users can now save their favorite Korean learning resources to a personal watchlist for easy access later.

## Features

### ✅ What Was Added

1. **Bookmark Button on Resource Cards**

   - Click the bookmark icon to add/remove resources
   - Filled bookmark = saved to watchlist
   - Empty bookmark = not saved

2. **Watchlist Page** (`/watchlist`)

   - View all saved resources
   - Same card layout as search page
   - Empty state with link to browse resources
   - Shows count of saved resources

3. **Navigation Badge**

   - Watchlist link in main navigation
   - Badge showing number of saved resources
   - Updates in real-time as you add/remove items

4. **Homepage Integration**

   - Stats section shows your saved resource count
   - New feature card linking to watchlist
   - Updated to show current resource count (79+)

5. **Persistent Storage**
   - Uses localStorage to save watchlist
   - Persists across browser sessions
   - No login required

## How to Use

### Adding to Watchlist

1. Browse resources at `/search`
2. Click the bookmark icon on any resource card
3. The icon fills in to show it's saved

### Removing from Watchlist

1. Click the filled bookmark icon on any saved resource
2. Or visit `/watchlist` and click the bookmark to remove

### Viewing Watchlist

1. Click "Watchlist" in the navigation
2. Or visit http://localhost:3000/watchlist
3. See all your saved resources in one place

## Technical Details

### Components

**`WatchlistProvider.tsx`**

- React Context for global watchlist state
- localStorage persistence
- Methods: `addToWatchlist`, `removeFromWatchlist`, `isInWatchlist`

**`WatchlistPageClient.tsx`**

- Main watchlist page component
- Fetches full resource details from API
- Empty state handling
- Loading and error states

**`ResourceCard.tsx`** (Updated)

- Added bookmark toggle button
- Prevents click propagation to external link
- Visual feedback for saved state

**`Navigation.tsx`** (Updated)

- Watchlist link added to navigation
- Badge showing count
- Desktop and mobile support

**`HomePageClient.tsx`** (Updated)

- Stats section includes watchlist count
- New feature card for watchlist
- 3-column layout on desktop

### Data Flow

```
User clicks bookmark
    ↓
WatchlistProvider updates state
    ↓
localStorage saves watchlist array
    ↓
UI updates (badge, button state)
    ↓
Watchlist page fetches resource details from API
```

### Storage Format

localStorage key: `korean-watchlist`

Format:

```json
["resource-id-1", "resource-id-2", "resource-id-3"]
```

## Future Enhancements

### Possible Features

- [ ] Export watchlist to file
- [ ] Share watchlist with others
- [ ] Add notes to saved resources
- [ ] Organize watchlist into categories
- [ ] Sort and filter watchlist
- [ ] Mark resources as "completed"
- [ ] Sync watchlist across devices (requires auth)
- [ ] Email watchlist to yourself
- [ ] Add resources to multiple lists
- [ ] Watchlist analytics (most saved, trending, etc.)

### With User Authentication

- [ ] Save watchlist to database (per user)
- [ ] Multiple watchlists per user
- [ ] Share watchlists publicly
- [ ] Follow other users' watchlists
- [ ] Collaborative watchlists

## Browser Compatibility

Works in all modern browsers that support:

- localStorage API
- ES6+ JavaScript
- React 19+

## Privacy

- **No data leaves your device** - watchlist stored locally
- **No tracking** - watchlist is private
- **No account required** - works immediately

## Troubleshooting

### Watchlist Not Persisting

- Check browser localStorage is enabled
- Check browser privacy settings
- Try clearing cache and restarting

### Watchlist Not Showing

- Ensure you're using the same browser
- Check localStorage in DevTools (Application → Local Storage)
- Key should be `korean-watchlist`

### Button Not Working

- Check console for errors
- Ensure JavaScript is enabled
- Try refreshing the page

## Developer Notes

### Accessing Watchlist Context

```tsx
import { useWatchlist } from "@/components/WatchlistProvider";

function MyComponent() {
  const {
    watchlist, // Array of resource IDs
    addToWatchlist, // Function to add resource
    removeFromWatchlist, // Function to remove resource
    isInWatchlist, // Check if resource is saved
    watchlistCount, // Number of saved resources
  } = useWatchlist();

  // Your code here
}
```

### localStorage Format

The watchlist is stored as a JSON array of resource IDs:

```typescript
localStorage.getItem("korean-watchlist");
// Returns: '["resource-1", "resource-2"]'
```

### Migration to Database

When implementing user authentication, migrate from localStorage to MongoDB:

1. Create `UserWatchlist` model
2. Create API endpoints (POST, DELETE)
3. Update `WatchlistProvider` to sync with API
4. Import existing localStorage data on first login

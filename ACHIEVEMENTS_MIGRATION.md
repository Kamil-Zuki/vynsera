# Achievements MongoDB Migration Guide

This guide explains how to migrate achievements from the JSON file to MongoDB.

## Overview

Achievements are now stored in MongoDB instead of a static JSON file. This allows for:

- Dynamic achievement management
- Easy updates without redeploying
- Admin interface for creating/editing achievements
- Better scalability and performance

## Migration Steps

### 1. Prerequisites

Make sure you have:

- MongoDB connection configured in your `.env` or `env.local` file
- `MONGODB_URI` environment variable set
- Node.js and npm installed

### 2. Run the Migration Script

You have several options to run the migration:

#### Option A: Using npm script (Recommended)

```bash
npm run seed:achievements
```

#### Option B: Using npx tsx directly

```bash
npx tsx scripts/seed-achievements.ts
```

#### Option C: Using Node with ts-node

```bash
npx ts-node scripts/seed-achievements.ts
```

### 3. Verify Migration

The script will output:

- Number of achievements cleared (if any existed)
- Number of achievements seeded
- Summary by category and rarity

Example output:

```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB

📦 Found 18 achievements in JSON file
🗑️  Cleared 0 existing achievements
✅ Successfully seeded 18 achievements to MongoDB

📊 Summary:

By Category:
  progress: 5
  streak: 4
  exploration: 3
  milestone: 5
  special: 1

By Rarity:
  common: 8
  rare: 5
  epic: 3
  legendary: 2

🎉 Achievement seeding completed!
🔌 Disconnected from MongoDB
```

## Achievement Management

### Admin API Endpoints

After migration, you can manage achievements via API:

#### Get All Achievements (including inactive)

```bash
GET /api/admin/achievements
```

#### Create New Achievement

```bash
POST /api/admin/achievements
Content-Type: application/json

{
  "id": "new-achievement",
  "title": "New Achievement",
  "titleKorean": "새로운 업적",
  "description": "Complete something amazing",
  "descriptionKorean": "놀라운 것을 완료하세요",
  "icon": "🎉",
  "category": "milestone",
  "rarity": "rare",
  "requirement": {
    "type": "steps_completed",
    "value": 15
  },
  "reward": {
    "xp": 750
  }
}
```

#### Update Achievement

```bash
PUT /api/admin/achievements?id=new-achievement
Content-Type: application/json

{
  "title": "Updated Achievement Title",
  "reward": {
    "xp": 1000
  }
}
```

#### Deactivate Achievement (Soft Delete)

```bash
DELETE /api/admin/achievements?id=new-achievement
```

### Achievement Schema

```typescript
{
  id: string;                    // Unique identifier
  title: string;                 // Achievement title (English)
  titleKorean?: string;          // Achievement title (Korean)
  description: string;           // Description (English)
  descriptionKorean?: string;    // Description (Korean)
  icon: string;                  // Emoji or icon
  category: "progress" | "streak" | "milestone" | "special" | "exploration";
  rarity: "common" | "rare" | "epic" | "legendary";
  requirement: {
    type: "steps_completed" | "days_streak" | "resources_viewed" |
          "watchlist_items" | "total_days" | "custom";
    value: number;
    additionalConditions?: Record<string, any>;
  };
  reward?: {
    xp?: number;
    badge?: string;
  };
  active: boolean;               // Whether achievement is active
  order: number;                 // Display order
}
```

## Re-running Migration

If you need to re-seed achievements:

1. The script will automatically clear existing achievements before seeding
2. To preserve existing achievements, comment out this line in `scripts/seed-achievements.ts`:
   ```typescript
   // const deleteResult = await Achievement.deleteMany({});
   ```

## Troubleshooting

### Connection Issues

- Verify `MONGODB_URI` in your environment variables
- Check if MongoDB is running
- Ensure your IP is whitelisted (if using MongoDB Atlas)

### Duplicate Key Errors

- Clear existing achievements manually: `db.achievements.deleteMany({})`
- Or modify the script to use `updateMany` with `upsert: true`

### TypeScript Errors

- Ensure all dependencies are installed: `npm install`
- Check that tsconfig.json includes the scripts folder

## Database Indexes

The Achievement model includes these indexes for performance:

- `{ category: 1, active: 1 }` - For filtering by category
- `{ rarity: 1 }` - For filtering by rarity
- `{ id: 1 }` - For quick lookups by achievement ID

## Next Steps

After migration:

1. ✅ Achievements are now dynamic
2. 🎯 Build an admin UI to manage achievements
3. 🔄 Set up automated achievement checks on user actions
4. 📊 Add achievement analytics and statistics
5. 🏆 Create seasonal or limited-time achievements

## Rollback Plan

If you need to rollback to JSON-based achievements:

1. Revert the API route changes in `src/app/api/achievements/route.ts`
2. Restore imports to use the JSON file:
   ```typescript
   import achievementsData from "@/data/achievements.json";
   const achievements: Achievement[] = achievementsData as Achievement[];
   ```
3. Remove MongoDB queries and use the achievements array directly

## Additional Resources

- [MongoDB Node.js Driver Docs](https://docs.mongodb.com/drivers/node/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

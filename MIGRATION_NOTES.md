# Migration from JSON to MongoDB

## What Changed

### Data Storage

- **Before**: Resources and roadmap data were stored in static JSON files (`src/data/*.json`)
- **After**: Data is stored in MongoDB database with proper indexing and querying capabilities

### Architecture

- Added MongoDB 7 container in Docker Compose
- Created Mongoose models for Resources and Roadmap
- Implemented REST API endpoints for data access
- Updated client components to fetch data from API

## New Files Created

### Database Layer

- `src/lib/mongodb.ts` - Database connection utility with connection pooling
- `src/models/Resource.ts` - Mongoose schema for resources
- `src/models/Roadmap.ts` - Mongoose schema for roadmap
- `src/types/mongoose.d.ts` - TypeScript definitions for global mongoose cache

### API Endpoints

- `src/app/api/resources/route.ts` - GET /api/resources (with filtering)
- `src/app/api/roadmap/route.ts` - GET /api/roadmap
- `src/app/api/health/route.ts` - GET /api/health (database health check)

### Scripts & Documentation

- `scripts/seed-database.ts` - Database seeding script
- `DATABASE.md` - Comprehensive database documentation
- `SETUP.md` - Quick setup guide
- `MIGRATION_NOTES.md` - This file

## Modified Files

### Application Code

- `src/app/search/SearchPageClient.tsx` - Now fetches from API with loading/error states
- `src/app/roadmap/RoadmapPageClient.tsx` - Now fetches from API with loading/error states

### Configuration

- `docker-compose.yml` - Added MongoDB service and persistent volume
- `package.json` - Added mongoose dependency and seed script
- `README.md` - Updated with database setup instructions

### Data Files (Preserved)

- `src/data/resources.json` - Still used for seeding
- `src/data/roadmap.json` - Still used for seeding

## Breaking Changes

⚠️ **Important**: The application now requires MongoDB to be running!

### For Local Development

1. MongoDB must be running (via Docker or locally)
2. Database must be seeded before first use
3. Environment variable `MONGODB_URI` must be set

### For Production

1. MongoDB service is included in docker-compose
2. Database must be seeded after deployment
3. Persistent volume ensures data survives container restarts

## Migration Steps

### First-Time Setup

```bash
# 1. Install new dependencies
npm install

# 2. Create .env.local file
echo "MONGODB_URI=mongodb://localhost:27017/vynsera" > .env.local

# 3. Start MongoDB
docker-compose up -d mongodb

# 4. Seed the database
npm run seed

# 5. Start development server
npm run dev
```

### Existing Deployments

```bash
# 1. Pull latest changes
git pull

# 2. Rebuild containers
docker-compose down
docker-compose up -d --build

# 3. Seed the database
docker-compose exec vynsera npm run seed
```

## Rollback Plan

If you need to rollback to JSON files:

1. Checkout the previous commit before this migration
2. No data loss - JSON files are still in the repository
3. Remove MongoDB container: `docker-compose down mongodb`

## Benefits of Migration

### Performance

- ✅ Indexed queries for faster searches
- ✅ Better caching strategies
- ✅ Reduced bundle size (data not in client bundle)

### Scalability

- ✅ Can handle larger datasets
- ✅ Easy to add pagination
- ✅ Support for complex queries

### Features

- ✅ Full-text search capabilities
- ✅ Aggregation queries
- ✅ Future: User-generated content
- ✅ Future: Analytics and tracking
- ✅ Future: Admin panel for content management

### Maintenance

- ✅ Database backups and restore
- ✅ Data versioning
- ✅ Easier to update individual records
- ✅ Better data validation

## API Usage Examples

### Fetch All Resources

```bash
curl http://localhost:3000/api/resources
```

### Filter by Level

```bash
curl "http://localhost:3000/api/resources?level=Beginner"
```

### Search Resources

```bash
curl "http://localhost:3000/api/resources?query=grammar"
```

### Fetch Roadmap

```bash
curl http://localhost:3000/api/roadmap
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

## Troubleshooting

### "Cannot connect to database"

- Check MongoDB is running: `docker-compose ps`
- Check MongoDB logs: `docker-compose logs mongodb`
- Verify MONGODB_URI in .env.local

### "No resources found"

- Run seeding script: `npm run seed`
- Check database has data: `docker-compose exec mongodb mongosh vynsera`

### "Module not found: mongoose"

- Install dependencies: `npm install`

### "API returns 500 error"

- Check Next.js logs: `npm run dev` or `docker-compose logs vynsera`
- Verify MongoDB connection
- Check API route files are properly deployed

## Future Enhancements

### Planned Features

- [ ] Admin API for CRUD operations
- [ ] User authentication and profiles
- [ ] Bookmarking and progress tracking
- [ ] User reviews and ratings
- [ ] Content versioning and history
- [ ] Advanced search with Elasticsearch
- [ ] GraphQL API option
- [ ] Real-time updates with WebSockets

### Database Optimizations

- [ ] Redis caching layer
- [ ] MongoDB Atlas for managed hosting
- [ ] Replica sets for high availability
- [ ] Read replicas for scaling
- [ ] Automated backups

## Support

For issues or questions:

1. Check [DATABASE.md](./DATABASE.md) for detailed documentation
2. Check [SETUP.md](./SETUP.md) for setup instructions
3. Review MongoDB logs
4. Open a GitHub issue

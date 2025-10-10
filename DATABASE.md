# Database Setup Guide

This project uses MongoDB to store resources and roadmap data.

## Local Development Setup

### 1. Create Environment Variables

Create a `.env.local` file in the project root:

```bash
MONGODB_URI=mongodb://localhost:27017/vynsera
```

### 2. Start MongoDB with Docker Compose

```bash
docker-compose up -d mongodb
```

This will start MongoDB on port 27017.

### 3. Seed the Database

Run the seeding script to populate the database with data from JSON files:

```bash
npm run seed
```

This will:

- Connect to MongoDB
- Clear existing data
- Insert resources from `src/data/resources.json`
- Insert roadmap from `src/data/roadmap.json`

### 4. Start the Development Server

```bash
npm run dev
```

The application will now fetch data from MongoDB instead of JSON files.

## Production Deployment

### Docker Compose

The `docker-compose.yml` file includes both the Next.js app and MongoDB:

```bash
npm run deploy
```

This will:

1. Build the Next.js application
2. Start both services (vynsera and mongodb)
3. Create a persistent volume for MongoDB data

### Seed Production Database

After deploying, seed the production database:

```bash
docker-compose exec vynsera npm run seed
```

## API Endpoints

### GET /api/resources

Fetch all resources with optional filters.

**Query Parameters:**

- `query` - Search term (searches title, description, tags)
- `level` - Filter by level (Beginner, Intermediate, Advanced)
- `category` - Filter by category
- `isFree` - Filter by price (true/false)

**Example:**

```
GET /api/resources?level=Beginner&isFree=true
```

### GET /api/roadmap

Fetch the complete learning roadmap.

**Example:**

```
GET /api/roadmap
```

### GET /api/health

Health check endpoint that verifies database connectivity.

**Example:**

```
GET /api/health
```

## Database Models

### Resource Model

- `id` - Unique identifier
- `slug` - URL-friendly slug
- `title` - Resource title
- `titleKorean` - Korean title
- `description` - English description
- `descriptionKorean` - Korean description
- `image` - Image path
- `link` - External link
- `level` - Learning level (Beginner, Intermediate, Advanced)
- `category` - Resource category
- `tags` - Array of tags
- `rating` - Rating (0-5)
- `isFree` - Boolean for free/paid
- `language` - Language of the resource
- `features` - Array of features
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

### Roadmap Model

- `id` - Unique identifier
- `title` - Roadmap title
- `titleKorean` - Korean title
- `description` - English description
- `descriptionKorean` - Korean description
- `level` - Overall level
- `steps` - Array of learning steps
- `totalEstimatedTime` - Total time estimate
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

## Database Management

### Connect to MongoDB Shell

```bash
docker-compose exec mongodb mongosh vynsera
```

### View Collections

```javascript
show collections
```

### Count Documents

```javascript
db.resources.countDocuments();
db.roadmaps.countDocuments();
```

### Query Resources

```javascript
db.resources.find({ level: "Beginner" }).limit(5);
```

### Backup Database

```bash
docker-compose exec mongodb mongodump --db vynsera --out /data/backup
```

### Restore Database

```bash
docker-compose exec mongodb mongorestore --db vynsera /data/backup/vynsera
```

## Troubleshooting

### MongoDB Connection Failed

1. Check if MongoDB is running:

   ```bash
   docker-compose ps
   ```

2. Check MongoDB logs:

   ```bash
   docker-compose logs mongodb
   ```

3. Verify environment variables are set correctly in `.env.local`

### Seeding Script Fails

1. Ensure MongoDB is running and accessible
2. Check that JSON files exist in `src/data/`
3. Verify JSON file format is valid

### API Returns Empty Data

1. Run the seeding script: `npm run seed`
2. Check MongoDB collections have data
3. Restart the Next.js server

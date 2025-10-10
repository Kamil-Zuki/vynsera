# Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

Create a `.env.local` file in the project root with the following content:

```
MONGODB_URI=mongodb://localhost:27017/vynsera
```

### 3. Start MongoDB

Using Docker Compose (recommended):

```bash
docker-compose up -d mongodb
```

Or using Docker directly:

```bash
docker run -d -p 27017:27017 --name vynsera-mongodb mongo:7
```

### 4. Seed the Database

```bash
npm run seed
```

You should see output like:

```
Connecting to MongoDB...
Connected to MongoDB
Reading JSON files...
Clearing existing data...
Inserting 30 resources...
Resources inserted successfully
Inserting roadmap...
Roadmap inserted successfully
Database seeding completed successfully!
Database connection closed
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment

### Using Docker Compose

```bash
npm run deploy
```

Then seed the production database:

```bash
docker-compose exec vynsera npm run seed
```

### Environment Variables

For production, set these environment variables:

- `MONGODB_URI` - MongoDB connection string (default: `mongodb://mongodb:27017/vynsera`)
- `NODE_ENV` - Set to `production`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Seed the database with JSON data
- `npm run lint` - Run ESLint
- `npm run deploy` - Build and deploy with Docker Compose

## Verify Setup

1. Check health endpoint: `curl http://localhost:3000/api/health`
2. Check resources API: `curl http://localhost:3000/api/resources`
3. Check roadmap API: `curl http://localhost:3000/api/roadmap`

## Troubleshooting

See [DATABASE.md](./DATABASE.md) for detailed database management and troubleshooting.

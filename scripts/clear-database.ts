import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vynsera";

async function clearDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all collection names (guard if db is undefined)
    const db = mongoose.connection.db;
    if (!db) {
      console.warn('No DB connection available on mongoose.connection.db');
    } else {
      const collections = await db.collections();
      console.log(`Found ${collections.length} collections:`, collections.map(c => c.collectionName));

      // Clear each collection
      for (const collection of collections) {
        console.log(`Clearing collection: ${collection.collectionName}`);
        await collection.deleteMany({});
      }
    }

    console.log("Database cleared successfully!");
  } catch (error) {
    console.error("Error clearing database:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

clearDatabase();
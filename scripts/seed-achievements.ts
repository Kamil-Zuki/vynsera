/**
 * Script to seed achievements from JSON to MongoDB
 * Run with: npx tsx scripts/seed-achievements.ts
 */

import mongoose from "mongoose";
import Achievement from "../src/models/Achievement";
import achievementsData from "../src/data/achievements.json";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vynsera";

async function seedAchievements() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log(`\n📦 Found ${achievementsData.length} achievements in JSON file`);

    // Clear existing achievements (optional - comment out if you want to keep existing ones)
    const deleteResult = await Achievement.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing achievements`);

    // Insert achievements with order based on array index
    const achievementsWithOrder = achievementsData.map((achievement, index) => ({
      ...achievement,
      order: index,
      active: true,
    }));

    const result = await Achievement.insertMany(achievementsWithOrder);
    console.log(`✅ Successfully seeded ${result.length} achievements to MongoDB`);

    // Display summary by category and rarity
    console.log("\n📊 Summary:");
    
    const categories = await Achievement.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    
    console.log("\nBy Category:");
    categories.forEach((cat) => {
      console.log(`  ${cat._id}: ${cat.count}`);
    });

    const rarities = await Achievement.aggregate([
      { $group: { _id: "$rarity", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    
    console.log("\nBy Rarity:");
    rarities.forEach((rarity) => {
      console.log(`  ${rarity._id}: ${rarity.count}`);
    });

    console.log("\n🎉 Achievement seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding achievements:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the seeding function
seedAchievements();


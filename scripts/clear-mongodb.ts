import connectDB from "../src/lib/mongodb";
import User from "../src/models/User";
import Roadmap from "../src/models/Roadmap";
import Resource from "../src/models/Resource";

async function clearDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();

    console.log("Connected to MongoDB");

    // Clear User collection
    const userCount = await User.countDocuments();
    console.log(`Found ${userCount} user documents. Deleting all...`);
    await User.deleteMany({});
    console.log("All user documents deleted");

    // Clear Roadmap collection
    const roadmapCount = await Roadmap.countDocuments();
    console.log(`Found ${roadmapCount} roadmap documents. Deleting all...`);
    await Roadmap.deleteMany({});
    console.log("All roadmap documents deleted");

    // Clear Resource collection
    const resourceCount = await Resource.countDocuments();
    console.log(`Found ${resourceCount} resource documents. Deleting all...`);
    await Resource.deleteMany({});
    console.log("All resource documents deleted");

    console.log("\nAll collections have been cleared successfully!");
    
    // Close the database connection
    await require("mongoose").disconnect();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error clearing database:", error);
    process.exit(1);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  clearDatabase();
}
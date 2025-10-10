import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/vynsera";

// Define schemas directly in the script to avoid import issues
const ResourceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    titleKorean: String,
    description: { type: String, required: true },
    descriptionKorean: String,
    image: { type: String, required: true },
    link: { type: String, required: true },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    category: { type: String, required: true },
    tags: [String],
    rating: { type: Number, required: true, min: 0, max: 5 },
    isFree: { type: Boolean, required: true },
    language: { type: String, required: true },
    features: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const RoadmapStepSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  titleKorean: String,
  description: { type: String, required: true },
  descriptionKorean: String,
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    required: true,
  },
  order: { type: Number, required: true },
  estimatedTime: { type: String, required: true },
  skills: [String],
  resources: [String],
  completed: { type: Boolean, default: false },
  prerequisites: [String],
});

const RoadmapSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    titleKorean: String,
    description: { type: String, required: true },
    descriptionKorean: String,
    level: { type: String, required: true },
    steps: [RoadmapStepSchema],
    totalEstimatedTime: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Resource =
  mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);
const Roadmap =
  mongoose.models.Roadmap || mongoose.model("Roadmap", RoadmapSchema);

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Read JSON files
    const resourcesPath = path.join(
      process.cwd(),
      "src",
      "data",
      "resources.json"
    );
    const roadmapPath = path.join(process.cwd(), "src", "data", "roadmap.json");

    console.log("Reading JSON files...");
    const resourcesData = JSON.parse(fs.readFileSync(resourcesPath, "utf-8"));
    const roadmapData = JSON.parse(fs.readFileSync(roadmapPath, "utf-8"));

    // Clear existing data
    console.log("Clearing existing data...");
    await Resource.deleteMany({});
    await Roadmap.deleteMany({});

    // Insert resources
    console.log(`Inserting ${resourcesData.length} resources...`);
    await Resource.insertMany(resourcesData);
    console.log("Resources inserted successfully");

    // Insert roadmap
    console.log("Inserting roadmap...");
    await Roadmap.create(roadmapData);
    console.log("Roadmap inserted successfully");

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

seedDatabase();

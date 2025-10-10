import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/vynsera";

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

const Roadmap =
  mongoose.models.Roadmap || mongoose.model("Roadmap", RoadmapSchema);

async function updateRoadmapResources() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const roadmap = await Roadmap.findOne();
    if (!roadmap) {
      console.error("No roadmap found");
      process.exit(1);
    }

    console.log("Updating roadmap resources...\n");

    // Map step IDs to relevant resource IDs
    const resourceMappings: Record<string, string[]> = {
      "hangul-mastery": [
        "ryan-estrada-hangul",
        "professor-yoon-hangul",
        "go-billy-hangul",
        "pinkfong-alphabet",
        "korean-abc-pronunciation",
      ],
      "basic-greetings": [
        "talk-to-me-in-korean-grammar",
        "gobilly-korean-grammar",
        "learn-korean-in-korean-channel",
        "cyber-university-korea-course",
      ],
      "basic-grammar": [
        "talk-to-me-in-korean-grammar",
        "how-to-study-korean-grammar",
        "korean-grammar-in-use",
        "korean-verb-conjugator-app",
      ],
      "numbers-time": [
        "talk-to-me-in-korean-grammar",
        "sogang-korean",
        "naver-dict-korean",
      ],
      "daily-conversations": [
        "talk-to-me-in-korean-grammar",
        "hellotalk",
        "iyagi-ttmik-podcast",
        "comprehensible-korean-refold",
      ],
      "intermediate-grammar": [
        "korean-grammar-in-use",
        "how-to-study-korean-grammar",
        "ultimate-korean-grammar",
        "mirinae-analyzer",
      ],
      "vocabulary-expansion": [
        "refold-ko1k-anki",
        "ttmik-500-words-anki",
        "wiktionary-frequency-list",
        "naver-topik-vocab",
        "naver-dict-korean",
      ],
      "listening-practice": [
        "iyagi-ttmik-podcast",
        "viki-learn-mode",
        "comprehensible-korean-refold",
        "youglish-korean-pronunciation",
        "cyber-university-korea-course",
      ],
      "reading-comprehension": [
        "kids-donga-news",
        "naver-comics-webtoons",
        "korean-grammar-in-use",
        "mirinae-analyzer",
      ],
      "advanced-grammar": [
        "korean-grammar-in-use",
        "ultimate-korean-grammar",
        "pusan-grammar-checker",
        "korean-grammar-dictionary",
      ],
      "cultural-fluency": [
        "viki-learn-mode",
        "voice-of-america-korean-news",
        "spongemind-podcast",
      ],
      "native-level-fluency": [
        "naver-comics-webtoons",
        "viki-learn-mode",
        "hellotalk",
        "voice-of-america-korean-news",
      ],
    };

    // Update each step with mapped resources
    let updatedCount = 0;
    for (const step of roadmap.steps) {
      const resourceIds = resourceMappings[step.id] || [];
      if (resourceIds.length > 0) {
        step.resources = resourceIds;
        updatedCount++;
        console.log(
          `✅ Updated "${step.title}" with ${resourceIds.length} resources`
        );
      }
    }

    await roadmap.save();

    console.log(
      `\n✅ Successfully updated ${updatedCount} steps with resources`
    );
    console.log(`📊 Total steps: ${roadmap.steps.length}`);
  } catch (error) {
    console.error("Error updating roadmap:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  }
}

updateRoadmapResources();

import mongoose, { Schema, models } from "mongoose";

const AchievementSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    titleKorean: String,
    description: {
      type: String,
      required: true,
    },
    descriptionKorean: String,
    icon: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["progress", "streak", "milestone", "special", "exploration"],
      required: true,
    },
    rarity: {
      type: String,
      enum: ["common", "rare", "epic", "legendary"],
      required: true,
    },
    requirement: {
      type: {
        type: String,
        enum: [
          "steps_completed",
          "days_streak",
          "resources_viewed",
          "watchlist_items",
          "total_days",
          "custom",
        ],
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
      additionalConditions: {
        type: Map,
        of: Schema.Types.Mixed,
      },
    },
    reward: {
      xp: Number,
      badge: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
AchievementSchema.index({ category: 1, active: 1 });
AchievementSchema.index({ rarity: 1 });
// Note: id field already has unique: true which creates an index automatically

const Achievement =
  models.Achievement || mongoose.model("Achievement", AchievementSchema);

export default Achievement;


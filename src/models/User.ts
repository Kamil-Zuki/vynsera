import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    emailVerified: Date,
    image: String,
    watchlist: {
      type: [String],
      default: [],
    },
    completedSteps: {
      type: [String],
      default: [],
    },
    preferences: {
      language: {
        type: String,
        enum: ["en", "ko"],
        default: "en",
      },
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    // Achievement and gamification fields
    achievements: {
      type: [{
        achievementId: String,
        unlockedAt: Date,
        progress: Number,
        maxProgress: Number,
      }],
      default: [],
    },
    streakData: {
      currentStreak: {
        type: Number,
        default: 0,
      },
      longestStreak: {
        type: Number,
        default: 0,
      },
      lastActiveDate: {
        type: String,
        default: null,
      },
      streakHistory: {
        type: [String],
        default: [],
      },
    },
    stats: {
      totalStepsCompleted: {
        type: Number,
        default: 0,
      },
      totalResourcesViewed: {
        type: Number,
        default: 0,
      },
      totalWatchlistItems: {
        type: Number,
        default: 0,
      },
      totalDaysActive: {
        type: Number,
        default: 0,
      },
      level: {
        type: Number,
        default: 1,
      },
      xp: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = models.User || mongoose.model("User", UserSchema);

export default User;

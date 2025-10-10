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
  },
  {
    timestamps: true,
  }
);

const User = models.User || mongoose.model("User", UserSchema);

export default User;

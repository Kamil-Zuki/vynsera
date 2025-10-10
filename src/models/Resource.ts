import mongoose, { Schema, models } from "mongoose";

const ResourceSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    titleKorean: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
    descriptionKorean: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    isFree: {
      type: Boolean,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    features: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
ResourceSchema.index({ level: 1 });
ResourceSchema.index({ category: 1 });
ResourceSchema.index({ isFree: 1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({
  title: "text",
  description: "text",
  titleKorean: "text",
  descriptionKorean: "text",
  tags: "text",
});

const Resource = models.Resource || mongoose.model("Resource", ResourceSchema);

export default Resource;

import mongoose, { Schema, models } from "mongoose";

const RoadmapStepSchema = new Schema({
  id: {
    type: String,
    required: true,
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
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  estimatedTime: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    default: [],
  },
  resources: {
    type: [String],
    default: [],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  prerequisites: {
    type: [String],
    default: [],
  },
});

const RoadmapSchema = new Schema(
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
    level: {
      type: String,
      required: true,
    },
    steps: {
      type: [RoadmapStepSchema],
      default: [],
    },
    totalEstimatedTime: {
      type: String,
      required: true,
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

const Roadmap = models.Roadmap || mongoose.model("Roadmap", RoadmapSchema);

export default Roadmap;

import mongoose, { Schema, models } from 'mongoose';

const FriendshipSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    users: { type: [String], required: true },
    since: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Friendship = models.Friendship || mongoose.model('Friendship', FriendshipSchema);
export default Friendship;

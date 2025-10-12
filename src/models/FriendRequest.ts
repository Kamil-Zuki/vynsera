import mongoose, { Schema, models } from 'mongoose';

const FriendRequestSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    fromUserId: { type: String, required: true },
    toUserId: { type: String, required: true },
    message: { type: String },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled'], default: 'pending' },
  },
  { timestamps: true }
);

const FriendRequest = models.FriendRequest || mongoose.model('FriendRequest', FriendRequestSchema);
export default FriendRequest;

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import FriendRequest from '@/models/FriendRequest';
import Friendship from '@/models/Friendship';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();

  const userId = session.user.email;
  const requests = await FriendRequest.find({ toUserId: userId, status: 'pending' }).lean();
  const friendships = await Friendship.find({ users: userId }).lean();

  return NextResponse.json({ requests, friendships });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const { otherUserId } = body;
  if (!otherUserId) return NextResponse.json({ error: 'otherUserId required' }, { status: 400 });
  await connectDB();

  // remove friendship
  await Friendship.deleteOne({ users: { $all: [session.user.email, otherUserId] } });
  return NextResponse.json({ message: 'Unfriended' });
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import FriendRequest from '@/models/FriendRequest';
import User from '@/models/User';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { toUserId, message } = body;
  if (!toUserId) return NextResponse.json({ error: 'toUserId required' }, { status: 400 });

  await connectDB();
  const toUser = await User.findOne({ _id: toUserId }).lean();
  if (!toUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Prevent duplicate existing friendship or pending request
  const existing = await FriendRequest.findOne({ fromUserId: session.user.email, toUserId, status: 'pending' }).lean();
  if (existing) return NextResponse.json({ message: 'Request already pending' }, { status: 200 });

  const fr = await FriendRequest.create({ id: nanoid(), fromUserId: session.user.email, toUserId, message });
  return NextResponse.json({ request: fr });
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import FriendRequest from '@/models/FriendRequest';
import Friendship from '@/models/Friendship';

export async function POST(request: NextRequest, { params }: any) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  const body = await request.json();
  const { action } = body; // 'accept' | 'reject' | 'cancel'
  if (!['accept', 'reject', 'cancel'].includes(action)) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  await connectDB();
  const req = await FriendRequest.findOne({ id }).exec();
  if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

  // Only recipient can accept/reject; sender can cancel
  if (action === 'cancel') {
    if (req.fromUserId !== session.user.email) return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
    req.status = 'cancelled';
    await req.save();
    return NextResponse.json({ message: 'Cancelled' });
  }

  if (req.toUserId !== session.user.email) return NextResponse.json({ error: 'Not allowed' }, { status: 403 });

  if (action === 'reject') {
    req.status = 'rejected';
    await req.save();
    return NextResponse.json({ message: 'Rejected' });
  }

  // Accept
  req.status = 'accepted';
  await req.save();
  // create friendship
  const users = [req.fromUserId, req.toUserId];
  await Friendship.create({ id: `f_${Date.now()}`, users });
  return NextResponse.json({ message: 'Accepted' });
}

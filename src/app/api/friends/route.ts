import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import FriendRequest from '@/models/FriendRequest';
import Friendship from '@/models/Friendship';
import User from '@/models/User';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();

  const userId = session.user.email;

  // incoming pending requests
  const incoming = await FriendRequest.find({ toUserId: userId, status: 'pending' }).lean();
  // outgoing pending requests
  const outgoing = await FriendRequest.find({ fromUserId: userId, status: 'pending' }).lean();
  // friendships
  const friendships = await Friendship.find({ users: userId }).lean();

  // enrich with user info
  const enrichRequest = async (fr: any) => {
    const fromUser = (await User.findOne({ email: fr.fromUserId }).lean()) as any;
    const toUser = (await User.findOne({ email: fr.toUserId }).lean()) as any;
    return { ...fr, fromUser: fromUser ? { name: fromUser.name as string | undefined, email: fromUser.email as string | undefined, image: fromUser.image as string | undefined } : null, toUser: toUser ? { name: toUser.name as string | undefined, email: toUser.email as string | undefined, image: toUser.image as string | undefined } : null };
  };

  const enrichedIncoming = await Promise.all(incoming.map(enrichRequest));
  const enrichedOutgoing = await Promise.all(outgoing.map(enrichRequest));

  const enrichedFriendships = await Promise.all(
    friendships.map(async (f: any) => {
      const otherEmail = (f.users || []).find((u: string) => u !== userId) as string | undefined;
        const other = otherEmail ? (await User.findOne({ email: otherEmail }).lean()) as any : null;
        return { ...f, other: other ? { name: other.name as string | undefined, email: other.email as string | undefined, image: other.image as string | undefined } : { email: otherEmail } };
    })
  );

  return NextResponse.json({ requests: enrichedIncoming, outgoing: enrichedOutgoing, friendships: enrichedFriendships });
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

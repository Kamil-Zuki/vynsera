import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import FriendsList from '@/components/FriendsList';

export default async function FriendsPage() {
  const session = await auth();
  if (!session?.user?.email) {
    // server-side redirect to sign-in page
    redirect('/auth/signin');
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium">Friends</h2>
      <div className="mt-4">
        {/* FriendsList is a client component and will fetch data client-side */}
        <FriendsList />
      </div>
    </div>
  );
}
